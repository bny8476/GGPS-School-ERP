import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import userRoutes from '../routes/userRoutes';
import parentRoutes from '../routes/parentRoutes';
import User from '../models/User';
import Role from '../models/Role';
import Student from '../models/Student';
import Parent from '../models/Parent';
import Employee from '../models/Employee';
import TeacherProfile from '../models/TeacherProfile';
import StudentParent from '../models/StudentParent';
import StudentAttendance from '../models/StudentAttendance';
import Fee from '../models/Fee';
import RefreshToken from '../models/RefreshToken';
import { generateAccessToken } from '../services/tokenService';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Mount routes under canonical /api/v1 and legacy /api
app.use('/api/users', userRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/v1/parents', parentRoutes);

describe('Complete Parent ↔ Child Linking & Parent Portal Security Suite', () => {
  let originalReadyState: number;
  let adminToken: string;
  let parentToken: string;
  let otherParentToken: string;

  const adminId = new mongoose.Types.ObjectId();
  const parentUserId = new mongoose.Types.ObjectId();
  const otherParentUserId = new mongoose.Types.ObjectId();
  const parentDocId = new mongoose.Types.ObjectId();
  const otherParentDocId = new mongoose.Types.ObjectId();

  const childAId = new mongoose.Types.ObjectId();
  const childBId = new mongoose.Types.ObjectId();
  const childCId = new mongoose.Types.ObjectId(); // Unlinked child (belongs to other parent)

  const schoolId = new mongoose.Types.ObjectId();
  const otherSchoolId = new mongoose.Types.ObjectId();
  const roleParentId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    jest.setTimeout(30000);
    originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    adminToken = generateAccessToken({
      id: adminId.toString(),
      role: 'Admin',
      schoolId: schoolId.toString(),
      permissions: ['users:read', 'users:manage', '*'],
    });

    parentToken = generateAccessToken({
      id: parentUserId.toString(),
      email: 'ramesh.parent@ggps.edu.in',
      role: 'Parent',
      schoolId: schoolId.toString(),
      permissions: ['parent.children.read', 'parent.attendance.read', 'parent.fees.read'],
    });

    otherParentToken = generateAccessToken({
      id: otherParentUserId.toString(),
      email: 'suresh.parent@ggps.edu.in',
      role: 'Parent',
      schoolId: schoolId.toString(),
      permissions: ['parent.children.read', 'parent.attendance.read'],
    });
  });

  afterAll(() => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Prevent buffering on unmocked collections during user sync
    jest.spyOn(Parent, 'findOneAndUpdate').mockResolvedValue({ _id: parentDocId } as any);
    jest.spyOn(Employee, 'findOneAndUpdate').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);
    jest.spyOn(TeacherProfile, 'findOneAndUpdate').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);
    jest.spyOn(RefreshToken, 'create').mockResolvedValue({} as any);

    // Mock User session in auth middleware
    jest.spyOn(User, 'findById').mockImplementation((id: any) => {
      const idStr = id?.toString();
      if (idStr === adminId.toString()) {
        return {
          select: jest.fn().mockResolvedValue({
            _id: adminId,
            role: 'Admin',
            schoolId,
            isActive: true,
            status: 'Active',
            isDeleted: false,
          }),
        } as any;
      }
      if (idStr === parentUserId.toString()) {
        return {
          select: jest.fn().mockResolvedValue({
            _id: parentUserId,
            firstName: 'Ramesh',
            lastName: 'Kumar',
            email: 'ramesh.parent@ggps.edu.in',
            role: 'Parent',
            schoolId,
            isActive: true,
            status: 'Active',
            isDeleted: false,
          }),
        } as any;
      }
      if (idStr === otherParentUserId.toString()) {
        return {
          select: jest.fn().mockResolvedValue({
            _id: otherParentUserId,
            firstName: 'Suresh',
            lastName: 'Verma',
            email: 'suresh.parent@ggps.edu.in',
            role: 'Parent',
            schoolId,
            isActive: true,
            status: 'Active',
            isDeleted: false,
          }),
        } as any;
      }
      return { select: jest.fn().mockResolvedValue(null) } as any;
    });

    jest.spyOn(Role, 'findOne').mockResolvedValue({
      _id: roleParentId,
      name: 'Parent',
      permissions: ['parent.children.read'],
      save: jest.fn().mockResolvedValue(true),
    } as any);
  });

  describe('1. Admin Provisioning & Child Linking Validations', () => {
    it('successfully creates Parent and links multiple children in transaction', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(Student, 'findById').mockImplementation((id: any) => {
        const idStr = id?.toString();
        if (idStr === childAId.toString()) {
          return Promise.resolve({
            _id: childAId,
            firstName: 'Aarav',
            lastName: 'Kumar',
            admissionNumber: 'GGPS-2026-001',
            schoolId,
            grade: 'LKG',
          }) as any;
        }
        if (idStr === childBId.toString()) {
          return Promise.resolve({
            _id: childBId,
            firstName: 'Ananya',
            lastName: 'Kumar',
            admissionNumber: 'GGPS-2026-002',
            schoolId,
            grade: 'UKG',
          }) as any;
        }
        return Promise.resolve(null);
      });

      const createdParentUser = {
        _id: parentUserId,
        firstName: 'Ramesh',
        lastName: 'Kumar',
        email: 'ramesh.kumar@ggps.edu.in',
        role: roleParentId,
        schoolId,
      };

      jest.spyOn(User, 'create').mockResolvedValue(createdParentUser as any);
      jest.spyOn(Parent, 'findOne').mockResolvedValue({
        _id: parentDocId,
        userId: parentUserId,
        primaryEmail: 'ramesh.kumar@ggps.edu.in',
      } as any);

      const findOneAndUpdateSpy = jest.spyOn(StudentParent, 'findOneAndUpdate').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        parentId: parentDocId,
        relationship: 'Father',
        isPrimary: true,
        status: 'active',
      } as any);

      jest.spyOn(Student, 'findByIdAndUpdate').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Ramesh',
          lastName: 'Kumar',
          email: 'ramesh.kumar@ggps.edu.in',
          password: 'Password123!',
          roleName: 'Parent',
          linkedChildren: [
            { studentId: childAId.toString(), relationship: 'Father', isPrimary: true },
            { studentId: childBId.toString(), relationship: 'Father', isPrimary: false },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.linkedChildren).toHaveLength(2);
      expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(2);
    });

    it('rejects duplicate children in linking input', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Ramesh',
          lastName: 'Kumar',
          email: 'ramesh.duplicate@ggps.edu.in',
          password: 'Password123!',
          roleName: 'Parent',
          linkedChildren: [
            { studentId: childAId.toString(), relationship: 'Father' },
            { studentId: childAId.toString(), relationship: 'Father' },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/duplicate/i);
    });

    it('rejects linking a child belonging to another school (cross-school protection)', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(Student, 'findById').mockResolvedValue({
        _id: childAId,
        firstName: 'Cross',
        lastName: 'School',
        schoolId: otherSchoolId, // Different school
      } as any);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Ramesh',
          lastName: 'Kumar',
          email: 'ramesh.cross@ggps.edu.in',
          password: 'Password123!',
          roleName: 'Parent',
          schoolId: schoolId.toString(),
          linkedChildren: [{ studentId: childAId.toString(), relationship: 'Father' }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/different school/i);
    });
  });

  describe('2. Parent Portal Data Isolation (/api/v1/parents/me)', () => {
    it('returns ONLY verified linked children for authenticated parent', async () => {
      // Mock Parent document lookup matching both userId and $or
      jest.spyOn(Parent, 'findOne').mockImplementation((query: any) => {
        const matchesParentUser =
          query.userId?.toString() === parentUserId.toString() ||
          (Array.isArray(query.$or) &&
            query.$or.some(
              (q: any) =>
                q.userId?.toString() === parentUserId.toString() ||
                q.primaryEmail === 'ramesh.parent@ggps.edu.in'
            ));

        if (matchesParentUser) {
          return Promise.resolve({
            _id: parentDocId,
            userId: parentUserId,
            fatherName: 'Ramesh Kumar',
            primaryEmail: 'ramesh.parent@ggps.edu.in',
          }) as any;
        }
        return Promise.resolve(null);
      });

      // Mock StudentParent links for parentDocId
      jest.spyOn(StudentParent, 'find').mockImplementation((query: any) => {
        if (query.parentId?.toString() === parentDocId.toString()) {
          return {
            select: jest.fn().mockResolvedValue([
              { studentId: childAId },
              { studentId: childBId },
            ]),
          } as any;
        }
        return {
          select: jest.fn().mockResolvedValue([]),
        } as any;
      });

      jest.spyOn(Student, 'find').mockImplementation((query: any) => {
        if (query.parentId) {
          return { select: jest.fn().mockResolvedValue([]) } as any;
        }
        if (query._id?.$in) {
          return {
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue([
                {
                  _id: childAId,
                  firstName: 'Aarav',
                  lastName: 'Kumar',
                  admissionNumber: 'GGPS-2026-001',
                  classId: { _id: new mongoose.Types.ObjectId(), name: 'LKG' },
                  sectionId: { _id: new mongoose.Types.ObjectId(), name: 'A' },
                },
                {
                  _id: childBId,
                  firstName: 'Ananya',
                  lastName: 'Kumar',
                  admissionNumber: 'GGPS-2026-002',
                  classId: { _id: new mongoose.Types.ObjectId(), name: 'UKG' },
                  sectionId: { _id: new mongoose.Types.ObjectId(), name: 'A' },
                },
              ]),
            }),
          } as any;
        }
        return {
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
          }),
        } as any;
      });

      const res = await request(app)
        .get('/api/v1/parents/me')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.children).toHaveLength(2);
      expect(res.body.children[0].firstName).toBe('Aarav');
      expect(res.body.children[1].firstName).toBe('Ananya');
      // Must not contain unlinked child
      const hasChildC = res.body.children.some((c: any) => c._id === childCId.toString());
      expect(hasChildC).toBe(false);
    });

    it('returns empty children array when parent has no linked children (empty state support)', async () => {
      jest.spyOn(Parent, 'findOne').mockImplementation((query: any) => {
        const matchesOther =
          query.userId?.toString() === otherParentUserId.toString() ||
          (Array.isArray(query.$or) &&
            query.$or.some(
              (q: any) =>
                q.userId?.toString() === otherParentUserId.toString() ||
                q.primaryEmail === 'suresh.parent@ggps.edu.in'
            ));

        if (matchesOther) {
          return Promise.resolve({
            _id: otherParentDocId,
            userId: otherParentUserId,
            fatherName: 'Suresh Verma',
            primaryEmail: 'suresh.parent@ggps.edu.in',
          }) as any;
        }
        return Promise.resolve(null);
      });

      jest.spyOn(StudentParent, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      } as any);

      jest.spyOn(Student, 'find').mockImplementation((query: any) => {
        if (query.parentId) {
          return { select: jest.fn().mockResolvedValue([]) } as any;
        }
        return {
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
          }),
        } as any;
      });

      const res = await request(app)
        .get('/api/v1/parents/me')
        .set('Authorization', `Bearer ${otherParentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.children).toEqual([]);
    });
  });

  describe('3. Strict Child-Level Authorization & 403 Forbidden on Unauthorized Access', () => {
    beforeEach(() => {
      // Mock student lookups
      jest.spyOn(Student, 'findById').mockImplementation((id: any) => {
        const idStr = id?.toString();
        if (idStr === childAId.toString()) {
          return {
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue({
                _id: childAId,
                firstName: 'Aarav',
                lastName: 'Kumar',
                parentId: parentDocId,
                classId: { _id: new mongoose.Types.ObjectId(), name: 'LKG' },
              }),
            }),
          } as any;
        }
        if (idStr === childCId.toString()) {
          return {
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue({
                _id: childCId,
                firstName: 'Other',
                lastName: 'Kid',
                parentId: otherParentDocId,
                classId: { _id: new mongoose.Types.ObjectId(), name: 'Grade 5' },
              }),
            }),
          } as any;
        }
        return {
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          }),
        } as any;
      });

      // Mock StudentParent link check
      jest.spyOn(StudentParent, 'findOne').mockImplementation((query: any) => {
        const pId = query.parentId?.toString();
        const sId = query.studentId?.toString();
        if (pId === parentDocId.toString() && sId === childAId.toString()) {
          return Promise.resolve({
            _id: new mongoose.Types.ObjectId(),
            parentId: parentDocId,
            studentId: childAId,
            status: 'active',
          }) as any;
        }
        return Promise.resolve(null);
      });

      jest.spyOn(Parent, 'findOne').mockImplementation((query: any) => {
        const matchesParentUser =
          query.userId?.toString() === parentUserId.toString() ||
          (Array.isArray(query.$or) &&
            query.$or.some(
              (q: any) =>
                q.userId?.toString() === parentUserId.toString() ||
                q.primaryEmail === 'ramesh.parent@ggps.edu.in'
            ));

        if (matchesParentUser) {
          return Promise.resolve({ _id: parentDocId, userId: parentUserId, primaryEmail: 'ramesh.parent@ggps.edu.in' }) as any;
        }
        return Promise.resolve(null);
      });
    });

    it('allows Parent to access linked child attendance', async () => {
      jest.spyOn(StudentAttendance, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            { _id: new mongoose.Types.ObjectId(), studentId: childAId, status: 'Present', date: new Date() },
          ]),
        }),
      } as any);

      const res = await request(app)
        .get(`/api/v1/parents/me/children/${childAId}/attendance`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.records).toHaveLength(1);
    });

    it('allows Parent to access linked child fees', async () => {
      jest.spyOn(Fee, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: new mongoose.Types.ObjectId(), studentId: childAId, totalAmount: 5000, amountPaid: 5000 },
        ]),
      } as any);

      const res = await request(app)
        .get(`/api/v1/parents/me/children/${childAId}/fees`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary.outstanding).toBe(0);
    });

    it('returns 403 Forbidden when Parent attempts to access an unlinked child attendance', async () => {
      const res = await request(app)
        .get(`/api/v1/parents/me/children/${childCId}/attendance`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/permission|access denied|forbidden/i);
    });

    it('returns 403 Forbidden when Parent attempts to access an unlinked child fees', async () => {
      const res = await request(app)
        .get(`/api/v1/parents/me/children/${childCId}/fees`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('returns 403 Forbidden when Parent attempts to view unlinked child profile directly', async () => {
      const res = await request(app)
        .get(`/api/v1/parents/me/children/${childCId}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Admin Link & Unlink Management', () => {
    it('allows Admin to link an additional child to Parent profile', async () => {
      jest.spyOn(Parent, 'findById').mockResolvedValue(null);
      jest.spyOn(Parent, 'findOne').mockResolvedValue({ _id: parentDocId, userId: parentUserId } as any);
      jest.spyOn(Student, 'findById').mockResolvedValue({
        _id: childCId,
        firstName: 'New',
        lastName: 'Child',
        schoolId,
      } as any);

      jest.spyOn(StudentParent, 'findOneAndUpdate').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        parentId: parentDocId,
        studentId: childCId,
        relationship: 'Guardian',
        isPrimary: false,
        status: 'active',
      } as any);

      const res = await request(app)
        .post(`/api/v1/parents/${parentUserId}/children`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: childCId.toString(),
          relationship: 'Guardian',
          isPrimary: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('allows Admin to unlink a child from Parent profile', async () => {
      jest.spyOn(Parent, 'findById').mockResolvedValue(null);
      jest.spyOn(Parent, 'findOne').mockResolvedValue({ _id: parentDocId, userId: parentUserId } as any);
      jest.spyOn(StudentParent, 'findOneAndDelete').mockResolvedValue({ _id: new mongoose.Types.ObjectId() } as any);
      jest.spyOn(Student, 'findById').mockResolvedValue({
        _id: childAId,
        parentId: parentDocId,
      } as any);
      jest.spyOn(StudentParent, 'findOne').mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      } as any);
      jest.spyOn(Student, 'findByIdAndUpdate').mockResolvedValue({} as any);

      const res = await request(app)
        .delete(`/api/v1/parents/${parentUserId}/children/${childAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/unlinked/i);
    });
  });
});
