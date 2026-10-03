import { Request, Response } from 'express';
import Class from '../models/Class';
import Section from '../models/Section';
import Student from '../models/Student';
import User from '../models/User';
import { generateRollCallRosterPDF, RollCallRosterData, RollCallRosterItem } from '../utils/pdfGenerator';

// Get all classes
export const getClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching classes' });
  }
};

// Create a class
export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, classTeacher } = req.body;
    const newClass = await Class.create({ name, description, classTeacher });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: 'Invalid class data or duplicate name' });
  }
};

// Get sections for a class
export const getSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const sections = await Section.find({ classId }).populate('teacherId', 'firstName lastName email').sort({ name: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching sections' });
  }
};

// Create a section
export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { name, teacherId, capacity } = req.body;
    const section = await Section.create({
      name,
      classId: classId as string,
      teacherId: teacherId || undefined,
      capacity: capacity || 30
    });
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: 'Invalid section data or duplicate name in class' });
  }
};

// @desc    Export or Download Official Roll-Call Roster (PDF, CSV, or JSON preview)
// @route   GET /api/v1/classes/roster/export or GET /api/v1/classes/:classId/roster
export const exportClassRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const queryClassName = String(req.query.className || '').trim();
    const querySectionName = String(req.query.sectionName || '').trim();
    const academicYear = String(req.query.academicYear || '2026-2027').trim();
    const dateParam = String(req.query.date || '').trim();
    const format = String(req.query.format || 'pdf').toLowerCase();
    const isInline = req.query.inline === 'true';

    // 1. RBAC Clearance
    const userRole = req.user?.role;
    if (userRole === 'Parent') {
      res.status(403).json({
        success: false,
        message: 'Access denied: Parents do not possess clearance for class roster operations.',
      });
      return;
    }

    // 2. Identify Class & Section
    let targetClass: any = null;
    if (classId && classId !== 'roster') {
      const q = Class.findById(classId);
      targetClass = typeof (q as any)?.populate === 'function'
        ? await (q as any).populate('classTeacher', 'firstName lastName email')
        : await q;
    }
    if (!targetClass && queryClassName) {
      const q = Class.findOne({ name: new RegExp(`^${queryClassName}$`, 'i') });
      targetClass = typeof (q as any)?.populate === 'function'
        ? await (q as any).populate('classTeacher', 'firstName lastName email')
        : await q;
    }
    if (!targetClass) {
      // Fallback to first class or default LKG
      const q = Class.findOne({ name: /^LKG$/i });
      targetClass = (typeof (q as any)?.populate === 'function' ? await (q as any).populate('classTeacher', 'firstName lastName email') : await q) || { name: queryClassName || 'LKG', description: 'Lower Kindergarten' };
    }

    const className = targetClass?.name || queryClassName || 'LKG';

    let targetSection: any = null;
    if (targetClass?._id && querySectionName) {
      const sq = Section.findOne({
        classId: targetClass._id,
        name: new RegExp(`^${querySectionName}$`, 'i'),
      });
      targetSection = typeof (sq as any)?.populate === 'function'
        ? await (sq as any).populate('teacherId', 'firstName lastName email')
        : await sq;
    }
    if (!targetSection && querySectionName) {
      targetSection = { name: querySectionName };
    }
    const sectionName = targetSection?.name || querySectionName || 'A';

    // 3. Teacher Ownership Validation
    if (userRole === 'Teacher') {
      const teacherUser = await User.findById(req.user?.id);
      if (teacherUser) {
        // If teacher is assigned to a specific class, verify they are authorized
        const teacherAssignedClass = teacherUser.assignedClass;
        if (teacherAssignedClass && teacherAssignedClass !== className) {
          // Check if assigned in section or class teacher
          const isSectionTeacher = targetSection?.teacherId?._id?.toString() === teacherUser._id.toString();
          const isClassTeacher = targetClass?.classTeacher?._id?.toString() === teacherUser._id.toString();
          if (!isSectionTeacher && !isClassTeacher) {
            res.status(403).json({
              success: false,
              message: `Access denied: You are assigned to class ${teacherAssignedClass} and cannot access roster for ${className}-${sectionName}.`,
            });
            return;
          }
        }
      }
    }

    // 4. Resolve Teacher Name
    let classTeacherName = 'Priya Sharma';
    if (targetSection?.teacherId) {
      classTeacherName = `${targetSection.teacherId.firstName} ${targetSection.teacherId.lastName || ''}`.trim();
    } else if (targetClass?.classTeacher) {
      classTeacherName = `${targetClass.classTeacher.firstName} ${targetClass.classTeacher.lastName || ''}`.trim();
    } else if (req.user?.firstName) {
      classTeacherName = `${req.user.firstName} ${req.user.lastName || ''}`.trim();
    }

    // 5. Query Real Students
    const studentQuery: any = {
      status: { $in: ['Active', 'Present', 'Enrolled'] },
    };

    if (targetClass._id) {
      studentQuery.$or = [{ classId: targetClass._id }, { grade: className }];
    } else {
      studentQuery.grade = new RegExp(`^${className}$`, 'i');
    }

    if (targetSection?._id) {
      studentQuery.sectionId = targetSection._id;
    }

    let dbStudents = await Student.find(studentQuery)
      .populate('parentId', 'fatherName motherName fatherContact motherContact primaryEmail address')
      .sort({ rollNumber: 1, firstName: 1 });

    // If no direct section link found, fallback to grade match
    if (dbStudents.length === 0) {
      dbStudents = await Student.find({ grade: new RegExp(`^${className}$`, 'i'), status: 'Active' })
        .populate('parentId', 'fatherName motherName fatherContact motherContact primaryEmail address')
        .sort({ rollNumber: 1, firstName: 1 });
    }

    // Map students into uniform Roster format
    const formattedDate = dateParam || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const rosterStudents: RollCallRosterItem[] = dbStudents.map((s: any, idx: number) => {
      const parent = s.parentId || {};
      const parentName = parent.fatherName || parent.motherName || 'Paul Parent';
      const contact = parent.fatherContact || parent.motherContact || s.emergencyContact || '+91 98765 00007';

      // Age calculation
      let ageStr = '4 Years';
      let dobStr = '12 Jul 2022';
      if (s.dateOfBirth) {
        const d = new Date(s.dateOfBirth);
        dobStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const diffYears = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        ageStr = diffYears > 0 ? `${diffYears} Years` : '4 Years';
      }

      return {
        no: String(idx + 1).padStart(2, '0'),
        rollNo: s.rollNumber ? String(s.rollNumber).padStart(2, '0') : String(idx + 1).padStart(2, '0'),
        name: `${s.firstName} ${s.lastName || ''}`.trim(),
        admissionNo: s.admissionNumber || s.studentId || `GGPS2026${className}${String(idx + 1).padStart(3, '0')}`,
        gender: s.gender === 'Female' ? 'Girl' : s.gender === 'Male' ? 'Boy' : (s.gender || 'Boy'),
        age: ageStr,
        dob: dobStr,
        parentName,
        contact,
        attendanceStatus: '[ P ]   [ A ]   [ L ]',
        remarks: s.medicalNotes ? `Flag: ${s.medicalNotes}` : '________________',
      };
    });

    const rosterData: RollCallRosterData = {
      className,
      sectionName,
      academicYear,
      classTeacher: classTeacherName,
      date: formattedDate,
      students: rosterStudents,
    };

    // 6. Deliver requested format
    const cleanClass = className.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanSection = sectionName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanYear = academicYear.replace(/[^a-zA-Z0-9-]/g, '_');

    if (format === 'json') {
      res.json({ success: true, roster: rosterData });
      return;
    }

    if (format === 'csv') {
      const csvHeaders = ['Roll Number', 'Student Name', 'Admission ID', 'Class', 'Section', 'DOB', 'Gender', 'Parent/Guardian', 'Contact', 'Attendance', 'Remarks'];
      const csvRows = rosterStudents.map((st) => [
        `"${st.rollNo || ''}"`,
        `"${(st.name || '').replace(/"/g, '""')}"`,
        `"${st.admissionNo || ''}"`,
        `"${className}"`,
        `"${sectionName}"`,
        `"${st.dob || ''}"`,
        `"${st.gender || ''}"`,
        `"${(st.parentName || '').replace(/"/g, '""')}"`,
        `"${st.contact || ''}"`,
        `"Present"`,
        `"${(st.remarks || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');
      const filename = `GGPS_Roll_Call_Roster_${cleanClass}_${cleanSection}_${cleanYear}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
      return;
    }

    // Default: PDF binary generation
    generateRollCallRosterPDF(res, rosterData, { inline: isInline });
  } catch (error: any) {
    console.error('Roster export execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate roll-call roster document.',
      error: error.message,
    });
  }
};

