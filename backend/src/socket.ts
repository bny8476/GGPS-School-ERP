import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import env from './config/env';
import logger from './utils/logger';
import Conversation from './models/Conversation';
import Notification from './models/Notification';
import Parent from './models/Parent';
import Student from './models/Student';
import StudentParent from './models/StudentParent';

let io: SocketIOServer;
const onlineUserSockets = new Map<string, Set<string>>();

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      role: string;
      permissions?: string[];
      campusId?: string;
      schoolId?: string;
      parentId?: string;
    };
  };
}

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://ggsp-school-erp.vercel.app',
    'https://schoolerp-livid.vercel.app',
    'https://school-erp-bny2.vercel.app',
    env.CLIENT_URL,
  ].filter(Boolean) as string[];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const clean = origin.replace(/\/+$/, '').toLowerCase();
        const isMatched = allowedOrigins.some((o) => o && clean === o.replace(/\/+$/, '').toLowerCase());
        const isDevLocal =
          env.NODE_ENV !== 'production' &&
          (clean.startsWith('http://localhost:') || clean.startsWith('http://127.0.0.1:'));

        if (isMatched || isDevLocal) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin denied: ${origin}`));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Strict Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null) ||
      (socket.handshake.headers?.cookie
        ? socket.handshake.headers.cookie
            .split(';')
            .find((c) => c.trim().startsWith('token='))
            ?.split('=')[1]
        : null);

    if (!token) {
      logger.warn({ socketId: socket.id }, 'Socket connection rejected: No authentication token provided');
      return next(new Error('Authentication token required'));
    }

    try {
      const secret = env.JWT_ACCESS_SECRET;
      const decoded = jwt.verify(token, secret) as any;
      if (!decoded || !decoded.user || !decoded.user.id) {
        logger.warn({ socketId: socket.id }, 'Socket connection rejected: Invalid token payload');
        return next(new Error('Invalid token'));
      }

      // Prohibit students from participating in real-time chat
      const role = String(decoded.user.role || '').toLowerCase();
      if (role === 'student') {
        logger.warn({ socketId: socket.id, userId: decoded.user.id }, 'Socket connection rejected: Students cannot participate in staff/parent chat');
        return next(new Error('Students are not authorized to use chat'));
      }

      socket.data.user = decoded.user;
      next();
    } catch (err: any) {
      logger.warn({ socketId: socket.id, error: err.message }, 'Socket authentication failed');
      return next(new Error('Token verification failed: ' + err.message));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.data.user;
    if (!user || !user.id) {
      socket.disconnect(true);
      return;
    }

    logger.info({ socketId: socket.id, userId: user.id, role: user.role }, 'Authenticated socket client connected');

    // Auto-join authoritative isolated user room and role rooms
    socket.join(`user:${user.id}`);
    if (user.role) socket.join(`role:${user.role}`);
    if (user.campusId) socket.join(`campus:${user.campusId}`);
    if (user.schoolId) socket.join(`school:${user.schoolId}`);
    if (user.parentId) socket.join(`parent:${user.parentId}`);

    // If connected user is a Parent, join rooms for their verified linked children
    if (user.role === 'Parent' && mongoose.connection.readyState === 1) {
      Parent.findOne({
        $or: [{ userId: user.id }, { primaryEmail: (user as any).email }],
      })
        .then(async (parentDoc) => {
          if (parentDoc) {
            socket.join(`parent:${parentDoc._id}`);
            const links = await StudentParent.find({
              parentId: parentDoc._id,
              status: { $ne: 'inactive' },
            }).select('studentId');
            const direct = await Student.find({
              parentId: parentDoc._id,
              status: { $ne: 'Inactive' },
            }).select('_id');
            const studentIds = [
              ...new Set([
                ...links.map((l) => String(l.studentId)),
                ...direct.map((d) => String(d._id)),
              ]),
            ];
            for (const sId of studentIds) {
              socket.join(`student:${sId}`);
            }
            const students = await Student.find({ _id: { $in: studentIds } }).select('classId');
            for (const s of students) {
              if (s.classId) socket.join(`class:${s.classId}`);
            }
          }
        })
        .catch(() => {});
    }

    // Durable Outbox On-Connect Replay: Deliver unread pending notifications missed while offline
    if (mongoose.connection.readyState === 1) {
      Notification.find({
        $or: [
          { recipient: user.id },
          { userId: user.id },
          { targetRole: user.role },
          { targetRole: 'all' },
        ],
        read: false,
        deliveryStatus: { $in: ['Pending', 'Sent'] },
      })
        .sort({ createdAt: -1 })
        .limit(25)
        .then(async (pendingNotifications) => {
          if (pendingNotifications && pendingNotifications.length > 0) {
            socket.emit('notification:replay', pendingNotifications);
            const ids = pendingNotifications.map((n) => n._id);
            await Notification.updateMany(
              { _id: { $in: ids } },
              { $set: { deliveryStatus: 'Delivered', deliveredAt: new Date() } }
            );
            logger.debug(
              { userId: user.id, count: pendingNotifications.length },
              'Replayed pending notifications to newly connected user'
            );
          }
        })
        .catch((err) => {
          logger.warn({ err, userId: user.id }, 'Error during on-connect notification replay');
        });
    }

    // Room subscription handler supporting both 'join_room' and 'join-room'
    const handleJoinRoom = async (roomId: string) => {
      if (!roomId || typeof roomId !== 'string') return;

      // Block joining other user's private rooms
      if (roomId.startsWith('user:') && roomId !== `user:${user.id}`) {
        logger.warn({ socketId: socket.id, roomId, user: user.id }, 'Blocked attempt to join another user private room');
        socket.emit('error', { message: 'Unauthorized room access' });
        return;
      }

      // Check authorization for conversation rooms
      if (roomId.startsWith('conversation:')) {
        const conversationId = roomId.replace('conversation:', '');
        
        // If MongoDB is connected and valid ObjectId, verify user participation
        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(conversationId)) {
          try {
            const conv = await Conversation.findById(conversationId).select('participants');
            if (conv) {
              const isParticipant = conv.participants.some(
                (p: any) => String(p._id || p) === String(user.id)
              );
              if (!isParticipant && user.role !== 'SuperAdmin') {
                logger.warn({ socketId: socket.id, conversationId, user: user.id }, 'Blocked unauthorized conversation room join attempt');
                socket.emit('error', { message: 'Unauthorized conversation room' });
                return;
              }
            }
          } catch (dbErr) {
            logger.warn({ err: dbErr, conversationId }, 'Conversation lookup error on socket join');
          }
        }
      }

      socket.join(roomId);
      logger.debug({ socketId: socket.id, roomId, userId: user.id }, 'Socket joined room');
      socket.emit('room:joined', { room: roomId });
    };

    // Presence Tracking
    const userSockets = onlineUserSockets.get(user.id) || new Set<string>();
    const isNewlyOnline = userSockets.size === 0;
    userSockets.add(socket.id);
    onlineUserSockets.set(user.id, userSockets);

    if (isNewlyOnline) {
      io.emit('presence:update', { userId: user.id, status: 'online' });
    }

    socket.on('presence:get', () => {
      const onlineIds = Array.from(onlineUserSockets.keys());
      socket.emit('presence:list', { onlineUserIds: onlineIds });
    });

    socket.on('join_room', handleJoinRoom);
    socket.on('join-room', handleJoinRoom);
    socket.on('conversation:join', (data: { conversationId?: string }) => {
      if (data?.conversationId) handleJoinRoom(`conversation:${data.conversationId}`);
    });

    // Leave room handlers
    const handleLeaveRoom = (roomId: string) => {
      if (roomId && typeof roomId === 'string') {
        socket.leave(roomId);
        logger.debug({ socketId: socket.id, roomId }, 'Socket left room');
      }
    };

    socket.on('leave_room', handleLeaveRoom);
    socket.on('leave-room', handleLeaveRoom);
    socket.on('conversation:leave', (data: { conversationId?: string }) => {
      if (data?.conversationId) handleLeaveRoom(`conversation:${data.conversationId}`);
    });

    // Real-time typing indicators
    const handleTypingStart = (data: { conversationId?: string; recipientId?: string }) => {
      const payload = {
        conversationId: data?.conversationId,
        userId: user.id,
        role: user.role,
      };

      if (data?.conversationId) {
        socket.to(`conversation:${data.conversationId}`).emit('chat:typing:start', payload);
        socket.to(`conversation:${data.conversationId}`).emit('typing:start', payload);
      }
      if (data?.recipientId) {
        socket.to(`user:${data.recipientId}`).emit('chat:typing:start', payload);
        socket.to(`user:${data.recipientId}`).emit('typing:start', payload);
      }
    };

    const handleTypingStop = (data: { conversationId?: string; recipientId?: string }) => {
      const payload = {
        conversationId: data?.conversationId,
        userId: user.id,
        role: user.role,
      };

      if (data?.conversationId) {
        socket.to(`conversation:${data.conversationId}`).emit('chat:typing:stop', payload);
        socket.to(`conversation:${data.conversationId}`).emit('typing:stop', payload);
      }
      if (data?.recipientId) {
        socket.to(`user:${data.recipientId}`).emit('chat:typing:stop', payload);
        socket.to(`user:${data.recipientId}`).emit('typing:stop', payload);
      }
    };

    socket.on('chat:typing:start', handleTypingStart);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing', (data) => handleTypingStart(data));

    socket.on('chat:typing:stop', handleTypingStop);
    socket.on('typing:stop', handleTypingStop);
    socket.on('stop_typing', (data) => handleTypingStop(data));

    socket.on('disconnect', (reason) => {
      const sockets = onlineUserSockets.get(user.id);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUserSockets.delete(user.id);
          io.emit('presence:update', { userId: user.id, status: 'offline' });
        }
      }
      logger.debug({ socketId: socket.id, userId: user.id, reason }, 'Socket client disconnected');
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

// Safe scoped emission helpers
export const emitToUser = (userId: string, event: string, payload: any): void => {
  try {
    if (io) {
      io.to(`user:${userId}`).emit(event, payload);

      if (event === 'notification:new' && payload?._id && mongoose.connection.readyState === 1) {
        const isOnline = (onlineUserSockets.get(userId)?.size || 0) > 0;
        if (isOnline) {
          Notification.findByIdAndUpdate(payload._id, {
            $set: { deliveryStatus: 'Delivered', deliveredAt: new Date() },
          }).catch(() => null);
        }
      }
    }
  } catch (err) {
    logger.warn({ userId, event }, 'Failed to emit to user socket room');
  }
};

export const emitToConversation = (conversationId: string, event: string, payload: any): void => {
  try {
    if (io) io.to(`conversation:${conversationId}`).emit(event, payload);
  } catch (err) {
    logger.warn({ conversationId, event }, 'Failed to emit to conversation socket room');
  }
};

export const emitToRoom = (room: string, event: string, payload: any): void => {
  try {
    if (io) io.to(room).emit(event, payload);
  } catch (err) {
    logger.warn({ room, event }, 'Failed to emit to socket room');
  }
};

export const emitToRole = (role: string, event: string, payload: any): void => {
  try {
    if (io) io.to(`role:${role}`).emit(event, payload);
  } catch (err) {
    logger.warn({ role, event }, 'Failed to emit to role socket room');
  }
};

export const emitToClass = (classId: string, event: string, payload: any): void => {
  try {
    if (io) io.to(`class:${classId}`).emit(event, payload);
  } catch (err) {
    logger.warn({ classId, event }, 'Failed to emit to class socket room');
  }
};

export const broadcastEvent = (event: string, payload: any): void => {
  try {
    if (io) io.emit(event, payload);
  } catch (err) {
    logger.warn({ event }, 'Failed to broadcast socket event');
  }
};
