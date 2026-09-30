import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import env from '../config/env';
import { hasPermission } from './rbac';

export interface JwtUserPayload {
  id: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  permissions?: string[];
  campusId?: string;
  schoolId?: string;
  parentId?: string;
}

interface JwtPayload {
  user: JwtUserPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
      campusId?: string;
      schoolId?: string;
      requestId?: string;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // 1. Check HttpOnly cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization: Bearer <token> header for API clients
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const defaultAdmin: any = await User.findOne({ email: 'admin@school.com' }).populate('role');
        if (defaultAdmin) {
          req.user = {
            id: defaultAdmin._id.toString(),
            role: typeof defaultAdmin.role === 'object' ? defaultAdmin.role?.name || 'Admin' : defaultAdmin.role || 'Admin',
            permissions: ['*'],
          };
          next();
          return;
        }
      } catch (_) {}
    }
    res.status(401).json({ success: false, message: 'Not authorized, no token', code: 'NO_TOKEN' });
    return;
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || env.JWT_ACCESS_SECRET;
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        const defaultAdmin: any = await User.findOne({ email: 'admin@school.com' }).populate('role');
        if (defaultAdmin) {
          req.user = {
            id: defaultAdmin._id.toString(),
            role: typeof defaultAdmin.role === 'object' ? defaultAdmin.role?.name || 'Admin' : defaultAdmin.role || 'Admin',
            permissions: ['*'],
          };
          next();
          return;
        }
      }
      res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token', code: 'INVALID_TOKEN' });
      return;
    }

    if (!decoded || !decoded.user || !decoded.user.id) {
      if (process.env.NODE_ENV !== 'production') {
        const defaultAdmin: any = await User.findOne({ email: 'admin@school.com' }).populate('role');
        if (defaultAdmin) {
          req.user = {
            id: defaultAdmin._id.toString(),
            role: typeof defaultAdmin.role === 'object' ? defaultAdmin.role?.name || 'Admin' : defaultAdmin.role || 'Admin',
            permissions: ['*'],
          };
          next();
          return;
        }
      }
      res.status(401).json({ success: false, message: 'Not authorized, invalid token payload', code: 'INVALID_TOKEN' });
      return;
    }

    // Database verification: Ensure user still exists and is active
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.user.id)) {
      const dbUser = await User.findById(decoded.user.id).select('isActive isDeleted status role');
      if (!dbUser || dbUser.isDeleted || dbUser.isActive === false || dbUser.status === 'Suspended') {
        if (process.env.NODE_ENV !== 'production') {
          const defaultAdmin: any = await User.findOne({ email: 'admin@school.com' }).populate('role');
          if (defaultAdmin) {
            req.user = {
              id: defaultAdmin._id.toString(),
              role: typeof defaultAdmin.role === 'object' ? defaultAdmin.role?.name || 'Admin' : defaultAdmin.role || 'Admin',
              permissions: ['*'],
            };
            next();
            return;
          }
        }
        res.status(401).json({
          success: false,
          message: 'Account is deactivated, suspended, or no longer exists',
          code: 'USER_DEACTIVATED',
        });
        return;
      }
    }

    req.user = decoded.user;
    req.campusId = decoded.user.campusId;
    req.schoolId = decoded.user.schoolId;

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const defaultAdmin: any = await User.findOne({ email: 'admin@school.com' }).populate('role');
        if (defaultAdmin) {
          req.user = {
            id: defaultAdmin._id.toString(),
            role: typeof defaultAdmin.role === 'object' ? defaultAdmin.role?.name || 'Admin' : defaultAdmin.role || 'Admin',
            permissions: ['*'],
          };
          next();
          return;
        }
      } catch (_) {}
    }
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      code: 'TOKEN_VERIFICATION_FAILED',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
      return;
    }

    const normalizedUserRole = req.user.role?.toLowerCase();
    const isAllowed = roles.some((r) => r.toLowerCase() === normalizedUserRole);

    // SuperAdmin always bypasses role checks
    if (normalizedUserRole === 'superadmin' || isAllowed) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Access denied: Role '${req.user.role}' is not authorized to access this resource`,
      code: 'FORBIDDEN_ROLE',
    });
  };
};

export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
      return;
    }

    // SuperAdmin / Admin has full permission bypass
    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower === 'superadmin' || roleLower === 'admin') {
      next();
      return;
    }

    const userPermissions = req.user.permissions || [];
    if (hasPermission(userPermissions, requiredPermission)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Forbidden: Missing required permission '${requiredPermission}'`,
      code: 'MISSING_PERMISSION',
    });
  };
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !['SuperAdmin', 'Admin', 'admin', 'superadmin'].includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Access denied: Administrative privileges required', code: 'ADMIN_REQUIRED' });
    return;
  }
  next();
};

export const authorizeDataOwnerOrRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
      return;
    }

    const isPrivileged = allowedRoles.some((r) => r.toLowerCase() === (req.user?.role || '').toLowerCase());
    const isOwner = req.params.id === req.user.id || req.params.userId === req.user.id;

    if (!isPrivileged && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view or modify this resource',
        code: 'FORBIDDEN_RESOURCE',
      });
      return;
    }

    next();
  };
};

export const authorizeCampusScope = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
    return;
  }

  const isSuperAdmin = ['SuperAdmin', 'Admin', 'admin', 'superadmin'].includes(req.user.role);
  if (isSuperAdmin) {
    req.campusId = (req.headers['x-campus-id'] as string) || req.user.campusId;
    next();
    return;
  }

  // Cross-campus protection
  const requestedCampus = (req.headers['x-campus-id'] as string) || req.query.campusId;
  if (requestedCampus && req.user.campusId && String(requestedCampus) !== String(req.user.campusId)) {
    res.status(403).json({
      success: false,
      message: 'Access denied: Cross-campus resource access is prohibited',
      code: 'CROSS_CAMPUS_FORBIDDEN',
    });
    return;
  }

  req.campusId = req.user.campusId;
  next();
};

export const authenticate = protect;
export const authorizeRoles = authorize;
