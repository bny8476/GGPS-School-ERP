import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ChatMessage from '../models/Chat';
import Conversation from '../models/Conversation';
import Notification from '../models/Notification';
import User from '../models/User';
import Student from '../models/Student';
import Parent from '../models/Parent';
import StudentParent from '../models/StudentParent';
import FileRecord from '../models/FileRecord';
import { emitToUser, emitToConversation, emitToRoom } from '../socket';

// =========================================================================
// IN-MEMORY FALLBACK REPOSITORY (For offline DB / dev resiliency)
// =========================================================================
interface InMemoryConversation {
  _id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  studentPhoto?: string;
  studentRoll?: string;
  parentId: string;
  parentName: string;
  parentRole: string;
  teacherId: string;
  teacherName: string;
  teacherRole: string;
  participants: string[];
  lastMessage?: {
    _id: string;
    message: string;
    senderId: string;
    senderRole: string;
    createdAt: string;
  };
  lastMessageAt: string;
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

interface InMemoryMessage {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    avatar?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    avatar?: string;
  };
  senderRole: string;
  studentId?: string;
  message: string;
  content?: string;
  attachments: string[];
  status: 'sent' | 'delivered' | 'read';
  readBy: string[];
  readAt?: string;
  clientTempId?: string;
  createdAt: string;
  updatedAt: string;
}

const DEMO_TEACHER_ID = '66789abcdef0123456789001';
const DEMO_PARENT_ID = '66789abcdef0123456789002';
const DEMO_STUDENT_ID = '66789abcdef0123456789003';
const DEMO_CONV_ID = '66789abcdef0123456789100';

let memConversations: InMemoryConversation[] = [
  {
    _id: DEMO_CONV_ID,
    studentId: DEMO_STUDENT_ID,
    studentName: 'Aarav Sharma',
    studentGrade: 'LKG - Section A',
    studentPhoto: '/aarav-profile-avatar.png',
    studentRoll: '01',
    parentId: DEMO_PARENT_ID,
    parentName: 'Priya Sharma',
    parentRole: 'Parent',
    teacherId: DEMO_TEACHER_ID,
    teacherName: 'Ms. Ananya Roy',
    teacherRole: 'Teacher',
    participants: [DEMO_TEACHER_ID, DEMO_PARENT_ID],
    lastMessage: {
      _id: 'msg-seed-1',
      message: 'Good morning! Just wanted to share that Aarav participated with great enthusiasm during today’s class.',
      senderId: DEMO_TEACHER_ID,
      senderRole: 'Teacher',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCounts: {
      [DEMO_PARENT_ID]: 1,
      [DEMO_TEACHER_ID]: 0,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

let memMessages: InMemoryMessage[] = [
  {
    _id: 'msg-seed-1',
    conversationId: DEMO_CONV_ID,
    sender: {
      _id: DEMO_TEACHER_ID,
      firstName: 'Ananya',
      lastName: 'Roy',
      role: 'Teacher',
      email: 'teacher@school.com',
      avatar: '/teacher-ananya-roy.jpg',
    },
    recipient: {
      _id: DEMO_PARENT_ID,
      firstName: 'Priya',
      lastName: 'Sharma',
      role: 'Parent',
      email: 'parent@school.com',
      avatar: '/aarav-profile-avatar.png',
    },
    senderRole: 'Teacher',
    studentId: DEMO_STUDENT_ID,
    message: 'Good morning! Just wanted to share that Aarav participated with great enthusiasm during today’s class.',
    attachments: [],
    status: 'sent',
    readBy: [DEMO_TEACHER_ID],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Helper to check authorization between users (Parent <-> Teacher RBAC)
async function isAuthorizedCommunication(
  senderId: string,
  senderRole: string,
  recipientId: string,
  _studentId?: string
): Promise<boolean> {
  const normalizedRole = senderRole.toLowerCase();

  // SuperAdmins & Admins can message anyone
  if (normalizedRole === 'superadmin' || normalizedRole === 'admin') {
    return true;
  }

  // If DB is offline, allow demo pairing
  if (mongoose.connection.readyState !== 1) {
    if (
      (senderId === DEMO_TEACHER_ID && recipientId === DEMO_PARENT_ID) ||
      (senderId === DEMO_PARENT_ID && recipientId === DEMO_TEACHER_ID)
    ) {
      return true;
    }
    return true; // Dev resilient
  }

  try {
    if (normalizedRole === 'teacher') {
      // Teacher -> Parent or Admin
      const recipientUser = await User.findById(recipientId).select('role');
      if (!recipientUser) return false;

      const recipientRole = String((recipientUser.role as any)?.name || recipientUser.role || '').toLowerCase();
      if (recipientRole !== 'parent' && recipientRole !== 'superadmin' && recipientRole !== 'admin') {
        return false;
      }
      return true;
    } else if (normalizedRole === 'parent') {
      // Parent -> Teacher or Admin
      const recipientUser = await User.findById(recipientId).select('role');
      if (!recipientUser) return false;

      const recipientRole = String((recipientUser.role as any)?.name || recipientUser.role || '').toLowerCase();
      if (recipientRole !== 'teacher' && recipientRole !== 'superadmin' && recipientRole !== 'admin') {
        return false;
      }
      return true;
    }
  } catch (err) {
    console.warn('Authorization verification notice:', err);
  }

  return true;
}

/**
 * @desc Get list of conversations for current user
 * @route GET /api/v1/messages/conversations or GET /api/v1/chat/conversations
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { studentId } = req.query;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      let userConvs = memConversations.filter((c) =>
        c.participants.includes(String(currentUserId))
      );

      if (studentId) {
        userConvs = userConvs.filter((c) => c.studentId === String(studentId));
      }

      return res.json({
        success: true,
        data: userConvs.map((c) => {
          const isUserTeacher = c.teacherId === currentUserId;
          const otherUserId = isUserTeacher ? c.parentId : c.teacherId;
          const otherUserName = isUserTeacher ? c.parentName : c.teacherName;
          const otherUserRole = isUserTeacher ? c.parentRole : c.teacherRole;

          return {
            _id: c._id,
            studentId: c.studentId,
            student: {
              _id: c.studentId,
              name: c.studentName,
              grade: c.studentGrade,
              studentPhoto: c.studentPhoto || '/aarav-profile-avatar.png',
              rollNumber: c.studentRoll || '01',
            },
            participant: {
              _id: otherUserId,
              name: otherUserName,
              role: otherUserRole,
              email: isUserTeacher ? 'parent@school.com' : 'teacher@school.com',
              avatar: isUserTeacher ? '/aarav-profile-avatar.png' : '/teacher-ananya-roy.jpg',
            },
            lastMessage: c.lastMessage,
            unreadCount: c.unreadCounts[currentUserId] || 0,
            updatedAt: c.updatedAt,
          };
        }),
      });
    }

    // 2. MongoDB mode
    const currentObjectId = new mongoose.Types.ObjectId(currentUserId);

    const query: Record<string, any> = {
      participants: currentObjectId,
    };

    if (studentId && mongoose.Types.ObjectId.isValid(studentId as string)) {
      query.studentId = new mongoose.Types.ObjectId(studentId as string);
    }

    let conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'firstName lastName role email avatar')
      .populate('studentId', 'firstName lastName grade section admissionNumber studentPhoto rollNumber')
      .populate('teacherId', 'firstName lastName role email avatar')
      .populate('parentId', 'firstName lastName role email avatar');

    // Auto-create initial conversation if none exists for Teacher or Parent
    if (conversations.length === 0) {
      const userRole = (req.user?.role || '').toLowerCase();
      if (userRole === 'teacher') {
        const sampleParent = await User.findOne({ email: 'parent@school.com' });
        const sampleStudent = await Student.findOne();
        if (sampleParent) {
          const newConv = await Conversation.create({
            parentId: sampleParent._id,
            teacherId: currentObjectId,
            studentId: sampleStudent?._id,
            participants: [currentObjectId, sampleParent._id],
            unreadCounts: {},
            lastMessageAt: new Date(),
          });
          conversations = [
            await Conversation.findById(newConv._id)
              .populate('participants', 'firstName lastName role email avatar')
              .populate('studentId', 'firstName lastName grade section admissionNumber studentPhoto rollNumber')
              .populate('teacherId', 'firstName lastName role email avatar')
              .populate('parentId', 'firstName lastName role email avatar'),
          ];
        }
      } else if (userRole === 'parent') {
        const sampleTeacher = await User.findOne({ email: 'teacher@school.com' });
        const sampleStudent = await Student.findOne();
        if (sampleTeacher) {
          const newConv = await Conversation.create({
            parentId: currentObjectId,
            teacherId: sampleTeacher._id,
            studentId: sampleStudent?._id,
            participants: [currentObjectId, sampleTeacher._id],
            unreadCounts: {},
            lastMessageAt: new Date(),
          });
          conversations = [
            await Conversation.findById(newConv._id)
              .populate('participants', 'firstName lastName role email avatar')
              .populate('studentId', 'firstName lastName grade section admissionNumber studentPhoto rollNumber')
              .populate('teacherId', 'firstName lastName role email avatar')
              .populate('parentId', 'firstName lastName role email avatar'),
          ];
        }
      }
    }

    const formatted = conversations.map((conv: any) => {
      const otherParticipant = conv.participants.find(
        (p: any) => String(p._id || p) !== currentUserId
      );

      const unread = conv.unreadCounts?.[currentUserId] || 0;

      const sid = conv.studentId?._id ? String(conv.studentId._id) : (conv.studentId ? String(conv.studentId) : '');
      return {
        _id: conv._id,
        studentId: sid,
        student: conv.studentId
          ? {
              _id: sid,
              name: conv.studentId.firstName ? `${conv.studentId.firstName} ${conv.studentId.lastName}` : (conv.studentName || 'Student'),
              grade: conv.studentId.grade || conv.studentGrade || '',
              section: conv.studentId.section || '',
              admissionNumber: conv.studentId.admissionNumber || '',
              rollNumber: conv.studentId.rollNumber || '01',
              studentPhoto: conv.studentId.studentPhoto || conv.studentPhoto || '/aarav-profile-avatar.png',
            }
          : null,
        participant: otherParticipant
          ? {
              _id: otherParticipant._id,
              name: `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || 'School Contact',
              role: otherParticipant.role,
              email: otherParticipant.email,
              avatar: otherParticipant.avatar || (otherParticipant.role === 'Teacher' ? '/teacher-ananya-roy.jpg' : '/aarav-profile-avatar.png'),
            }
          : null,
        lastMessage: conv.lastMessage,
        unreadCount: unread,
        updatedAt: conv.updatedAt,
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
  }
};

const getParamString = (val: string | string[] | undefined): string => {
  if (!val) return '';
  return Array.isArray(val) ? val[0] : val;
};

/**
 * @desc Get a single conversation by ID
 * @route GET /api/v1/messages/conversations/:conversationId
 */
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const conversationId = getParamString(req.params.conversationId);

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      const conv = memConversations.find(
        (c) => c._id === conversationId && c.participants.includes(String(currentUserId))
      );
      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      const isUserTeacher = conv.teacherId === currentUserId;
      const otherUserId = isUserTeacher ? conv.parentId : conv.teacherId;
      const otherUserName = isUserTeacher ? conv.parentName : conv.teacherName;
      const otherUserRole = isUserTeacher ? conv.parentRole : conv.teacherRole;

      return res.json({
        success: true,
        data: {
          _id: conv._id,
          student: {
            _id: conv.studentId,
            name: conv.studentName,
            grade: conv.studentGrade,
            studentPhoto: conv.studentPhoto,
            rollNumber: conv.studentRoll,
          },
          participant: {
            _id: otherUserId,
            name: otherUserName,
            role: otherUserRole,
            email: isUserTeacher ? 'parent@school.com' : 'teacher@school.com',
            avatar: isUserTeacher ? '/aarav-profile-avatar.png' : '/teacher-ananya-roy.jpg',
          },
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCounts[currentUserId] || 0,
          updatedAt: conv.updatedAt,
        },
      });
    }

    // 2. MongoDB mode
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
    }

    const conv = await Conversation.findById(conversationId)
      .populate('participants', 'firstName lastName role email avatar')
      .populate('studentId', 'firstName lastName grade section admissionNumber studentPhoto rollNumber')
      .populate('teacherId', 'firstName lastName role email avatar')
      .populate('parentId', 'firstName lastName role email avatar');

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conv.participants.some(
      (p: any) => String(p._id || p) === currentUserId
    );
    if (!isParticipant && req.user?.role !== 'SuperAdmin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to view this conversation' });
    }

    const otherParticipant = conv.participants.find(
      (p: any) => String(p._id || p) !== currentUserId
    );

    res.json({
      success: true,
      data: {
        _id: conv._id,
        student: conv.studentId,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCounts?.[currentUserId] || 0,
        updatedAt: conv.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving conversation', error: error.message });
  }
};

/**
 * @desc Create or retrieve an existing conversation
 * @route POST /api/v1/messages/conversations or POST /api/v1/chat/conversations
 */
export const createConversation = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id;
    const senderRole = req.user?.role || 'User';
    const { recipientId, studentId } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'recipientId is required' });
    }

    // Check authorization between users
    const isAuth = await isAuthorizedCommunication(senderId, senderRole, recipientId, studentId);
    if (!isAuth) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to start a chat with this user' });
    }

    // 1. In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      let existing = memConversations.find(
        (c) =>
          c.participants.includes(senderId) &&
          c.participants.includes(recipientId) &&
          (!studentId || c.studentId === studentId)
      );

      if (!existing) {
        const isTeacher = senderRole.toLowerCase() === 'teacher';
        existing = {
          _id: `conv-${Date.now()}`,
          studentId: studentId || DEMO_STUDENT_ID,
          studentName: 'Aarav Sharma',
          studentGrade: 'LKG - Section A',
          studentPhoto: '/aarav-profile-avatar.png',
          studentRoll: '01',
          parentId: isTeacher ? recipientId : senderId,
          parentName: isTeacher ? 'Priya Sharma' : 'Priya Sharma',
          parentRole: 'Parent',
          teacherId: isTeacher ? senderId : recipientId,
          teacherName: isTeacher ? 'Ms. Ananya Roy' : 'Ms. Ananya Roy',
          teacherRole: 'Teacher',
          participants: [senderId, recipientId],
          lastMessageAt: new Date().toISOString(),
          unreadCounts: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memConversations.push(existing);
      }

      return res.status(201).json({
        success: true,
        data: existing,
      });
    }

    // 2. MongoDB mode
    const senderObjId = new mongoose.Types.ObjectId(senderId);
    const recipientObjId = new mongoose.Types.ObjectId(recipientId);

    const filter: Record<string, any> = {
      participants: { $all: [senderObjId, recipientObjId] },
    };
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      filter.studentId = new mongoose.Types.ObjectId(studentId);
    }

    let conv = await Conversation.findOne(filter)
      .populate('participants', 'firstName lastName role email avatar')
      .populate('studentId', 'firstName lastName grade section admissionNumber studentPhoto rollNumber');

    if (!conv) {
      const isTeacher = senderRole.toLowerCase() === 'teacher';
      const newConv = await Conversation.create({
        teacherId: isTeacher ? senderObjId : recipientObjId,
        parentId: isTeacher ? recipientObjId : senderObjId,
        studentId: studentId && mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : undefined,
        participants: [senderObjId, recipientObjId],
        unreadCounts: {},
        lastMessageAt: new Date(),
      });

      conv = await Conversation.findById(newConv._id)
        .populate('participants', 'firstName lastName role email avatar')
        .populate('studentId', 'firstName lastName grade section admissionNumber studentPhoto rollNumber');
    }

    res.status(201).json({
      success: true,
      data: conv,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating conversation', error: error.message });
  }
};

/**
 * @desc Get messages for a conversation or recipient
 * @route GET /api/v1/messages or GET /api/v1/messages/conversations/:conversationId/messages
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const conversationId = getParamString(req.params.conversationId) || (req.query.conversationId as string);
    const recipientId = req.query.recipientId as string;
    const { page = 1, limit = 50 } = req.query;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;

    // 1. In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      let filtered = memMessages.filter((m) => {
        if (conversationId) {
          return m.conversationId === conversationId;
        }
        if (recipientId) {
          return (
            (m.sender._id === currentUserId && m.recipient._id === recipientId) ||
            (m.sender._id === recipientId && m.recipient._id === currentUserId)
          );
        }
        return false;
      });

      // Sort chronological and ensure both content and message properties are present
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const normalizedMessages = filtered.map((m) => ({
        ...m,
        content: m.content || m.message,
        message: m.message || m.content,
      }));

      return res.json({
        success: true,
        data: normalizedMessages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limitNum) || 1,
        },
      });
    }

    // 2. MongoDB mode
    let targetConversationId = conversationId;

    if (!targetConversationId && recipientId) {
      const conv = await Conversation.findOne({
        participants: { $all: [new mongoose.Types.ObjectId(currentUserId), new mongoose.Types.ObjectId(recipientId)] },
      });
      if (conv) {
        targetConversationId = conv._id.toString();
      }
    }

    if (!targetConversationId) {
      return res.status(400).json({ success: false, message: 'conversationId or valid recipientId is required' });
    }

    // IDOR / Security Check: Ensure user is authorized participant
    const conversation = await Conversation.findById(targetConversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p: any) => String(p._id || p) === currentUserId
    );

    if (!isParticipant && req.user?.role !== 'SuperAdmin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to view this conversation' });
    }

    const query = { conversationId: targetConversationId };
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      ChatMessage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('sender', 'firstName lastName role email avatar')
        .populate('recipient', 'firstName lastName role email avatar')
        .populate('studentId', 'firstName lastName grade section'),
      ChatMessage.countDocuments(query),
    ]);

    // Chronological order for thread UI
    const chronological = messages.reverse();

    res.json({
      success: true,
      data: chronological,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving messages', error: error.message });
  }
};

/**
 * @desc Send a real-time message
 * @route POST /api/v1/messages or POST /api/v1/messages/conversations/:conversationId/messages
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.id;
    const senderRole = req.user?.role || 'User';
    const conversationIdParam = getParamString(req.params.conversationId);
    const {
      conversationId: bodyConversationId,
      recipientId,
      studentId,
      message,
      content,
      attachments,
      clientTempId,
      clientMessageId,
    } = req.body;

    const targetConvId = conversationIdParam || bodyConversationId;
    const messageText = (message || content || '').trim();
    const effectiveTempId = clientTempId || clientMessageId;

    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!messageText && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message text or attachments required' });
    }

    // 1. In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      let conv = memConversations.find(
        (c) => c._id === targetConvId || (recipientId && c.participants.includes(recipientId))
      );

      const targetRecipientId = recipientId || (conv ? conv.participants.find((p) => p !== senderId) : DEMO_PARENT_ID);

      if (!conv) {
        conv = {
          _id: `conv-${Date.now()}`,
          studentId: studentId || DEMO_STUDENT_ID,
          studentName: 'Aarav Sharma',
          studentGrade: 'LKG - Section A',
          studentPhoto: '/aarav-profile-avatar.png',
          studentRoll: '01',
          parentId: senderRole.toLowerCase() === 'parent' ? senderId : (targetRecipientId || DEMO_PARENT_ID),
          parentName: 'Priya Sharma',
          parentRole: 'Parent',
          teacherId: senderRole.toLowerCase() === 'teacher' ? senderId : (targetRecipientId || DEMO_TEACHER_ID),
          teacherName: 'Ms. Ananya Roy',
          teacherRole: 'Teacher',
          participants: [senderId, targetRecipientId || DEMO_PARENT_ID],
          lastMessageAt: new Date().toISOString(),
          unreadCounts: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memConversations.push(conv);
      }

      const newMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const serverTimestamp = new Date().toISOString();

      const newMemMsg: InMemoryMessage = {
        _id: newMsgId,
        conversationId: conv._id,
        sender: {
          _id: senderId,
          firstName: senderRole.toLowerCase() === 'teacher' ? 'Ananya' : 'Priya',
          lastName: senderRole.toLowerCase() === 'teacher' ? 'Roy' : 'Sharma',
          role: senderRole,
          email: senderRole.toLowerCase() === 'teacher' ? 'teacher@school.com' : 'parent@school.com',
          avatar: senderRole.toLowerCase() === 'teacher' ? '/teacher-ananya-roy.jpg' : '/aarav-profile-avatar.png',
        },
        recipient: {
          _id: targetRecipientId,
          firstName: senderRole.toLowerCase() === 'teacher' ? 'Priya' : 'Ananya',
          lastName: senderRole.toLowerCase() === 'teacher' ? 'Sharma' : 'Roy',
          role: senderRole.toLowerCase() === 'teacher' ? 'Parent' : 'Teacher',
          email: senderRole.toLowerCase() === 'teacher' ? 'parent@school.com' : 'teacher@school.com',
          avatar: senderRole.toLowerCase() === 'teacher' ? '/aarav-profile-avatar.png' : '/teacher-ananya-roy.jpg',
        },
        senderRole,
        studentId: conv.studentId,
        message: messageText,
        attachments: attachments || [],
        status: 'sent',
        readBy: [senderId],
        clientTempId: effectiveTempId,
        createdAt: serverTimestamp,
        updatedAt: serverTimestamp,
      };

      memMessages.push(newMemMsg);

      // Update in-memory conversation
      conv.lastMessage = {
        _id: newMsgId,
        message: messageText,
        senderId,
        senderRole,
        createdAt: serverTimestamp,
      };
      conv.lastMessageAt = serverTimestamp;
      conv.unreadCounts[targetRecipientId] = (conv.unreadCounts[targetRecipientId] || 0) + 1;
      conv.updatedAt = serverTimestamp;

      // Deliver via Socket.IO
      emitToConversation(conv._id, 'chat:message:new', newMemMsg);
      emitToConversation(conv._id, 'message:new', newMemMsg);
      emitToUser(targetRecipientId, 'chat:message:new', newMemMsg);
      emitToUser(targetRecipientId, 'message:new', newMemMsg);
      emitToUser(targetRecipientId, 'chat:unread:updated', { conversationId: conv._id, unreadCount: conv.unreadCounts[targetRecipientId] });
      emitToUser(targetRecipientId, 'notification:created', {
        title: `New message from ${newMemMsg.sender.firstName} ${newMemMsg.sender.lastName}`,
        message: messageText,
        type: 'message',
        entityType: 'Conversation',
        entityId: conv._id,
      });
      emitToUser(senderId, 'chat:message:sent', newMemMsg);

      return res.status(201).json({
        success: true,
        data: newMemMsg,
      });
    }

    // 2. MongoDB mode
    let conv: any = null;

    if (targetConvId && mongoose.Types.ObjectId.isValid(targetConvId)) {
      conv = await Conversation.findById(targetConvId);
    } else if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
      conv = await Conversation.findOne({
        participants: { $all: [new mongoose.Types.ObjectId(senderId), new mongoose.Types.ObjectId(recipientId)] },
      });

      if (!conv) {
        // Authorize new conversation creation
        const isAuth = await isAuthorizedCommunication(senderId, senderRole, recipientId, studentId);
        if (!isAuth) {
          return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to start a chat with this user' });
        }

        const isTeacher = senderRole.toLowerCase() === 'teacher';
        conv = await Conversation.create({
          teacherId: isTeacher ? senderId : recipientId,
          parentId: isTeacher ? recipientId : senderId,
          studentId: studentId && mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : undefined,
          participants: [new mongoose.Types.ObjectId(senderId), new mongoose.Types.ObjectId(recipientId)],
          unreadCounts: {},
          lastMessageAt: new Date(),
        });
      }
    }

    if (!conv) {
      return res.status(404).json({ success: false, message: 'Valid conversation or recipient ID required' });
    }

    // Verify participation (Prevent IDOR)
    const isParticipant = conv.participants.some(
      (p: any) => String(p._id || p) === senderId
    );
    if (!isParticipant && senderRole !== 'SuperAdmin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant in this conversation' });
    }

    const otherParticipantId = conv.participants.find(
      (p: any) => String(p._id || p) !== senderId
    );
    const targetRecipientId = String(otherParticipantId?._id || otherParticipantId);

    // Save message to MongoDB
    const serverTimestamp = new Date();
    const newMsg = await ChatMessage.create({
      conversationId: conv._id,
      sender: new mongoose.Types.ObjectId(senderId),
      senderRole,
      recipient: new mongoose.Types.ObjectId(targetRecipientId),
      studentId: conv.studentId,
      message: messageText,
      attachments: attachments || [],
      status: 'sent',
      readBy: [new mongoose.Types.ObjectId(senderId)],
      clientTempId: effectiveTempId || undefined,
      createdAt: serverTimestamp,
      updatedAt: serverTimestamp,
    });

    // Update conversation
    const currentUnread = conv.unreadCounts?.[targetRecipientId] || 0;
    conv.lastMessage = {
      _id: newMsg._id.toString(),
      message: messageText,
      senderId: new mongoose.Types.ObjectId(senderId),
      senderRole,
      createdAt: serverTimestamp,
    };
    conv.lastMessageAt = serverTimestamp;
    conv.unreadCounts = {
      ...(conv.unreadCounts || {}),
      [targetRecipientId]: currentUnread + 1,
    };
    await conv.save();

    // Populate saved message
    const populated = await ChatMessage.findById(newMsg._id)
      .populate('sender', 'firstName lastName role email avatar')
      .populate('recipient', 'firstName lastName role email avatar')
      .populate('studentId', 'firstName lastName grade section');

    // Create Notification in DB
    try {
      const senderName = populated?.sender ? `${populated.sender.firstName} ${populated.sender.lastName}` : (senderRole || 'New Message');
      await Notification.create({
        recipient: new mongoose.Types.ObjectId(targetRecipientId),
        userId: new mongoose.Types.ObjectId(targetRecipientId),
        studentId: conv.studentId,
        entityType: 'Conversation',
        entityId: conv._id,
        title: `New message from ${senderName}`,
        message: messageText.length > 80 ? messageText.substring(0, 80) + '...' : messageText,
        type: 'message',
        priority: 'normal',
        read: false,
      });
    } catch (notifErr) {
      console.warn('Notification creation notice:', notifErr);
    }

    // Deliver via Socket.IO
    emitToConversation(conv._id.toString(), 'chat:message:new', populated);
    emitToConversation(conv._id.toString(), 'message:new', populated);
    emitToUser(targetRecipientId, 'chat:message:new', populated);
    emitToUser(targetRecipientId, 'message:new', populated);
    emitToUser(targetRecipientId, 'chat:unread:updated', { conversationId: conv._id, unreadCount: currentUnread + 1 });
    emitToUser(targetRecipientId, 'notification:created', {
      title: `New message from ${populated?.sender?.firstName || 'Teacher/Parent'}`,
      message: messageText,
      type: 'message',
      entityType: 'Conversation',
      entityId: conv._id,
    });
    emitToUser(senderId, 'chat:message:sent', populated);

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

/**
 * @desc Mark messages as read in a conversation
 * @route PATCH /api/v1/messages/read or PATCH /api/v1/messages/conversations/:conversationId/read
 */
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const conversationIdParam = getParamString(req.params.conversationId);
    const { conversationId: bodyConversationId, senderId } = req.body || {};
    const conversationId = conversationIdParam || bodyConversationId;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      const readAtTime = new Date().toISOString();

      memMessages.forEach((m) => {
        if (
          (conversationId && m.conversationId === conversationId) ||
          (senderId && m.sender._id === senderId && m.recipient._id === currentUserId)
        ) {
          if (!m.readBy.includes(currentUserId)) {
            m.readBy.push(currentUserId);
            m.status = 'read';
            m.readAt = readAtTime;
          }
        }
      });

      const conv = memConversations.find(
        (c) => c._id === conversationId || (senderId && c.participants.includes(senderId))
      );
      if (conv) {
        if (!conv.unreadCounts) conv.unreadCounts = {};
        conv.unreadCounts[currentUserId] = 0;
        const otherParticipantId = conv.participants.find((p) => p !== currentUserId);

        if (otherParticipantId) {
          emitToUser(otherParticipantId, 'chat:message:read', {
            conversationId: conv._id,
            readBy: currentUserId,
            readAt: readAtTime,
          });
          emitToUser(otherParticipantId, 'message:read', {
            conversationId: conv._id,
            readBy: currentUserId,
            readAt: readAtTime,
          });
        }
      }

      emitToUser(currentUserId, 'chat:unread:updated', { conversationId: conv?._id, unreadCount: 0 });

      return res.json({ success: true, message: 'Messages marked as read' });
    }

    // 2. MongoDB mode
    const currentObjectId = new mongoose.Types.ObjectId(currentUserId);
    const readAtTime = new Date();

    const query: Record<string, any> = {
      recipient: currentObjectId,
      status: { $ne: 'read' },
    };

    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      query.conversationId = new mongoose.Types.ObjectId(conversationId);
    } else if (senderId && mongoose.Types.ObjectId.isValid(senderId)) {
      query.sender = new mongoose.Types.ObjectId(senderId);
    }

    await ChatMessage.updateMany(query, {
      $addToSet: { readBy: currentObjectId },
      $set: { status: 'read', readAt: readAtTime },
    });

    // Reset unread count on conversation
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      const conv = await Conversation.findById(conversationId);
      if (conv) {
        conv.unreadCounts = {
          ...(conv.unreadCounts || {}),
          [currentUserId]: 0,
        };
        await conv.save();

        const otherParticipant = conv.participants.find(
          (p: any) => String(p._id || p) !== currentUserId
        );
        if (otherParticipant) {
          const otherId = String(otherParticipant._id || otherParticipant);
          emitToUser(otherId, 'chat:message:read', {
            conversationId,
            readBy: currentUserId,
            readAt: readAtTime,
          });
          emitToUser(otherId, 'message:read', {
            conversationId,
            readBy: currentUserId,
            readAt: readAtTime,
          });
        }
      }
    }

    emitToUser(currentUserId, 'chat:unread:updated', { conversationId, unreadCount: 0 });

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error marking messages as read', error: error.message });
  }
};

/**
 * @desc Get total unread message count for authenticated user
 * @route GET /api/v1/messages/unread-count or GET /api/v1/chat/unread-count
 */
export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      let totalUnread = 0;
      memConversations.forEach((c) => {
        if (c.participants.includes(currentUserId)) {
          totalUnread += (c.unreadCounts && c.unreadCounts[currentUserId]) || 0;
        }
      });
      return res.json({
        success: true,
        unreadCount: totalUnread,
        count: totalUnread,
        data: { unreadCount: totalUnread, count: totalUnread },
      });
    }

    // 2. MongoDB mode
    const currentObjectId = new mongoose.Types.ObjectId(currentUserId);

    const count = await ChatMessage.countDocuments({
      recipient: currentObjectId,
      status: { $ne: 'read' },
      readBy: { $ne: currentObjectId },
    });

    res.json({
      success: true,
      unreadCount: count,
      count,
      data: { unreadCount: count, count },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error getting unread count', error: error.message });
  }
};

/**
 * @desc Get authorized chat contacts for current user
 * @route GET /api/v1/messages/contacts or GET /api/v1/chat/contacts
 */
export const getContacts = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const userRole = (req.user?.role || '').toLowerCase();

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // In-Memory fallback mode
    if (mongoose.connection.readyState !== 1) {
      if (userRole === 'teacher') {
        return res.json({
          success: true,
          contacts: [
            {
              _id: DEMO_PARENT_ID,
              name: 'Priya Sharma',
              role: 'Parent',
              email: 'parent@school.com',
              avatar: '/aarav-profile-avatar.png',
              student: {
                _id: DEMO_STUDENT_ID,
                name: 'Aarav Sharma',
                grade: 'LKG - Section A',
                rollNumber: '01',
                studentPhoto: '/aarav-profile-avatar.png',
              },
            },
          ],
        });
      } else {
        return res.json({
          success: true,
          contacts: [
            {
              _id: DEMO_TEACHER_ID,
              name: 'Ms. Ananya Roy',
              role: 'Teacher',
              email: 'teacher@school.com',
              designation: 'Class Teacher - LKG A',
              avatar: '/teacher-ananya-roy.jpg',
            },
          ],
        });
      }
    }

    // MongoDB mode
    if (userRole === 'teacher') {
      const students = await Student.find({ status: 'Active' })
        .populate('parentId')
        .limit(40);

      const contacts = students
        .filter((s) => s.parentId)
        .map((s: any) => ({
          _id: s.parentId?.userId || s.parentId?._id,
          name: s.parentId?.motherName || s.parentId?.fatherName || 'Parent Guardian',
          role: 'Parent',
          email: s.parentId?.primaryEmail || 'parent@school.com',
          avatar: '/aarav-profile-avatar.png',
          student: {
            _id: s._id,
            name: `${s.firstName} ${s.lastName}`,
            grade: s.grade,
            section: s.section,
            rollNumber: s.rollNumber || '01',
            admissionNumber: s.admissionNumber,
            studentPhoto: s.studentPhoto || '/aarav-profile-avatar.png',
          },
        }));

      return res.json({ success: true, contacts });
    } else {
      // Parent: Find assigned teachers associated with the child's class/section
      const { childId } = req.query;
      const parent = await Parent.findOne({
        $or: [{ userId: currentUserId }, { primaryEmail: (req.user as any)?.email }],
      });

      if (!parent) {
        return res.json({ success: true, contacts: [] });
      }

      // Find parent's verified linked children
      const links = await StudentParent.find({
        parentId: parent._id,
        status: { $ne: 'inactive' },
      }).select('studentId');
      const direct = await Student.find({
        parentId: parent._id,
        status: { $ne: 'Inactive' },
      }).select('_id');
      const allowedStudentIds = [
        ...new Set([
          ...links.map((l) => String(l.studentId)),
          ...direct.map((d) => String(d._id)),
        ]),
      ];

      if (allowedStudentIds.length === 0) {
        return res.json({ success: true, contacts: [] });
      }

      let targetClassIds: any[] = [];
      if (childId && typeof childId === 'string') {
        if (!allowedStudentIds.includes(childId)) {
          return res.status(403).json({
            success: false,
            message: "Access denied: You don't have permission to contact teachers for this child.",
          });
        }
        const student = await Student.findById(childId);
        if (student?.classId) targetClassIds.push(student.classId);
      } else {
        const students = await Student.find({ _id: { $in: allowedStudentIds } }).select('classId');
        targetClassIds = students.map((s) => s.classId).filter(Boolean);
      }

      const teacherQuery: Record<string, any> = { isActive: true };
      if (targetClassIds.length > 0) {
        teacherQuery.$or = [
          { 'teachingAssignments.classId': { $in: targetClassIds } },
          { assignedClass: { $in: targetClassIds.map(String) } },
        ];
      }

      let teachers = await User.find(teacherQuery)
        .populate({
          path: 'role',
          match: { name: 'Teacher' },
        })
        .limit(25);

      teachers = teachers.filter((t) => t.role);

      // Fallback: If no class-specific teacher was configured, return school teachers
      if (teachers.length === 0) {
        const allTeachers = await User.find({ isActive: true })
          .populate({
            path: 'role',
            match: { name: 'Teacher' },
          })
          .limit(10);
        teachers = allTeachers.filter((t) => t.role);
      }

      const contacts = teachers.map((t: any) => ({
        _id: t._id,
        name: `${t.firstName} ${t.lastName}`,
        role: 'Teacher',
        email: t.email,
        designation: t.designation || 'Class Educator',
        avatar: t.avatar || '/teacher-ananya-roy.jpg',
      }));

      return res.json({ success: true, contacts });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving contacts', error: error.message });
  }
};

/**
 * @desc Upload chat attachment (Image, PDF, Document)
 * @route POST /api/v1/messages/attachments or POST /api/v1/chat/attachments
 */
export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { fileName, mimeType, base64Data, size } = req.body;

    if (!fileName || !base64Data) {
      return res.status(400).json({ success: false, message: 'fileName and base64Data are required' });
    }

    // Validate size (< 10MB)
    const approximateSizeBytes = size || Buffer.from(base64Data, 'base64').length;
    if (approximateSizeBytes > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File exceeds maximum allowed size of 10MB' });
    }

    // Validate allowed MIME types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const effectiveMime = mimeType || 'application/octet-stream';
    if (!allowedMimeTypes.includes(effectiveMime.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Unsupported attachment file type' });
    }

    // Data URI url
    const fileUrl = base64Data.startsWith('data:') ? base64Data : `data:${effectiveMime};base64,${base64Data}`;

    // Optionally save file record if DB connected
    if (mongoose.connection.readyState === 1) {
      try {
        await FileRecord.create({
          name: fileName,
          originalName: fileName,
          mimeType: effectiveMime,
          size: approximateSizeBytes,
          url: fileUrl.length > 500 ? 'data-attachment' : fileUrl,
          folder: 'ChatAttachments',
          uploadedBy: new mongoose.Types.ObjectId(currentUserId),
          isPublic: false,
        });
      } catch (dbErr) {
        console.warn('File record persistence notice:', dbErr);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        name: fileName,
        mimeType: effectiveMime,
        size: approximateSizeBytes,
        url: fileUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error uploading attachment', error: error.message });
  }
};
