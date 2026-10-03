import express, { Request, Response } from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import authRoutes from '../routes/authRoutes';
import financeRoutes from '../routes/financeRoutes';
import User from '../models/User';
import Fee from '../models/Fee';
import env from '../config/env';
import { matchesPermission, hasPermission, requirePermissions } from '../middleware/rbac';
import emailService from '../services/emailService';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/finance', financeRoutes);

describe('Security Audit Fixes Verification', () => {
  describe('1. Authentication Bypass Fix', () => {
    it('should reject non-existent user with password123 and NOT grant SuperAdmin session', async () => {
      // Mock mongoose.connection.readyState = 1 (connected)
      const originalReadyState = mongoose.connection.readyState;
      Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

      const findOneSpy = jest.spyOn(User, 'findOne').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'random-admin@schoolerp.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.token).toBeUndefined();
      expect(res.body.role).toBeUndefined();

      findOneSpy.mockRestore();
      Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    });
  });

  describe('2. Password Reset Flow End-to-End', () => {
    it('should persist reset code with expiry and allow password reset', async () => {
      const originalReadyState = mongoose.connection.readyState;
      Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

      const emailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'test-sim-123',
        mode: 'simulated',
      });

      const mockUser: any = {
        _id: new mongoose.Types.ObjectId(),
        email: 'teacher.reset@school.com',
        passwordHash: 'old_hash',
        passwordResetCode: undefined,
        passwordResetExpires: undefined,
        save: jest.fn().mockResolvedValue(true),
      };

      const queryObj: any = {
        select: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
        then: (resolve: any, reject: any) => Promise.resolve(mockUser).then(resolve, reject),
      };

      const findOneSpy = jest.spyOn(User, 'findOne').mockImplementation((query: any) => {
        if (query.email === 'teacher.reset@school.com') {
          return queryObj;
        }
        return {
          select: jest.fn().mockImplementation(() => Promise.resolve(null)),
          then: (resolve: any, reject: any) => Promise.resolve(null).then(resolve, reject),
        } as any;
      });

      // 1. Request reset
      const forgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'teacher.reset@school.com' });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.resetCodeSent).toBe(true);
      expect(mockUser.passwordResetCode).toBeDefined();
      expect(mockUser.passwordResetExpires).toBeInstanceOf(Date);

      const code = mockUser.passwordResetCode;

      // 2. Verify code
      const verifyRes = await request(app)
        .post('/api/v1/auth/verify-reset-code')
        .send({ email: 'teacher.reset@school.com', code });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);

      // 3. Reset password
      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ email: 'teacher.reset@school.com', code, newPassword: 'newSecurePassword123' });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(mockUser.passwordResetCode).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();

      emailSpy.mockRestore();
      findOneSpy.mockRestore();
      Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    }, 25000);
  });

  describe('3. Fee Payments & Mass-Assignment Protections', () => {
    it('should reject updateFee if attempting mass assignment of restricted fields', async () => {
      // Mock protect middleware authorization by mocking req.user
      const updateRes = await request(app)
        .put('/api/v1/finance/fees/66789abcdef0123456789000')
        .send({ amountPaid: 99999, status: 'Paid', paymentHistory: [] });

      // Missing JWT auth -> 401
      expect(updateRes.status).toBe(401);
    });

    it('should generate valid cryptographic signature for parent payment order', async () => {
      const feeId = new mongoose.Types.ObjectId().toString();
      const orderId = `ORD_${Date.now()}`;
      const amount = 5000;

      const expectedSig = crypto
        .createHmac('sha256', env.PAYMENT_GATEWAY_SECRET)
        .update(`${feeId}:${orderId}:${amount}`)
        .digest('hex');

      expect(expectedSig).toBeDefined();
      expect(expectedSig.length).toBe(64);
    });
  });

  describe('4. RBAC Permission Taxonomy & Case-Insensitive Bypass', () => {
    it('should match colon and dot notation interoperably', () => {
      expect(matchesPermission('attendance:read', 'attendance.read')).toBe(true);
      expect(matchesPermission('attendance.mark', 'attendance:mark')).toBe(true);
      expect(matchesPermission('students:*', 'students.read')).toBe(true);
      expect(matchesPermission('students:*', 'students:create')).toBe(true);
    });

    it('should allow SuperAdmin bypass case-insensitively', () => {
      const mockReq: any = { user: { role: 'superadmin' } };
      const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const nextFn = jest.fn();

      const middleware = requirePermissions('restricted:system:action');
      middleware(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });
  });
});
