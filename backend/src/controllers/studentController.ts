import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student';
import Parent from '../models/Parent';
import Assessment from '../models/Assessment';
import Enrollment from '../models/Enrollment';
import StudentParent from '../models/StudentParent';
import AcademicYear from '../models/AcademicYear';
import Class from '../models/Class';
import Section from '../models/Section';
import { generateReportCardPDF } from '../utils/pdfGenerator';
import {
  generateNextAdmissionNumber,
  generateNextStudentID,
  generateNextRollNumber,
  peekNextIdentifiers,
} from '../services/sequenceService';
import { emitToRole, emitToRoom } from '../socket';
import { escapeRegex } from '../utils/sanitizers';

// Helper to resolve linked student IDs for a Parent user
export async function getLinkedStudentIdsForParent(parentUserId: string): Promise<mongoose.Types.ObjectId[]> {
  const parent = await Parent.findOne({ userId: parentUserId });
  if (!parent) return [];

  const [linkedRecords, directStudents] = await Promise.all([
    StudentParent.find({ parentId: parent._id }).select('studentId'),
    Student.find({ parentId: parent._id }).select('_id'),
  ]);

  const allIds = [
    ...linkedRecords.map((r) => r.studentId.toString()),
    ...directStudents.map((s) => s._id.toString()),
  ];

  return [...new Set(allIds)].map((id) => new mongoose.Types.ObjectId(id));
}

// @desc    Get all students (with search, filter, pagination, & role-based isolation)
// @route   GET /api/students
export const getStudents = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      className,
      sectionName,
      status,
    } = req.query;

    let query: Record<string, any> = {};

    // 1. Role-based isolation for Parents: strictly limit to their own children
    if (req.user?.role === 'Parent') {
      const allowedStudentIds = await getLinkedStudentIdsForParent(req.user.id);
      if (allowedStudentIds.length === 0) {
        // Return empty array / empty pagination if parent has no registered children
        if (page) {
          return res.json({ success: true, data: [], total: 0, page: Number(page), limit: Number(limit) || 20, totalPages: 0 });
        }
        return res.json([]);
      }
      query._id = { $in: allowedStudentIds };
    }

    // 2. Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // 3. Search by name, admissionNumber, studentId, parent name, phone number, class, and section
    if (search) {
      const searchTrimmed = String(search).trim();
      const searchRegex = new RegExp(escapeRegex(searchTrimmed), 'i');

      const [matchingParents, matchingClasses, matchingSections] = await Promise.all([
        Parent.find({
          $or: [
            { fatherName: searchRegex },
            { motherName: searchRegex },
            { fatherContact: searchRegex },
            { motherContact: searchRegex },
            { primaryEmail: searchRegex },
          ],
        }).select('_id'),
        Class.find({ name: searchRegex }).select('_id'),
        Section.find({ name: searchRegex }).select('_id'),
      ]);

      const parentIds = matchingParents.map((p) => p._id);
      const classIds = matchingClasses.map((c) => c._id);
      const sectionIds = matchingSections.map((s) => s._id);

      const orConditions: any[] = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { admissionNumber: searchRegex },
        { studentId: searchRegex },
        { emergencyContact: searchRegex },
        { grade: searchRegex },
      ];

      if (parentIds.length > 0) orConditions.push({ parentId: { $in: parentIds } });
      if (classIds.length > 0) orConditions.push({ classId: { $in: classIds } });
      if (sectionIds.length > 0) orConditions.push({ sectionId: { $in: sectionIds } });

      query.$or = orConditions;
    }

    // 4. Class & Section filter
    if (className) {
      const classDoc = await Class.findOne({ name: new RegExp(`^${className}$`, 'i') });
      if (classDoc) query.classId = classDoc._id;
    }

    if (sectionName) {
      const sectionDoc = await Section.findOne({ name: new RegExp(`^${sectionName}$`, 'i') });
      if (sectionDoc) query.sectionId = sectionDoc._id;
    }

    // Sorting
    const sortOptions: Record<string, 1 | -1> = {
      [String(sortBy)]: sortOrder === 'asc' ? 1 : -1,
    };

    // If pagination requested
    if (page) {
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [students, total] = await Promise.all([
        Student.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .populate('parentId', 'fatherName motherName primaryEmail fatherContact motherContact')
          .populate('classId', 'name')
          .populate('sectionId', 'name'),
        Student.countDocuments(query),
      ]);

      return res.json({
        success: true,
        data: students,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    // Default list response for backward compatibility
    const students = await Student.find(query)
      .sort(sortOptions)
      .limit(100)
      .populate('parentId', 'fatherName motherName primaryEmail fatherContact motherContact')
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    res.json(students);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching students', error });
  }
};

// @desc    Get single student by ID (with authorization verification)
// @route   GET /api/students/:id
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    // Role-based privacy verification: Parent can only view their own child
    if (req.user?.role === 'Parent') {
      const allowedStudentIds = await getLinkedStudentIdsForParent(req.user.id);
      const isAllowed = allowedStudentIds.some((sId) => sId.toString() === id);
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view this student profile.',
        });
      }
    }

    const student = await Student.findById(id)
      .populate('parentId', 'fatherName motherName primaryEmail fatherContact motherContact address')
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Also fetch active enrollment
    const enrollment = await Enrollment.findOne({ studentId: student._id, status: 'Active' })
      .populate('academicYearId', 'name isCurrent')
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    const result = {
      ...student.toObject(),
      enrollment,
      rollNumber: enrollment?.rollNumber,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving student details', error });
  }
};

// @desc    Preview next student identifiers (non-binding preview)
// @route   GET /api/students/preview-identifiers
export const previewStudentIdentifiers = async (req: Request, res: Response) => {
  try {
    const { academicYear, className, sectionName } = req.query;
    const preview = await peekNextIdentifiers(
      academicYear ? String(academicYear) : undefined,
      className ? String(className) : undefined,
      sectionName ? String(sectionName) : undefined
    );
    res.json(preview);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error previewing student identifiers', error });
  }
};

// @desc    Create a student with authoritative atomic ID generation & Enrollment creation
// @route   POST /api/students
export const createStudent = async (req: Request, res: Response) => {
  try {
    // 1. Resolve Academic Year
    let activeYear = await AcademicYear.findOne({ isCurrent: true });
    if (!activeYear) {
      activeYear = await AcademicYear.findOne().sort({ createdAt: -1 });
    }
    if (!activeYear) {
      activeYear = await AcademicYear.create({
        name: '2026-2027',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'active',
        isCurrent: true,
      });
    }

    // 2. Resolve Class Document (by ID or by name)
    let classDoc = null;
    if (req.body.classId && mongoose.isValidObjectId(req.body.classId)) {
      classDoc = await Class.findById(req.body.classId);
    }
    if (!classDoc && (req.body.className || req.body.grade)) {
      const cName = req.body.className || req.body.grade;
      classDoc = await Class.findOne({ name: { $regex: new RegExp(`^${cName}$`, 'i') } });
      if (!classDoc) {
        classDoc = await Class.create({ name: cName });
      }
    }

    // 3. Resolve Section Document (by ID or by name)
    let sectionDoc = null;
    if (req.body.sectionId && mongoose.isValidObjectId(req.body.sectionId)) {
      sectionDoc = await Section.findById(req.body.sectionId);
    }
    if (!sectionDoc && classDoc && req.body.sectionName) {
      const sName = req.body.sectionName;
      sectionDoc = await Section.findOne({ classId: classDoc._id, name: { $regex: new RegExp(`^${sName}$`, 'i') } });
      if (!sectionDoc) {
        sectionDoc = await Section.create({ name: sName, classId: classDoc._id, capacity: 30 });
      }
    }

    const yearStr = req.body.academicYear || activeYear?.name || '2026-27';
    const classStr = req.body.className || req.body.grade || classDoc?.name || 'LKG';
    const sectionStr = req.body.sectionName || sectionDoc?.name || 'A';

    // 4. Concurrency-safe atomic generation with retry on collision
    let student = null;
    let enrollment = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const studentId = await generateNextStudentID(yearStr, classStr);
        const admissionNumber = await generateNextAdmissionNumber(yearStr, classStr);
        const rollNumber = await generateNextRollNumber(yearStr, classStr, sectionStr);

        const studentData = {
          ...req.body,
          studentId,
          admissionNumber,
          grade: classStr,
          classId: classDoc?._id || req.body.classId,
          sectionId: sectionDoc?._id || req.body.sectionId,
          enrollmentDate: req.body.enrollmentDate || new Date(),
          status: 'Active',
        };

        student = await Student.create(studentData);

        enrollment = await Enrollment.create({
          studentId: student._id,
          academicYearId: activeYear._id,
          classId: classDoc?._id || student.classId,
          sectionId: sectionDoc?._id || student.sectionId,
          rollNumber,
          admissionDate: student.enrollmentDate || new Date(),
          status: 'Active',
        });

        break;
      } catch (err: any) {
        if (err.code === 11000 && attempts < maxAttempts) {
          console.warn(`Duplicate key collision during enrollment (attempt ${attempts}), retrying atomic counter...`);
          continue;
        }
        throw err;
      }
    }

    if (!student) {
      return res.status(500).json({ success: false, message: 'Failed to assign unique enrollment identifiers after retries' });
    }

    // 5. Relational Sync: If parentId is provided, link in StudentParent junction
    if (student.parentId) {
      try {
        await StudentParent.findOneAndUpdate(
          { studentId: student._id, parentId: student.parentId },
          {
            studentId: student._id,
            parentId: student.parentId,
            relationship: 'Guardian',
            isPrimary: true,
          },
          { upsert: true, new: true }
        );
      } catch (parentErr) {
        console.warn('Non-blocking StudentParent sync notice:', parentErr);
      }
    }

    emitToRole('Admin', 'student:created', { student, enrollment });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully with authoritative identifiers',
      student,
      enrollment,
      studentId: student.studentId,
      admissionNumber: student.admissionNumber,
      rollNumber: enrollment?.rollNumber,
      academicYear: yearStr,
      className: classStr,
      sectionName: sectionStr,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid student enrollment data', error });
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id / PATCH /api/students/:id
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      grade,
      classId,
      sectionId,
      bloodGroup,
      medicalNotes,
      emergencyContact,
      studentPhoto,
      parentId,
      enrollmentDate,
      status,
    } = req.body;

    const allowedUpdates: Record<string, any> = {};
    if (firstName !== undefined) allowedUpdates.firstName = firstName;
    if (lastName !== undefined) allowedUpdates.lastName = lastName;
    if (gender !== undefined) allowedUpdates.gender = gender;
    if (dateOfBirth !== undefined) allowedUpdates.dateOfBirth = dateOfBirth;
    if (grade !== undefined) allowedUpdates.grade = grade;
    if (classId !== undefined) allowedUpdates.classId = classId;
    if (sectionId !== undefined) allowedUpdates.sectionId = sectionId;
    if (bloodGroup !== undefined) allowedUpdates.bloodGroup = bloodGroup;
    if (medicalNotes !== undefined) allowedUpdates.medicalNotes = medicalNotes;
    if (emergencyContact !== undefined) allowedUpdates.emergencyContact = emergencyContact;
    if (studentPhoto !== undefined) allowedUpdates.studentPhoto = studentPhoto;
    if (parentId !== undefined) allowedUpdates.parentId = parentId;
    if (enrollmentDate !== undefined) allowedUpdates.enrollmentDate = enrollmentDate;
    if (status !== undefined) allowedUpdates.status = status;

    const student = await Student.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Sync enrollment if class or section changed
    if (student.classId) {
      try {
        const activeYear = (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne().sort({ createdAt: -1 }));
        if (activeYear) {
          await Enrollment.findOneAndUpdate(
            { studentId: student._id, academicYearId: activeYear._id },
            {
              studentId: student._id,
              academicYearId: activeYear._id,
              classId: student.classId,
              sectionId: student.sectionId,
              status: 'Active',
            },
            { upsert: true }
          );
        }
      } catch (enrollErr) {
        console.warn('Enrollment update sync warning:', enrollErr);
      }
    }

    // Sync parent if updated
    if (student.parentId) {
      try {
        await StudentParent.findOneAndUpdate(
          { studentId: student._id, parentId: student.parentId },
          {
            studentId: student._id,
            parentId: student.parentId,
            relationship: 'Guardian',
            isPrimary: true,
          },
          { upsert: true }
        );
      } catch (parentErr) {
        console.warn('StudentParent update sync warning:', parentErr);
      }
    }

    emitToRole('Admin', 'student:updated', student);

    res.json(student);
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid student update data', error });
  }
};

// @desc    Promote student to next academic year/class (Preserves history)
// @route   POST /api/students/:id/promote
export const promoteStudent = async (req: Request, res: Response) => {
  try {
    const { targetAcademicYearId, targetClassId, targetSectionId, remarks } = req.body;

    if (!targetAcademicYearId || !targetClassId) {
      return res.status(400).json({ success: false, message: 'Target academic year and class are required' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // 1. Mark previous active enrollment as 'Promoted'
    const prevEnrollment = await Enrollment.findOneAndUpdate(
      { studentId: student._id, status: 'Active' },
      { status: 'Promoted' },
      { new: true }
    );

    // 2. Resolve class and section names for roll number generation
    const [cDoc, sDoc, yearDoc] = await Promise.all([
      Class.findById(targetClassId),
      targetSectionId ? Section.findById(targetSectionId) : null,
      AcademicYear.findById(targetAcademicYearId),
    ]);

    const yearStr = yearDoc?.name || '2026-27';
    const classStr = cDoc?.name || 'Pre-KG';
    const sectionStr = sDoc?.name || 'A';

    const rollNumber = await generateNextRollNumber(yearStr, classStr, sectionStr);

    // 3. Create new Enrollment preserving history
    const newEnrollment = await Enrollment.create({
      studentId: student._id,
      academicYearId: targetAcademicYearId,
      classId: targetClassId,
      sectionId: targetSectionId || undefined,
      rollNumber,
      admissionDate: new Date(),
      status: 'Active',
      promotedFrom: prevEnrollment?._id,
      remarks: remarks || 'Promoted to next grade',
    });

    // 4. Update student profile with new active class
    student.classId = targetClassId;
    if (targetSectionId) student.sectionId = targetSectionId;
    student.grade = classStr;
    await student.save();

    res.json({
      success: true,
      message: `Student successfully promoted to ${classStr} (${yearStr})`,
      student,
      newEnrollment,
      previousEnrollment: prevEnrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error promoting student', error });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    // Clean up relational links
    await Enrollment.deleteMany({ studentId: student._id });
    await StudentParent.deleteMany({ studentId: student._id });
    res.json({ success: true, message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// @desc    Get student academic enrollments across all years
// @route   GET /api/students/:id/enrollments
export const getStudentEnrollments = async (req: Request, res: Response) => {
  try {
    if (req.user?.role === 'Parent') {
      const allowedStudentIds = await getLinkedStudentIdsForParent(req.user.id);
      const isAllowed = allowedStudentIds.some((sId) => sId.toString() === String(req.params.id));
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view enrollments for this student.',
        });
      }
    }

    const enrollments = await Enrollment.find({ studentId: req.params.id })
      .populate('academicYearId', 'name startDate endDate isCurrent')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// @desc    Get student guardians/parents
// @route   GET /api/students/:id/parents
export const getStudentParents = async (req: Request, res: Response) => {
  try {
    if (req.user?.role === 'Parent') {
      const allowedStudentIds = await getLinkedStudentIdsForParent(req.user.id);
      const isAllowed = allowedStudentIds.some((sId) => sId.toString() === String(req.params.id));
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view guardians for this student.',
        });
      }
    }

    const studentParents = await StudentParent.find({ studentId: req.params.id })
      .populate('parentId')
      .sort({ isPrimary: -1 });

    res.json(studentParents);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// @desc    Download Student Report Card PDF
// @route   GET /api/students/:id/report-card
export const downloadReportCard = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Ownership check for parent accounts
    if (req.user?.role === 'Parent') {
      const allowedStudentIds = await getLinkedStudentIdsForParent(req.user.id);
      const isAllowed = allowedStudentIds.some((sId) => sId.toString() === student._id.toString());

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view this report card.',
        });
      }
    }

    // Fetch assessments for this child
    const assessments = await Assessment.find({ childId: student._id }).sort({ date: 1 });

    // The utility will pipe directly to `res`
    generateReportCardPDF(res, student, assessments);
  } catch (error) {
    console.error('Report Card PDF Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Report Card' });
  }
};
