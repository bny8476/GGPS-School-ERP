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

interface CachedUserStatus {
  isDeleted: boolean;
  isActive: boolean;
  status: string;
  expiresAt: number;
}

const userStatusCache = new Map<string, CachedUserStatus>();
const USER_CACHE_TTL_MS = 30 * 1000; // 30 seconds

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const perfStart = process.env.DEBUG_PERF === 'true' ? performance.now() : 0;

  let bearerToken: string | undefined;
  // 1. Check Authorization: Bearer <token> header first (most reliable for cross-origin SPA)
  const authHeader = req.headers.authorization;
  if (authHeader && /^bearer\s+/i.test(authHeader)) {
    const raw = authHeader.replace(/^bearer\s+/i, '').trim();
    if (raw && raw !== 'null' && raw !== 'undefined') {
      bearerToken = raw;
    }
  }

  let cookieToken: string | undefined;
  // 2. Fallback to HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    const rawCookie = String(req.cookies.token).trim();
    if (rawCookie && rawCookie !== 'null' && rawCookie !== 'undefined') {
      cookieToken = rawCookie;
    }
  }

  let queryToken: string | undefined;
  // 3. Fallback to query parameter (useful for iframe / PDF report-card downloads)
  if (typeof req.query.token === 'string') {
    const rawQuery = req.query.token.trim();
    if (rawQuery && rawQuery !== 'null' && rawQuery !== 'undefined') {
      queryToken = rawQuery;
    }
  }

  const tokensToTry = [bearerToken, cookieToken, queryToken].filter(Boolean) as string[];

  if (tokensToTry.length === 0) {
    res.status(401).json({ success: false, message: 'Not authorized, no token', code: 'NO_TOKEN' });
    return;
  }

  try {
    const secretsToTry = Array.from(
      new Set(
        [
          env.JWT_ACCESS_SECRET,
          process.env.JWT_ACCESS_SECRET,
          process.env.JWT_SECRET,
        ].filter(Boolean) as string[]
      )
    );

    let decoded: JwtPayload | undefined;
    for (const t of tokensToTry) {
      for (const s of secretsToTry) {
        try {
          decoded = jwt.verify(t, s) as JwtPayload;
          if (decoded && decoded.user && decoded.user.id) break;
        } catch (_) {}
      }
      if (decoded && decoded.user && decoded.user.id) break;
    }

    if (!decoded || !decoded.user || !decoded.user.id) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed', code: 'INVALID_TOKEN' });
      return;
    }

    // Database verification with in-memory TTL caching to avoid hammering MongoDB on concurrent dashboard calls
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.user.id)) {
      const now = Date.now();
      const cached = userStatusCache.get(decoded.user.id);

      let isDeleted = false;
      let isActive = true;
      let status = 'Active';

      if (cached && cached.expiresAt > now) {
        isDeleted = cached.isDeleted;
        isActive = cached.isActive;
        status = cached.status;
      } else {
        const dbUser = await User.findById(decoded.user.id).select('isActive isDeleted status');
        if (dbUser) {
          isDeleted = Boolean(dbUser.isDeleted);
          isActive = dbUser.isActive !== false;
          status = dbUser.status || 'Active';
          userStatusCache.set(decoded.user.id, {
            isDeleted,
            isActive,
            status,
            expiresAt: now + USER_CACHE_TTL_MS,
          });
        } else if (env.NODE_ENV === 'production') {
          res.status(401).json({
            success: false,
            message: 'Account is deactivated, suspended, or no longer exists',
            code: 'USER_DEACTIVATED',
          });
          return;
        }
      }

      if (isDeleted || !isActive || status === 'Suspended') {
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

    if (process.env.DEBUG_PERF === 'true') {
      console.log(`[PERF] protect middleware: ${(performance.now() - perfStart).toFixed(2)}ms`);
    }

    next();
  } catch (error) {
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
