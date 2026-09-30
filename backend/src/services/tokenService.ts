import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import mongoose from 'mongoose';
import RefreshToken from '../models/RefreshToken';
import User from '../models/User';
import env from '../config/env';

export interface TokenUserPayload {
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

export const generateAccessToken = (payload: TokenUserPayload): string => {
  return jwt.sign({ user: payload }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = async (
  userId: string,
  req?: Request
): Promise<string> => {
  const tokenString = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  if (mongoose.connection.readyState === 1) {
    try {
      await RefreshToken.create({
        token: tokenString,
        userId: new mongoose.Types.ObjectId(userId),
        expiresAt,
        userAgent: req?.headers['user-agent'] || '',
        ipAddress: req?.ip || req?.socket.remoteAddress || '',
      });
    } catch (err) {
      console.warn('RefreshToken storage error:', err);
    }
  }

  return tokenString;
};

export const rotateRefreshToken = async (
  oldToken: string,
  req?: Request
): Promise<{ accessToken: string; refreshToken: string; user: any } | null> => {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }

  const tokenDoc = await RefreshToken.findOne({ token: oldToken });
  if (!tokenDoc || tokenDoc.revoked || new Date() > tokenDoc.expiresAt) {
    // If compromised / reused revoked token, revoke all tokens for this user family
    if (tokenDoc && tokenDoc.revoked) {
      await RefreshToken.updateMany({ userId: tokenDoc.userId }, { revoked: true, revokedAt: new Date() });
    }
    return null;
  }

  // Fetch active user
  const user = await User.findById(tokenDoc.userId).populate('role');
  if (!user || user.isActive === false) {
    return null;
  }

  // Revoke old token and link to replacement
  const newRefreshTokenString = crypto.randomBytes(40).toString('hex');
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7);

  tokenDoc.revoked = true;
  tokenDoc.revokedAt = new Date();
  tokenDoc.replacedByToken = newRefreshTokenString;
  await tokenDoc.save();

  // Create new refresh token doc
  await RefreshToken.create({
    token: newRefreshTokenString,
    userId: user._id,
    expiresAt: newExpiresAt,
    userAgent: req?.headers['user-agent'] || '',
    ipAddress: req?.ip || req?.socket.remoteAddress || '',
  });

  const roleName = (user.role as any)?.name || 'Parent';
  const permissions = (user.role as any)?.permissions || [];

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    role: roleName,
    permissions,
  });

  return {
    accessToken,
    refreshToken: newRefreshTokenString,
    user,
  };
};

export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  if (mongoose.connection.readyState !== 1 || !token) return true;
  try {
    await RefreshToken.findOneAndUpdate(
      { token },
      { revoked: true, revokedAt: new Date() }
    );
    return true;
  } catch (err) {
    return false;
  }
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken?: string): void => {
  const isProd = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };

  res.cookie('token', accessToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days fallback cookie
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

export const clearAuthCookies = (res: Response): void => {
  const isProd = env.NODE_ENV === 'production';
  const clearOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };

  res.clearCookie('token', clearOptions);
  res.clearCookie('refreshToken', clearOptions);
};
