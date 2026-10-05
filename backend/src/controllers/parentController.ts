import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Parent from '../models/Parent';
import Student from '../models/Student';
import StudentParent from '../models/StudentParent';
import StudentAttendance from '../models/StudentAttendance';
import DailyDiary from '../models/DailyDiary';
import ClassWork from '../models/ClassWork';
import Homework from '../models/Homework';
import ClassroomActivity from '../models/ClassroomActivity';
import Assessment from '../models/Assessment';
import TimeTable from '../models/TimeTable';
import Fee from '../models/Fee';
import Notification from '../models/Notification';
import { generateReportCardPDF } from '../utils/pdfGenerator';

/**
 * Authoritative Security Helper:
 * Verifies that the authenticated user has explicit, verified permission
 * to access the requested student's sensitive records.
 */
export async function verifyParentCanAccessStudent(
  user: any,
  studentId: string
): Promise<{
  allowed: boolean;
  status: number;
  message?: string;
  parent?: any;
  student?: any;
}> {
  if (!user?.id) {
    return { allowed: false, status: 401, message: 'Authentication required' };
  }

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return { allowed: false, status: 400, message: 'Invalid child ID format' };
  }

  const student = await Student.findById(studentId)
    .populate('classId', 'name')
    .populate('sectionId', 'name');

  if (!student) {
    return { allowed: false, status: 404, message: 'Child record not found' };
  }

  const role = user.role || '';
  // SuperAdmin, Admin, Principal have full administrative access
  if (['SuperAdmin', 'Admin', 'Principal'].includes(role)) {
    return { allowed: true, status: 200, student };
  }

  // Teacher has access to student records in academic context
  if (role === 'Teacher') {
    return { allowed: true, status: 200, student };
  }

  // Parent MUST have an active ParentStudentRelationship in the database
  if (role === 'Parent') {
    const parent = await Parent.findOne({
      $or: [{ userId: user.id }, { primaryEmail: user.email }],
    });

    if (!parent) {
      return {
        allowed: false,
        status: 403,
        message: 'No parent profile associated with this account',
      };
    }

    // Check StudentParent junction table
    const relationship = await StudentParent.findOne({
      parentId: parent._id,
      studentId: student._id,
      status: { $ne: 'inactive' },
    });

    // Also check direct student.parentId
    const isDirect = student.parentId && String(student.parentId) === String(parent._id);

    if (!relationship && !isDirect) {
      return {
        allowed: false,
        status: 403,
        message: "Access denied: You don't have permission to view this child's information.",
      };
    }

    return { allowed: true, status: 200, parent, student };
  }

  return { allowed: false, status: 403, message: 'Access denied' };
}

// ==========================================
// 1. ADMIN PARENT MANAGEMENT
// ==========================================

// Get all parents (Admin / Staff)
export const getParents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page, limit } = req.query;
    let query: Record<string, any> = {};

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { fatherName: searchRegex },
        { motherName: searchRegex },
        { guardianName: searchRegex },
        { primaryEmail: searchRegex },
        { fatherContact: searchRegex },
        { motherContact: searchRegex },
      ];
    }

    if (page) {
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [parents, total] = await Promise.all([
        Parent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Parent.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: parents,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
      return;
    }

    const parents = await Parent.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(parents);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving parents', error });
  }
};

// Create a parent profile directly
export const createParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const newParent = await Parent.create(req.body);
    res.status(201).json({ success: true, parent: newParent });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid parent data', error });
  }
};

// Get a single parent with all linked children (Admin view)
export const getParentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const parentId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!parentId || !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ success: false, message: 'Invalid parent ID format' });
      return;
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent not found' });
      return;
    }

    const linkedRecords = await StudentParent.find({
      parentId: parent._id,
      status: { $ne: 'inactive' },
    }).populate({
      path: 'studentId',
      populate: ['classId', 'sectionId'],
    });

    const directStudents = await Student.find({ parentId: parent._id })
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    // Consolidate children
    const childMap = new Map<string, any>();
    for (const r of linkedRecords) {
      if (r.studentId) {
        childMap.set(String((r.studentId as any)._id), {
          student: r.studentId,
          relationship: r.relationship,
          isPrimary: r.isPrimary,
          emergencyContact: r.emergencyContact,
          canPickup: r.canPickup,
        });
      }
    }
    for (const s of directStudents) {
      const sId = String(s._id);
      if (!childMap.has(sId)) {
        childMap.set(sId, {
          student: s,
          relationship: 'Guardian',
          isPrimary: true,
          emergencyContact: true,
          canPickup: true,
        });
      }
    }

    const relationships = Array.from(childMap.values());
    const children = relationships.map((r) => r.student);

    res.json({
      success: true,
      parent,
      relationships,
      students: children,
      children,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving parent', error });
  }
};

// Update a parent profile
export const updateParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const parentId = Array.isArray(rawId) ? rawId[0] : rawId;

    const parent = await Parent.findByIdAndUpdate(parentId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent not found' });
      return;
    }
    res.json({ success: true, parent });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid parent data', error });
  }
};

// ==========================================
// 2. ADMIN CHILD LINK MANAGEMENT
// ==========================================

// Get all children linked to a specific parent (Admin)
export const getParentChildren = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const parentId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!parentId || !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ success: false, message: 'Invalid parent ID format' });
      return;
    }

    let parent = await Parent.findById(parentId);
    if (!parent) {
      parent = await Parent.findOne({ userId: parentId });
    }
    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent record not found' });
      return;
    }

    const links = await StudentParent.find({
      parentId: parent._id,
      status: { $ne: 'inactive' },
    }).populate({
      path: 'studentId',
      populate: ['classId', 'sectionId'],
    });

    const directStudents = await Student.find({
      parentId: parent._id,
      status: { $ne: 'Inactive' },
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    const result = links.map((l) => ({
      _id: l._id,
      studentId: l.studentId,
      relationship: l.relationship,
      isPrimary: l.isPrimary,
      emergencyContact: l.emergencyContact,
      canPickup: l.canPickup,
      receivesNotifications: l.receivesNotifications,
      createdAt: l.createdAt,
    }));

    // Add any direct students not already in junction table
    const linkedStudentIds = new Set(links.map((l: any) => String(l.studentId?._id || l.studentId)));
    for (const ds of directStudents) {
      if (!linkedStudentIds.has(String(ds._id))) {
        result.push({
          _id: ds._id,
          studentId: ds,
          relationship: 'Guardian' as any,
          isPrimary: true,
          emergencyContact: true,
          canPickup: true,
          receivesNotifications: true,
          createdAt: ds.createdAt,
        });
      }
    }

    res.json({ success: true, children: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving linked children', error });
  }
};

// Link a child to a parent (Admin)
export const linkChildToParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const parentId = Array.isArray(rawId) ? rawId[0] : rawId;
    const {
      studentId,
      relationship = 'Guardian',
      isPrimary = false,
      emergencyContact = true,
      canPickup = true,
      receivesNotifications = true,
    } = req.body;

    if (!parentId || !mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400).json({ success: false, message: 'Invalid parent ID format' });
      return;
    }

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({ success: false, message: 'Valid studentId is required' });
      return;
    }

    let parent = await Parent.findById(parentId);
    if (!parent) {
      parent = await Parent.findOne({ userId: parentId });
    }
    const student = await Student.findById(studentId);

    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent record not found' });
      return;
    }

    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found' });
      return;
    }

    // Verify school isolation: student and admin/parent must belong to same school if specified
    const adminSchoolId = req.user?.schoolId;
    if (adminSchoolId && student.schoolId && String(adminSchoolId) !== String(student.schoolId)) {
      res.status(400).json({
        success: false,
        message: 'Cannot link a student belonging to a different school.',
      });
      return;
    }

    // Canonicalize relationship
    const canonicalRel =
      ['Father', 'Mother', 'Guardian', 'Other'].find(
        (r) => r.toLowerCase() === String(relationship).toLowerCase()
      ) || 'Guardian';

    // Upsert StudentParent link
    const link = await StudentParent.findOneAndUpdate(
      { parentId: parent._id, studentId: student._id },
      {
        parentId: parent._id,
        studentId: student._id,
        relationship: canonicalRel,
        relationshipType: canonicalRel,
        isPrimary: Boolean(isPrimary),
        emergencyContact: Boolean(emergencyContact),
        isEmergencyContact: Boolean(emergencyContact),
        canPickup: Boolean(canPickup),
        receivesNotifications: Boolean(receivesNotifications),
        status: 'active',
        schoolId: student.schoolId || adminSchoolId,
        campusId: student.campusId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If primary or student has no parentId, set student.parentId
    if (isPrimary || !student.parentId) {
      await Student.findByIdAndUpdate(student._id, { parentId: parent._id });
    }

    res.status(201).json({
      success: true,
      message: `${student.firstName} ${student.lastName} linked to parent successfully.`,
      relationship: link,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error linking child to parent',
      error,
    });
  }
};

// Unlink a child from a parent (Admin)
export const unlinkChildFromParent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: rawParentId, childId: rawChildId } = req.params;
    const parentId = Array.isArray(rawParentId) ? rawParentId[0] : rawParentId;
    const childId = Array.isArray(rawChildId) ? rawChildId[0] : rawChildId;

    if (!parentId || !childId) {
      res.status(400).json({ success: false, message: 'Parent ID and Child ID are required' });
      return;
    }

    let parent = await Parent.findById(parentId);
    if (!parent) {
      parent = await Parent.findOne({ userId: parentId });
    }
    const resolvedParentId = parent ? parent._id : parentId;

    // Remove StudentParent junction
    await StudentParent.findOneAndDelete({ parentId: resolvedParentId, studentId: childId });

    // If student's direct parentId was this parent, reassign to another active linked parent if any
    const student = await Student.findById(childId);
    if (student && String(student.parentId) === String(resolvedParentId)) {
      const remainingLink = await StudentParent.findOne({
        studentId: childId,
        status: { $ne: 'inactive' },
      }).sort({ isPrimary: -1, createdAt: 1 });

      const newParentId = remainingLink ? remainingLink.parentId : undefined;
      await Student.findByIdAndUpdate(childId, {
        $set: { parentId: newParentId },
      });
    }

    res.json({
      success: true,
      message: 'Child unlinked from parent successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error unlinking child from parent',
      error,
    });
  }
};

// Update relationship details between parent and child (Admin)
export const updateChildRelationship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: rawParentId, childId: rawChildId } = req.params;
    const parentId = Array.isArray(rawParentId) ? rawParentId[0] : rawParentId;
    const childId = Array.isArray(rawChildId) ? rawChildId[0] : rawChildId;
    const { relationship, isPrimary, emergencyContact, canPickup, receivesNotifications, status } = req.body;

    let parent = await Parent.findById(parentId);
    if (!parent) {
      parent = await Parent.findOne({ userId: parentId });
    }
    const resolvedParentId = parent ? parent._id : parentId;

    const updates: Record<string, any> = {};
    if (relationship !== undefined) {
      const canonicalRel =
        ['Father', 'Mother', 'Guardian', 'Other'].find(
          (r) => r.toLowerCase() === String(relationship).toLowerCase()
        ) || 'Guardian';
      updates.relationship = canonicalRel;
      updates.relationshipType = canonicalRel;
    }
    if (isPrimary !== undefined) updates.isPrimary = Boolean(isPrimary);
    if (emergencyContact !== undefined) {
      updates.emergencyContact = Boolean(emergencyContact);
      updates.isEmergencyContact = Boolean(emergencyContact);
    }
    if (canPickup !== undefined) updates.canPickup = Boolean(canPickup);
    if (receivesNotifications !== undefined) updates.receivesNotifications = Boolean(receivesNotifications);
    if (status !== undefined) updates.status = status;

    const link = await StudentParent.findOneAndUpdate(
      { parentId: resolvedParentId, studentId: childId },
      { $set: updates },
      { new: true }
    );

    if (!link) {
      res.status(404).json({ success: false, message: 'Relationship record not found' });
      return;
    }

    if (isPrimary) {
      await Student.findByIdAndUpdate(childId, { parentId });
    }

    res.json({
      success: true,
      message: 'Child relationship updated successfully.',
      relationship: link,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Error updating relationship',
      error,
    });
  }
};

// ==========================================
// 3. LOGGED-IN PARENT SELF-MANAGEMENT & LINKED CHILDREN
// ==========================================

// Get logged-in parent's profile with real, verified linked children
export const getMyParentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let parent = await Parent.findOne({
      $or: [{ userId: req.user.id }, { primaryEmail: req.user.email }],
    });

    // If parent record doesn't exist yet for this parent user, auto-create matching Parent profile
    if (!parent) {
      const user = await mongoose.model('User').findById(req.user.id);
      if (user) {
        parent = await Parent.create({
          userId: user._id,
          fatherName: `${user.firstName} ${user.lastName}`.trim(),
          motherName: 'Mother',
          primaryEmail: user.email,
          address: 'Registered Address',
          fatherContact: user.phoneNumber || '',
        });
      }
    }

    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found for this account.' });
      return;
    }

    // Authoritative lookup: Find children strictly linked via StudentParent OR Student.parentId
    const linkedRecords = await StudentParent.find({
      parentId: parent._id,
      status: { $ne: 'inactive' },
    }).select('studentId');

    const directStudents = await Student.find({
      parentId: parent._id,
      status: { $ne: 'Inactive' },
    }).select('_id');

    const allStudentIds = [
      ...new Set([
        ...linkedRecords.map((r) => String(r.studentId)),
        ...directStudents.map((s) => String(s._id)),
      ]),
    ];

    if (allStudentIds.length === 0) {
      // Clean empty state — NEVER expose unrelated students
      res.json({
        success: true,
        parent,
        children: [],
      });
      return;
    }

    const children = await Student.find({
      _id: { $in: allStudentIds.map((id) => new mongoose.Types.ObjectId(id)) },
      status: { $ne: 'Inactive' },
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    res.json({
      success: true,
      parent,
      children,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving parent profile', error });
  }
};

// Get only logged-in parent's linked children
export const getMyChildren = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const parent = await Parent.findOne({
      $or: [{ userId: req.user.id }, { primaryEmail: req.user.email }],
    });

    if (!parent) {
      res.json({ success: true, children: [] });
      return;
    }

    const linkedRecords = await StudentParent.find({
      parentId: parent._id,
      status: { $ne: 'inactive' },
    }).select('studentId');

    const directStudents = await Student.find({
      parentId: parent._id,
      status: { $ne: 'Inactive' },
    }).select('_id');

    const allStudentIds = [
      ...new Set([
        ...linkedRecords.map((r) => String(r.studentId)),
        ...directStudents.map((s) => String(s._id)),
      ]),
    ];

    if (allStudentIds.length === 0) {
      res.json({ success: true, children: [] });
      return;
    }

    const children = await Student.find({
      _id: { $in: allStudentIds.map((id) => new mongoose.Types.ObjectId(id)) },
      status: { $ne: 'Inactive' },
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    res.json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving children', error });
  }
};

// Update logged-in parent's own profile/contact info
export const updateMyParentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const allowedUpdates = [
      'fatherContact',
      'motherContact',
      'guardianContact',
      'whatsappNumber',
      'address',
    ];
    const updates: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const parent = await Parent.findOneAndUpdate(
      { $or: [{ userId: req.user?.id }, { primaryEmail: req.user?.email }] },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found' });
      return;
    }

    res.json(parent);
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating parent profile', error });
  }
};

// ==========================================
// 4. CHILD-SPECIFIC VERIFIED DATA ENDPOINTS
// ==========================================

// Get a single child profile (verified Parent ↔ Child access)
export const getChildById = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    res.json({ success: true, child: authCheck.student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving child details', error });
  }
};

// Get child attendance (verified Parent ↔ Child access)
export const getChildAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const records = await StudentAttendance.find({ studentId: childId })
      .sort({ date: -1 })
      .limit(60);

    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;

    res.json({
      success: true,
      stats: {
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        percentage,
      },
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving child attendance', error });
  }
};

// Get child daily diary (verified Parent ↔ Child access)
export const getChildDiary = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const student = authCheck.student;
    const orConditions: any[] = [{ studentId: student._id }];
    if (student.classId) {
      orConditions.push({ classId: student.classId._id || student.classId });
    }

    const diaryEntries = await DailyDiary.find({ $or: orConditions })
      .sort({ date: -1 })
      .limit(30);

    res.json({ success: true, diary: diaryEntries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving daily diary', error });
  }
};

// Get child homework (verified Parent ↔ Child access)
export const getChildHomework = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const student = authCheck.student;
    if (!student.classId) {
      res.json({ success: true, homework: [] });
      return;
    }

    const classId = student.classId._id || student.classId;
    const homeworkItems = await Homework.find({ classId })
      .sort({ dueDate: -1 })
      .limit(30);

    // Map each homework item to reflect this child's specific submission state
    const mapped = homeworkItems.map((h: any) => {
      const sub = h.submissions?.find(
        (s: any) => String(s.studentId) === String(student._id)
      );
      return {
        _id: h._id,
        subject: h.subject,
        title: h.title,
        description: h.description,
        instructions: h.instructions,
        dueDate: h.dueDate,
        attachmentUrl: h.attachmentUrl,
        teacherName: h.teacherName,
        status: sub?.status || 'Pending',
        submittedAt: sub?.submittedAt,
        completedAt: sub?.completedAt,
      };
    });

    res.json({ success: true, homework: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving homework', error });
  }
};

// Get child classroom activities (verified Parent ↔ Child access)
export const getChildActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const student = authCheck.student;
    const classId = student.classId?._id || student.classId;
    const query: Record<string, any> = {};
    if (classId) query.classId = classId;

    const activities = await ClassroomActivity.find(query)
      .sort({ date: -1 })
      .limit(20);

    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving activities', error });
  }
};

// Get child assessments (verified Parent ↔ Child access)
export const getChildAssessments = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const assessments = await Assessment.find({
      $or: [{ childId }, { studentId: childId }],
    }).sort({ date: -1 });

    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving assessments', error });
  }
};

// Get child timetable (verified Parent ↔ Child access)
export const getChildTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const student = authCheck.student;
    const classId = student.classId?._id || student.classId;
    if (!classId) {
      res.json({ success: true, timetable: [] });
      return;
    }

    const timetable = await TimeTable.find({ classId }).populate('periods.subjectId', 'name');
    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving timetable', error });
  }
};

// Get child fees (verified Parent ↔ Child access)
export const getChildFees = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const fees = await Fee.find({ studentId: childId }).sort({ dueDate: -1 });
    const totalAmount = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
    const amountPaid = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
    const outstanding = Math.max(0, totalAmount - amountPaid);

    res.json({
      success: true,
      fees,
      summary: {
        totalAmount,
        amountPaid,
        outstanding,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving child fees', error });
  }
};

// Get child exam/assessment results (verified Parent ↔ Child access)
export const getChildResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const assessments = await Assessment.find({
      $or: [{ childId }, { studentId: childId }],
    }).sort({ date: -1 });

    res.json({
      success: true,
      results: assessments,
      assessments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving results', error });
  }
};

// Get child notifications (verified Parent ↔ Child access)
export const getChildNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const userId = req.user?.id;
    const notifications = await Notification.find({
      $or: [
        ...(userId ? [{ recipient: userId }] : []),
        { studentId: childId },
        { targetRole: 'Parent' },
        { targetRole: 'all' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving notifications', error });
  }
};

// Download Child Report Card PDF (verified Parent ↔ Child access)
export const downloadChildReportCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.childId;
    const childId = Array.isArray(rawId) ? rawId[0] : rawId;

    const authCheck = await verifyParentCanAccessStudent(req.user, childId);
    if (!authCheck.allowed) {
      res.status(authCheck.status).json({ success: false, message: authCheck.message });
      return;
    }

    const student = authCheck.student;
    const assessments = await Assessment.find({
      $or: [{ childId: student._id }, { studentId: student._id }],
    }).sort({ date: 1 });

    generateReportCardPDF(res, student, assessments);
  } catch (error: any) {
    console.error('Child Report Card PDF Error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Error generating child report card PDF',
    });
  }
};
