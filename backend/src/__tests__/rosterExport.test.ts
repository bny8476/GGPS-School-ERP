import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import classRoutes from '../routes/classRoutes';
import User from '../models/User';
import Class from '../models/Class';
import Section from '../models/Section';
import Student from '../models/Student';
import { generateAccessToken } from '../services/tokenService';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/classes', classRoutes);

describe('Roll-Call Roster Export & Download Controller & PDF Generation', () => {
  jest.setTimeout(30000);
  let adminToken: string;
  let teacherToken: string;
  let parentToken: string;
  let adminId: mongoose.Types.ObjectId;
  let teacherId: mongoose.Types.ObjectId;
  let parentId: mongoose.Types.ObjectId;

  beforeAll(() => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    adminId = new mongoose.Types.ObjectId();
    teacherId = new mongoose.Types.ObjectId();
    parentId = new mongoose.Types.ObjectId();

    jest.spyOn(User, 'findById').mockImplementation(((id: any) => {
      let role = 'Admin';
      if (String(id) === String(teacherId)) role = 'Teacher';
      if (String(id) === String(parentId)) role = 'Parent';

      const userDoc = {
        _id: id,
        role,
        isActive: true,
        isDeleted: false,
        status: 'Active',
        firstName: 'Priya',
        lastName: 'Sharma',
        assignedClass: 'LKG',
      };

      return {
        ...userDoc,
        select: jest.fn().mockResolvedValue(userDoc),
        then: (resolve: any) => Promise.resolve(userDoc).then(resolve),
      } as any;
    }) as any);

    jest.spyOn(Class, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        name: 'LKG',
        description: 'Lower Kindergarten',
        classTeacher: { firstName: 'Priya', lastName: 'Sharma' },
      }),
      then: (resolve: any) =>
        Promise.resolve({
          _id: new mongoose.Types.ObjectId(),
          name: 'LKG',
          description: 'Lower Kindergarten',
          classTeacher: { firstName: 'Priya', lastName: 'Sharma' },
        }).then(resolve),
    } as any);

    jest.spyOn(Section, 'findOne').mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        name: 'A',
        teacherId: { firstName: 'Priya', lastName: 'Sharma' },
      }),
    } as any);

    jest.spyOn(Student, 'find').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            firstName: 'Praveen',
            lastName: 'Student',
            admissionNumber: 'GGPS2026LKG001',
            rollNumber: '01',
            gender: 'Male',
            dateOfBirth: new Date('2022-07-12'),
            parentId: {
              fatherName: 'Paul Parent',
              fatherContact: '+91 98765 00007',
            },
            status: 'Active',
          },
          {
            _id: new mongoose.Types.ObjectId(),
            firstName: 'Aditya',
            lastName: 'Sundaram',
            admissionNumber: 'GGPS2026LKG002',
            rollNumber: '02',
            gender: 'Male',
            dateOfBirth: new Date('2022-07-12'),
            parentId: {
              motherName: 'Meera Sundaram',
              motherContact: '+91 98765 00008',
            },
            status: 'Active',
          },
        ]),
      }),
    } as any);

    adminToken = generateAccessToken({ id: adminId.toString(), role: 'Admin' });
    teacherToken = generateAccessToken({ id: teacherId.toString(), role: 'Teacher' });
    parentToken = generateAccessToken({ id: parentId.toString(), role: 'Parent' });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/classes/roster/export');
    expect(res.status).toBe(401);
  });

  it('rejects Parent role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/classes/roster/export')
      .set('Authorization', `Bearer ${parentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('allows Teacher to export roster as JSON preview dataset', async () => {
    const res = await request(app)
      .get('/api/v1/classes/roster/export?className=LKG&sectionName=A&format=json')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.roster).toBeDefined();
    expect(res.body.roster.className).toBe('LKG');
    expect(res.body.roster.sectionName).toBe('A');
    expect(res.body.roster.students).toHaveLength(2);
    expect(res.body.roster.students[0].name).toBe('Praveen Student');
    expect(res.body.roster.students[0].admissionNo).toBe('GGPS2026LKG001');
  });

  it('allows Teacher to export roster as CSV with correct headers and filename', async () => {
    const res = await request(app)
      .get('/api/v1/classes/roster/export?className=LKG&sectionName=A&academicYear=2026-2027&format=csv')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment; filename="GGPS_Roll_Call_Roster_LKG_A_2026-2027.csv"');
    expect(res.text).toContain('Roll Number,Student Name,Admission ID');
    expect(res.text).toContain('Praveen Student');
    expect(res.text).toContain('Aditya Sundaram');
  });

  it('generates binary PDF with application/pdf Content-Type and safe filename', async () => {
    const res = await request(app)
      .get('/api/v1/classes/roster/export?className=LKG&sectionName=A&academicYear=2026-2027&format=pdf')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment; filename="GGPS_Roll_Call_Roster_LKG_A_2026-2027.pdf"');
    expect(res.body).toBeDefined();
  });
});
