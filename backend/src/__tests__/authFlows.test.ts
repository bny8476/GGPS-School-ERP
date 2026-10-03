import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import authRoutes from '../routes/authRoutes';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import Role from '../models/Role';
import { generateAccessToken, generateRefreshToken } from '../services/tokenService';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Auth Controller & Token Rotation / Reuse-Detection Test Suite', () => {
  let originalReadyState: number;

  beforeAll(() => {
    jest.setTimeout(30000);
    originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });
  });

  afterAll(() => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    jest.restoreAllMocks();
  });

  it('loginUser succeeds with valid credentials via bcrypt.compare and sets tokens', async () => {
    const userId = new mongoose.Types.ObjectId();
    const hashedPassword = await bcrypt.hash('CorrectPass123!', 10);

    const mockUser = {
      _id: userId,
      id: userId.toString(),
      email: 'verified.teacher@school.com',
      passwordHash: hashedPassword,
      firstName: 'Verified',
      lastName: 'Teacher',
      role: { name: 'Teacher', permissions: ['attendance:mark'] },
      isActive: true,
      isDeleted: false,
      status: 'Active',
    };

    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser),
    } as any);

    jest.spyOn(RefreshToken, 'create').mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'verified.teacher@school.com', password: 'CorrectPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.email).toBe('verified.teacher@school.com');
    expect(res.body.token).toBeDefined();
    // Check that httpOnly cookie was set
    const rawCookies = res.headers['set-cookie'];
    const cookieHeader = Array.isArray(rawCookies) ? rawCookies.join(';') : String(rawCookies || '');
    expect(cookieHeader).toContain('token=');
    expect(cookieHeader.toLowerCase()).toContain('httponly');
  }, 30000);

  it('loginUser rejects invalid password with 401 and never grants session', async () => {
    const userId = new mongoose.Types.ObjectId();
    const hashedPassword = await bcrypt.hash('RealSecretPassword', 10);

    const mockUser = {
      _id: userId,
      id: userId.toString(),
      email: 'admin@school.com',
      passwordHash: hashedPassword,
      role: { name: 'Admin', permissions: ['*'] },
      isActive: true,
      isDeleted: false,
      status: 'Active',
    };

    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@school.com', password: 'WrongPasswordGuess' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.token).toBeUndefined();
  }, 30000);

  it('loginUser rejects inactive or disabled account with 403', async () => {
    const userId = new mongoose.Types.ObjectId();
    const hashedPassword = await bcrypt.hash('CorrectPass123!', 10);

    const mockUser = {
      _id: userId,
      id: userId.toString(),
      email: 'suspended@school.com',
      passwordHash: hashedPassword,
      role: { name: 'Teacher' },
      isActive: false,
      isDeleted: false,
      status: 'Suspended',
    };

    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'suspended@school.com', password: 'CorrectPass123!' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('refreshToken performs single-use rotation and issues new tokens', async () => {
    const userId = new mongoose.Types.ObjectId();
    const oldRefreshToken = 'token_abc_123_valid';

    const mockStoredToken = {
      token: oldRefreshToken,
      userId,
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(mockStoredToken as any);
    jest.spyOn(RefreshToken, 'create').mockResolvedValue({} as any);

    jest.spyOn(User, 'findById').mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: userId,
        email: 'teacher@school.com',
        role: { name: 'Teacher', permissions: ['attendance:mark'] },
        isActive: true,
        isDeleted: false,
        status: 'Active',
      }),
    } as any);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${oldRefreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    // Old token must be marked revoked in rotation
    expect(mockStoredToken.revoked).toBe(true);
    expect(mockStoredToken.save).toHaveBeenCalled();
  });

  it('refreshToken detects token reuse and revokes all user sessions', async () => {
    const userId = new mongoose.Types.ObjectId();
    const stolenRefreshToken = 'token_stolen_revoked_reuse';

    // Mock already-revoked token presented again (classic reuse attack)
    const mockRevokedToken = {
      token: stolenRefreshToken,
      userId,
      revoked: true, // Already revoked!
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    jest.spyOn(RefreshToken, 'findOne').mockResolvedValue(mockRevokedToken as any);
    const updateManySpy = jest.spyOn(RefreshToken, 'updateMany').mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${stolenRefreshToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid.*expired.*revoked/i);
    // All refresh tokens for this compromised user must be invalidated
    expect(updateManySpy).toHaveBeenCalled();
  });
});
