import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Core Identity & Auth
import Role from './models/Role';
import User from './models/User';
import Parent from './models/Parent';
import Student from './models/Student';

// Relational & Domain Models (Phases 2-4)
import Enrollment from './models/Enrollment';
import StudentParent from './models/StudentParent';
import Employee from './models/Employee';
import TeacherProfile from './models/TeacherProfile';
import StudentAttendance from './models/StudentAttendance';
import AcademicYear from './models/AcademicYear';
import Class from './models/Class';
import Section from './models/Section';
import Fee from './models/Fee';
import Assessment from './models/Assessment';
import Payroll from './models/Payroll';
import { ROLE_PERMISSIONS } from './config/permissions';

dotenv.config();

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    const options = { upsert: true, new: true, runValidators: true };

    // 1. Initialize Roles with Canonical Capability-based RBAC permissions
    console.log('Seeding Roles...');
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
    const principalRole = seededRoles['Principal'];
    const teacherRole = seededRoles['Teacher'];
    const accountantRole = seededRoles['Accountant'];
    const parentRole = seededRoles['Parent'];
    console.log('✓ Canonical Roles seeded from ROLE_PERMISSIONS configuration');

    // 2. Hash default credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Create Academic Year
    console.log('Seeding Academic Year...');
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
    if (!academicYear) throw new Error('Failed to create academic year');
    console.log('✓ Academic Year created: 2025-2026 (Active)');

    // 4. Create Class and Section
    console.log('Seeding Class & Section...');
    const schoolClass = await Class.findOneAndUpdate(
      { name: 'LKG' },
      { name: 'LKG', description: 'Lower Kindergarten (LKG)' },
      options
    );
    if (!schoolClass) throw new Error('Failed to create class');

    const section = await Section.findOneAndUpdate(
      { name: 'A', classId: schoolClass._id },
      {
        name: 'A',
        classId: schoolClass._id,
        capacity: 30,
      },
      options
    );
    if (!section) throw new Error('Failed to create section');
    console.log('✓ Class & Section created: LKG - Section A');

    // 5. Create Staff / SuperAdmin
    console.log('Seeding Users & Staff Profiles...');
    const staffUser = await User.findOneAndUpdate(
      { email: 'admin@schoolerp.com' },
      {
        email: 'admin@schoolerp.com',
        firstName: 'System',
        lastName: 'Admin',
        passwordHash: hashedPassword,
        role: adminRole._id,
        isActive: true,
        phoneNumber: '1234567890',
      },
      options
    );
    if (!staffUser) throw new Error('Failed to create admin user');
    console.log('  Admin User: admin@schoolerp.com / password123');

    // 6. Create Teacher User + Employee record + TeacherProfile
    const teacherUser = await User.findOneAndUpdate(
      { email: 'teacher@school.com' },
      {
        firstName: 'Tom',
        lastName: 'Teacher',
        email: 'teacher@school.com',
        passwordHash: hashedPassword,
        role: teacherRole._id,
        isActive: true,
        phoneNumber: '0987654321',
        designation: 'Lead Instructor',
        salary: 4000,
      },
      options
    );
    if (!teacherUser) throw new Error('Failed to create teacher user');

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
    if (!teacherEmployee) throw new Error('Failed to create teacher employee');

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
    console.log('  Teacher User & Profile: teacher@school.com / password123 (EMP-T-001)');

    // 7. Create Accountant User + Employee record
    const accountantUser = await User.findOneAndUpdate(
      { email: 'accountant@school.com' },
      {
        firstName: 'Alice',
        lastName: 'Accountant',
        email: 'accountant@school.com',
        passwordHash: hashedPassword,
        role: accountantRole._id,
        isActive: true,
        phoneNumber: '5559876543',
        designation: 'Senior Accountant',
        salary: 3500,
      },
      options
    );
    if (!accountantUser) throw new Error('Failed to create accountant user');

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
    console.log('  Accountant User: accountant@school.com / password123 (EMP-A-002)');

    // 8. Create Parent User + Detailed Parent Profile
    const parentUser = await User.findOneAndUpdate(
      { email: 'parent@school.com' },
      {
        firstName: 'Patty',
        lastName: 'Parent',
        email: 'parent@school.com',
        passwordHash: hashedPassword,
        role: parentRole._id,
        isActive: true,
        phoneNumber: '5551234567',
      },
      options
    );
    if (!parentUser) throw new Error('Failed to create parent user');

    const parentProfile = await Parent.findOneAndUpdate(
      { userId: parentUser._id },
      {
        userId: parentUser._id,
        fatherName: 'Paul Parent',
        motherName: 'Patty Parent',
        primaryEmail: 'parent@school.com',
        fatherContact: '5551234567',
        whatsappNumber: '+15551234567',
        address: '123 Family Lane',
      },
      options
    );
    if (!parentProfile) throw new Error('Failed to create parent profile');
    console.log('  Parent User & Profile: parent@school.com / password123');

    // 9. Create Student (Record Only, not an auth account)
    console.log('Seeding Student & Academic Relationships...');
    const student = await Student.findOneAndUpdate(
      { admissionNumber: { $in: ['SEED001', 'SEED-001'] } },
      {
        firstName: 'Sammy',
        lastName: 'Student',
        admissionNumber: 'SEED001',
        grade: 'LKG',
        parentId: parentProfile._id,
        status: 'Active',
        bloodGroup: 'O+',
        medicalNotes: 'No known allergies.',
      },
      options
    );
    if (!student) throw new Error('Failed to create student');
    console.log('✓ Student created: Sammy Student (SEED001)');

    // 10. StudentParent Junction (M:N Multi-Child / Multi-Guardian)
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
    console.log('✓ StudentParent link created (Mother / Primary Pickup)');

    // 11. Enrollment (Academic Progression)
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
    console.log('✓ Enrollment link created (LKG-A / Roll #01)');

    // 12. Student Attendance Record
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
    console.log('✓ StudentAttendance record logged (Present)');

    // 13. Fee Record
    await Fee.findOneAndUpdate(
      { studentId: student._id, feeType: 'Tuition' },
      {
        studentId: student._id,
        grade: 'LKG',
        feeType: 'Tuition',
        totalAmount: 1200,
        amountPaid: 1200,
        dueDate: new Date('2025-12-31'),
        status: 'Paid',
      },
      options
    );
    console.log('✓ Fee invoice seeded (Tuition $1,200 - Paid)');

    // 14. Assessment for Sammy
    await Assessment.deleteMany({ childId: student._id });
    await Assessment.create({
      childId: student._id,
      term: 'Term 1',
      rubrics: [
        { category: 'Mathematics', skill: 'Number recognition 1-100', score: 'Mastered' },
        { category: 'Science', skill: 'Identifies plant parts', score: 'Developing' },
        { category: 'Social Skills', skill: 'Collaborates with peers', score: 'Mastered' },
      ],
      teacherComments: 'Sammy demonstrates remarkable curiosity and enthusiasm in class.',
      createdBy: teacherUser._id,
    });
    console.log('✓ Assessment created for Sammy Student.');

    // 15. Payroll Record for Teacher Tom
    await Payroll.deleteMany({ staffId: teacherUser._id, month: 'June 2026' });
    await Payroll.create({
      staffId: teacherUser._id,
      month: 'June 2026',
      baseSalary: 4000,
      attendanceDays: 30,
      deductions: 0,
      bonuses: 200,
      netSalary: 4200,
      status: 'Paid',
      paymentDate: new Date(),
    });
    console.log('✓ Payroll record created for Tom Teacher ($4,200).');

    console.log('\n==========================================');
    console.log('🎉 Seed completed successfully!');
    console.log('All normalized relational models populated.');
    console.log('==========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
