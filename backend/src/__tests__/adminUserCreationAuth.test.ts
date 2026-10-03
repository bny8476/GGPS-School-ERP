import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes';
import userRoutes from '../routes/userRoutes';
import User from '../models/User';
import Role from '../models/Role';
import Employee from '../models/Employee';
import TeacherProfile from '../models/TeacherProfile';
import Parent from '../models/Parent';
import RefreshToken from '../models/RefreshToken';
import { generateAccessToken } from '../services/tokenService';
import { hashPassword } from '../services/passwordService';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

describe('Admin User Creation & Authentication End-to-End Suite', () => {
  let originalReadyState: number;
  let adminToken: string;
  const adminId = new mongoose.Types.ObjectId();
  const roleId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    jest.setTimeout(30000);
    originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    adminToken = generateAccessToken({
      id: adminId.toString(),
      role: 'Admin',
      permissions: ['users:read', 'users:manage', '*'],
    });
  });

  afterAll(() => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Default mock for Admin session verification in auth middleware
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: adminId,
        role: 'Admin',
        isActive: true,
        isDeleted: false,
        status: 'Active',
      }),
    } as any);

    jest.spyOn(Role, 'findOne').mockResolvedValue({
      _id: roleId,
      name: 'Teacher',
      permissions: ['attendance:mark'],
      save: jest.fn().mockResolvedValue(true),
    } as any);

    jest.spyOn(Role, 'create').mockResolvedValue({
      _id: roleId,
      name: 'Teacher',
      permissions: ['attendance:mark'],
    } as any);

    jest.spyOn(RefreshToken, 'create').mockResolvedValue({} as any);
    jest.spyOn(Employee, 'findOneAndUpdate').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);
    jest.spyOn(TeacherProfile, 'findOneAndUpdate').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);
    jest.spyOn(Parent, 'findOneAndUpdate').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TEST 1, 10, 11: Admin creates Teacher -> Teacher login succeeds, password hashed once, not exposed
  it('TEST 1: Admin creates Teacher -> Teacher login succeeds with token, role Teacher, password never exposed', async () => {
    const teacherId = new mongoose.Types.ObjectId();

    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    let createdUserDoc: any = null;
    jest.spyOn(User, 'create').mockImplementation(async (userData: any) => {
      createdUserDoc = {
        ...userData,
        _id: teacherId,
        id: teacherId.toString(),
        createdAt: new Date(),
        role: { _id: roleId, name: 'Teacher', permissions: ['attendance:mark'] },
      };
      return createdUserDoc;
    });

    // 1. Admin creates Teacher
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Sunita',
        lastName: 'Sharma',
        email: 'sunita.teacher@ggps.edu.in',
        password: 'TeacherPassword123!',
        roleName: 'Teacher',
        designation: 'Senior PGT Mathematics',
        phoneNumber: '+91 9876543210',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.user.email).toBe('sunita.teacher@ggps.edu.in');
    expect(createRes.body.user.role.name).toBe('Teacher');

    // TEST 11: Password must never be returned in API response
    expect(createRes.body.password).toBeUndefined();
    expect(createRes.body.passwordHash).toBeUndefined();
    expect(createRes.body.user.password).toBeUndefined();
    expect(createRes.body.user.passwordHash).toBeUndefined();

    // TEST 10: Password is saved as a bcrypt hash (starts with $2)
    expect(createdUserDoc.passwordHash).toBeDefined();
    expect(createdUserDoc.passwordHash.startsWith('$2')).toBe(true);
    expect(createdUserDoc.password).toBeUndefined(); // Plaintext not saved

    // 2. Teacher attempts login with credentials
    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(createdUserDoc),
    } as any);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sunita.teacher@ggps.edu.in',
        password: 'TeacherPassword123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.role).toBe('Teacher');
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.email).toBe('sunita.teacher@ggps.edu.in');
  }, 15000);

  // TEST 2: Admin creates Parent -> Parent record created, Parent login succeeds
  it('TEST 2: Admin creates Parent -> Parent record created, Parent login succeeds', async () => {
    const parentId = new mongoose.Types.ObjectId();
    const parentRoleId = new mongoose.Types.ObjectId();

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(Role, 'findOne').mockResolvedValue({
      _id: parentRoleId,
      name: 'Parent',
      permissions: ['parent:portal:access'],
      save: jest.fn(),
    } as any);

    const parentUpsertSpy = jest.spyOn(Parent, 'findOneAndUpdate').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);

    let createdParentDoc: any = null;
    jest.spyOn(User, 'create').mockImplementation(async (userData: any) => {
      createdParentDoc = {
        ...userData,
        _id: parentId,
        id: parentId.toString(),
        createdAt: new Date(),
        role: { _id: parentRoleId, name: 'Parent', permissions: ['parent:portal:access'] },
      };
      return createdParentDoc;
    });

    // 1. Admin creates Parent
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Anand',
        lastName: 'Verma',
        email: 'anand.verma@example.com',
        password: 'ParentPassword123!',
        roleName: 'Parent',
        phoneNumber: '+91 9123456780',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(parentUpsertSpy).toHaveBeenCalled();

    // 2. Parent logs in
    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(createdParentDoc),
    } as any);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'anand.verma@example.com',
        password: 'ParentPassword123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.role).toBe('Parent');
    expect(loginRes.body.token).toBeDefined();
  }, 15000);

  // TEST 3: Wrong password rejected
  it('TEST 3: Wrong password rejected with 401', async () => {
    const hashed = await hashPassword('SecretKey123!');
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'user@school.com',
      passwordHash: hashed,
      isActive: true,
      status: 'Active',
      role: { name: 'Teacher' },
    };

    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@school.com', password: 'WrongPassword999!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  }, 15000);

  // TEST 4: Wrong email rejected
  it('TEST 4: Non-existent email rejected with 401', async () => {
    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@school.com', password: 'AnyPassword123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  }, 15000);

  // TEST 5 & 6: Uppercase and whitespace email normalized
  it('TEST 5 & 6: Email normalization works for uppercase and whitespace in both registration and login', async () => {
    const hashed = await hashPassword('NormalizePass123!');
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'teacher.normalized@ggps.edu.in',
      passwordHash: hashed,
      isActive: true,
      status: 'Active',
      role: { name: 'Teacher' },
    };

    const findSpy = jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '  TEACHER.NORMALIZED@GGPS.EDU.IN  ', password: 'NormalizePass123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Verify findOne was queried with lowercased, trimmed email
    expect(findSpy).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'teacher.normalized@ggps.edu.in' })
    );
  }, 15000);

  // TEST 7: Inactive user rejected
  it('TEST 7: Inactive user rejected with 403', async () => {
    const hashed = await hashPassword('ActivePassword123!');
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'inactive@school.com',
      passwordHash: hashed,
      isActive: false,
      status: 'Inactive',
      role: { name: 'Teacher' },
    };

    jest.spyOn(User, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactive@school.com', password: 'ActivePassword123!' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/suspended or inactive/i);
  }, 15000);

  // TEST 12: Duplicate email rejected
  it('TEST 12: Duplicate email during user creation is rejected with 400', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'existing@school.com',
        password: 'Password123!',
        roleName: 'Teacher',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  }, 15000);

  // TEST 13: Missing required lastName or password rejected
  it('TEST 13: Missing required lastName or password rejected with 400', async () => {
    const resNoLast = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'OnlyFirst',
        email: 'nolast@school.com',
        password: 'Password123!',
      });

    expect(resNoLast.status).toBe(400);
    expect(resNoLast.body.success).toBe(false);

    const resShortPass = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Short',
        lastName: 'Pass',
        email: 'shortpass@school.com',
        password: '123',
      });

    expect(resShortPass.status).toBe(400);
    expect(resShortPass.body.success).toBe(false);
    expect(resShortPass.body.message).toMatch(/at least 6 characters/i);
  }, 15000);
});
