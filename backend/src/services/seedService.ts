import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import Role from '../models/Role';
import User from '../models/User';
import Parent from '../models/Parent';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import StudentParent from '../models/StudentParent';
import Employee from '../models/Employee';
import TeacherProfile from '../models/TeacherProfile';
import StudentAttendance from '../models/StudentAttendance';
import AcademicYear from '../models/AcademicYear';
import Class from '../models/Class';
import Section from '../models/Section';
import Fee from '../models/Fee';
import Assessment from '../models/Assessment';
import Payroll from '../models/Payroll';
import { ROLE_PERMISSIONS } from '../config/permissions';

export const seedDatabase = async () => {
  try {
    const options = { upsert: true, returnDocument: 'after' as const, runValidators: true };

    // 1. Seed Roles
    const seededRoles: Record<string, any> = {};
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const r = await Role.findOneAndUpdate(
        { name: roleName },
        { name: roleName, permissions },
        options
      );
      seededRoles[roleName] = r;
    }
    const adminRole = seededRoles['Admin'] || seededRoles['SuperAdmin'];
    const superAdminRole = seededRoles['SuperAdmin'] || adminRole;
    const principalRole = seededRoles['Principal'] || adminRole;
    const teacherRole = seededRoles['Teacher'];
    const accountantRole = seededRoles['Accountant'] || adminRole;
    const parentRole = seededRoles['Parent'];

    // 2. Hash default credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Create Academic Year
    const academicYear = await AcademicYear.findOneAndUpdate(
      { name: '2025-2026' },
      {
        name: '2025-2026',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-05-31'),
        status: 'active',
        isCurrent: true,
      },
      options
    );

    // 4. Create Class and Section
    const schoolClass = await Class.findOneAndUpdate(
      { name: 'LKG' },
      { name: 'LKG', description: 'Lower Kindergarten (LKG)' },
      options
    );

    const section = await Section.findOneAndUpdate(
      { name: 'A', classId: schoolClass._id },
      {
        name: 'A',
        classId: schoolClass._id,
        capacity: 30,
      },
      options
    );

    // 5. Create Core Users
    // Admin (admin@school.com)
    await User.findOneAndUpdate(
      { email: 'admin@school.com' },
      {
        email: 'admin@school.com',
        firstName: 'System',
        lastName: 'Admin',
        passwordHash: hashedPassword,
        role: adminRole._id,
        isActive: true,
        phoneNumber: '+91 98765 00001',
      },
      options
    );

    // Admin alias (admin@schoolerp.com)
    await User.findOneAndUpdate(
      { email: 'admin@schoolerp.com' },
      {
        email: 'admin@schoolerp.com',
        firstName: 'System',
        lastName: 'Admin',
        passwordHash: hashedPassword,
        role: adminRole._id,
        isActive: true,
        phoneNumber: '+91 98765 00002',
      },
      options
    );

    // Super Admin (superadmin@school.com)
    await User.findOneAndUpdate(
      { email: 'superadmin@school.com' },
      {
        email: 'superadmin@school.com',
        firstName: 'Chief',
        lastName: 'Executive',
        passwordHash: hashedPassword,
        role: superAdminRole._id,
        isActive: true,
        phoneNumber: '+91 98765 00003',
      },
      options
    );

    // Principal (principal@school.com)
    await User.findOneAndUpdate(
      { email: 'principal@school.com' },
      {
        email: 'principal@school.com',
        firstName: 'Anita',
        lastName: 'Desai',
        passwordHash: hashedPassword,
        role: principalRole._id,
        isActive: true,
        phoneNumber: '+91 98765 00004',
      },
      options
    );

    // Teacher (teacher@school.com)
    const teacherUser = await User.findOneAndUpdate(
      { email: 'teacher@school.com' },
      {
        firstName: 'Tom',
        lastName: 'Teacher',
        email: 'teacher@school.com',
        passwordHash: hashedPassword,
        role: teacherRole._id,
        isActive: true,
        phoneNumber: '+91 98765 00005',
        designation: 'Lead Instructor',
        salary: 4000,
        assignedClass: 'LKG',
      },
      options
    );

    const teacherEmployee = await Employee.findOneAndUpdate(
      { userId: teacherUser._id },
      {
        userId: teacherUser._id,
        employeeCode: 'EMP-T-001',
        designation: 'Lead Instructor',
        department: 'Teaching',
        joiningDate: new Date('2023-01-10'),
        status: 'Active',
      },
      options
    );

    await TeacherProfile.findOneAndUpdate(
      { userId: teacherUser._id },
      {
        userId: teacherUser._id,
        employeeId: teacherEmployee._id,
        qualification: 'Diploma in Early Childhood Education (D.E.C.Ed)',
        specialization: ['Phonics & English', 'Early Numeracy'],
        subjects: ['Phonics & English', 'Early Numeracy', 'Rhymes & Storytelling'],
        classes: ['LKG'],
      },
      options
    );

    // Accountant (accountant@school.com)
    const accountantUser = await User.findOneAndUpdate(
      { email: 'accountant@school.com' },
      {
        firstName: 'Alice',
        lastName: 'Accountant',
        email: 'accountant@school.com',
        passwordHash: hashedPassword,
        role: accountantRole._id,
        isActive: true,
        phoneNumber: '+91 98765 00006',
        designation: 'Senior Accountant',
        salary: 3500,
      },
      options
    );

    await Employee.findOneAndUpdate(
      { userId: accountantUser._id },
      {
        userId: accountantUser._id,
        employeeCode: 'EMP-A-002',
        designation: 'Senior Accountant',
        department: 'Finance',
        joiningDate: new Date('2023-03-15'),
        status: 'Active',
      },
      options
    );

    // Parent (parent@school.com)
    const parentUser = await User.findOneAndUpdate(
      { email: 'parent@school.com' },
      {
        firstName: 'Patty',
        lastName: 'Parent',
        email: 'parent@school.com',
        passwordHash: hashedPassword,
        role: parentRole._id,
        isActive: true,
        phoneNumber: '+91 98765 00007',
      },
      options
    );

    const parentProfile = await Parent.findOneAndUpdate(
      { userId: parentUser._id },
      {
        userId: parentUser._id,
        fatherName: 'Paul Parent',
        motherName: 'Patty Parent',
        primaryEmail: 'parent@school.com',
        fatherContact: '+91 98765 00007',
        whatsappNumber: '+91 98765 00007',
        address: '123 GGPS Campus Way',
      },
      options
    );

    // Student (Sammy Student)
    const student = await Student.findOneAndUpdate(
      { admissionNumber: 'GGPS-2026-LKG-001' },
      {
        firstName: 'Sammy',
        lastName: 'Student',
        admissionNumber: 'GGPS-2026-LKG-001',
        studentId: 'GGPS2026LKG001',
        grade: 'LKG',
        parentId: parentProfile._id,
        status: 'Active',
        bloodGroup: 'O+',
        medicalNotes: 'No known allergies.',
      },
      options
    );

    // Student (Aarav Sharma - TS-2026-0112)
    const aaravStudent = await Student.findOneAndUpdate(
      { admissionNumber: 'TS-2026-0112' },
      {
        firstName: 'Aarav',
        lastName: 'Sharma',
        admissionNumber: 'TS-2026-0112',
        studentId: 'TS-2026-0112',
        grade: 'LKG',
        section: 'A',
        parentId: parentProfile._id,
        status: 'Active',
        bloodGroup: 'O+',
        dateOfBirth: new Date('2021-04-15'),
        photoUrl: '/aarav-hero-student.jpg',
        emergencyContact: '+91 98765 43210',
        address: '123 Meadow Lane, Green Park, City',
        medicalNotes: 'No known allergies.',
      },
      options
    );

    // StudentParent links
    await StudentParent.findOneAndUpdate(
      { studentId: student._id, parentId: parentProfile._id },
      {
        studentId: student._id,
        parentId: parentProfile._id,
        relationship: 'Mother',
        isPrimary: true,
        canPickup: true,
      },
      options
    );

    await StudentParent.findOneAndUpdate(
      { studentId: aaravStudent._id, parentId: parentProfile._id },
      {
        studentId: aaravStudent._id,
        parentId: parentProfile._id,
        relationship: 'Father',
        isPrimary: true,
        canPickup: true,
      },
      options
    );

    // Enrollment
    await Enrollment.findOneAndUpdate(
      { studentId: student._id, academicYearId: academicYear._id },
      {
        studentId: student._id,
        academicYearId: academicYear._id,
        classId: schoolClass._id,
        sectionId: section._id,
        rollNumber: '01',
        status: 'Active',
        enrolledAt: new Date('2025-06-01'),
      },
      options
    );

    // Student Attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await StudentAttendance.findOneAndUpdate(
      { studentId: student._id, date: today },
      {
        studentId: student._id,
        academicYearId: academicYear._id,
        classId: schoolClass._id,
        sectionId: section._id,
        date: today,
        status: 'Present',
        recordedBy: teacherUser._id,
      },
      options
    );

    // Fee record
    await Fee.findOneAndUpdate(
      { studentId: student._id, feeType: 'Tuition' },
      {
        studentId: student._id,
        grade: 'LKG',
        feeType: 'Tuition',
        totalAmount: 32000,
        amountPaid: 32000,
        dueDate: new Date('2026-12-31'),
        status: 'Paid',
      },
      options
    );

    console.log('✓ Development seed completed: All roles and default credentials ready (password: password123)');
  } catch (error) {
    console.error('Error seeding development database:', error);
  }
};
