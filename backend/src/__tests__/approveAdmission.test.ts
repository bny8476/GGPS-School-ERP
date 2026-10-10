import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import admissionRoutes from '../routes/admissionRoutes';
import Admission from '../models/Admission';
import AcademicYear from '../models/AcademicYear';
import Class from '../models/Class';
import Section from '../models/Section';
import User from '../models/User';
import Role from '../models/Role';
import Parent from '../models/Parent';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import StudentParent from '../models/StudentParent';
import Notification from '../models/Notification';
import { generateAccessToken } from '../services/tokenService';

const app = express();
app.use(express.json());
app.use('/api/admissions', admissionRoutes);

describe('Admission Approval Edge Cases Suite', () => {
  jest.setTimeout(15000);
  let adminToken: string;
  const adminId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    adminToken = generateAccessToken({
      id: adminId.toString(),
      role: 'Admin',
      permissions: ['*'],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('successfully approves admission when childLastName is "-" and email is missing', async () => {
    const admissionId = new mongoose.Types.ObjectId();
    const mockAdmission: any = {
      _id: admissionId,
      childFirstName: 'ganesh',
      childLastName: '-',
      gradeAppliedFor: 'Class UKG',
      parentName: 'praveen',
      contactNumber: '6212326547',
      applicationNumber: 'GGPS-ENQ-2026-0005',
      status: 'New',
      stage: 'Application',
      save: jest.fn().mockResolvedValue(true),
    };

    const mockAcademicYear: any = {
      _id: new mongoose.Types.ObjectId(),
      name: '2026-2027',
      isCurrent: true,
    };

    const mockClass: any = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Class UKG',
    };

    const mockSection: any = {
      _id: new mongoose.Types.ObjectId(),
      name: 'A',
      classId: mockClass._id,
    };

    const mockRole: any = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Parent',
    };

    const mockParentUser: any = {
      _id: new mongoose.Types.ObjectId(),
      firstName: 'praveen',
      lastName: 'Guardian',
      email: 'parent.6212326547@ggps.internal',
    };

    const mockParentDoc: any = {
      _id: new mongoose.Types.ObjectId(),
      userId: mockParentUser._id,
      fatherName: 'praveen',
      primaryEmail: 'parent.6212326547@ggps.internal',
    };

    const mockAdminUser: any = {
      _id: adminId,
      isActive: true,
      isDeleted: false,
      status: 'Active',
      role: 'Admin',
    };

    jest.spyOn(User, 'findById').mockImplementation((id: any) => {
      if (String(id) === String(adminId)) {
        return {
          select: jest.fn().mockResolvedValue(mockAdminUser),
        } as any;
      }
      return Promise.resolve(null) as any;
    });

    const Counter = mongoose.models.Counter || mongoose.model('Counter');
    jest.spyOn(Counter, 'findOneAndUpdate').mockResolvedValue({ sequence: 1 } as any);

    jest.spyOn(Admission, 'findById').mockResolvedValue(mockAdmission);
    jest.spyOn(AcademicYear, 'findOne').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockAcademicYear),
    } as any);
    jest.spyOn(Class, 'findOne').mockResolvedValue(mockClass);
    jest.spyOn(Section, 'findOne').mockResolvedValue(mockSection);
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(Role, 'findOne').mockResolvedValue(mockRole);
    jest.spyOn(User, 'create').mockImplementation((data: any) => Promise.resolve({
      ...data,
      _id: mockParentUser._id,
    }) as any);
    jest.spyOn(Parent, 'findOne').mockResolvedValue(null);
    jest.spyOn(Parent, 'create').mockImplementation((data: any) => Promise.resolve({
      ...data,
      _id: mockParentDoc._id,
    }) as any);
    jest.spyOn(Student, 'exists').mockResolvedValue(false as any);
    jest.spyOn(Student, 'create').mockImplementation((data: any) => Promise.resolve({
      ...data,
      _id: new mongoose.Types.ObjectId(),
    }) as any);
    jest.spyOn(Enrollment, 'findOne').mockResolvedValue(null);
    jest.spyOn(Enrollment, 'create').mockImplementation((data: any) => Promise.resolve({
      ...data,
      _id: new mongoose.Types.ObjectId(),
    }) as any);
    jest.spyOn(StudentParent, 'findOneAndUpdate').mockResolvedValue({} as any);
    jest.spyOn(Notification, 'create').mockResolvedValue({} as any);

    const res = await request(app)
      .post(`/api/admissions/${admissionId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sectionName: 'A' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.student).toBeDefined();
    expect(res.body.student.firstName).toBe('ganesh');
    expect(res.body.student.lastName).toBe('ganesh');
    expect(res.body.parentUser.email).toBe('parent.6212326547@ggps.internal');
    expect(mockAdmission.save).toHaveBeenCalled();
  });

  it('handles idempotent re-approval gracefully when studentId is already created', async () => {
    const admissionId = new mongoose.Types.ObjectId();
    const existingStudentId = new mongoose.Types.ObjectId();

    const mockAdminUser: any = {
      _id: adminId,
      isActive: true,
      isDeleted: false,
      status: 'Active',
      role: 'Admin',
    };

    jest.spyOn(User, 'findById').mockImplementation((id: any) => {
      if (String(id) === String(adminId)) {
        return {
          select: jest.fn().mockResolvedValue(mockAdminUser),
        } as any;
      }
      return Promise.resolve(null) as any;
    });

    const mockAdmission: any = {
      _id: admissionId,
      studentId: existingStudentId,
      childFirstName: 'ganesh',
      childLastName: 'ganesh',
      gradeAppliedFor: 'Class UKG',
      parentName: 'praveen',
      contactNumber: '6212326547',
      status: 'Admission Confirmed',
      stage: 'Enrolled',
    };

    const mockExistingStudent: any = {
      _id: existingStudentId,
      studentId: 'GGPS2026UKG001',
      admissionNumber: 'GGPS2026Admin001',
      firstName: 'ganesh',
      lastName: 'ganesh',
      parentId: new mongoose.Types.ObjectId(),
    };

    jest.spyOn(Admission, 'findById').mockResolvedValue(mockAdmission);
    jest.spyOn(Student, 'findById').mockResolvedValue(mockExistingStudent);
    jest.spyOn(Enrollment, 'findOne').mockResolvedValue({
      studentId: existingStudentId,
      rollNumber: '001',
    } as any);
    jest.spyOn(Parent, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/admissions/${admissionId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sectionName: 'A' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.student.studentId).toBe('GGPS2026UKG001');
  });
});
