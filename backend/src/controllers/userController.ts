import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Role from '../models/Role';
import Employee from '../models/Employee';
import TeacherProfile from '../models/TeacherProfile';
import Parent from '../models/Parent';
import Student from '../models/Student';
import StudentParent from '../models/StudentParent';
import {
  normalizeEmail,
  hashPassword,
  validatePasswordPolicy,
} from '../services/passwordService';
import { ROLE_PERMISSIONS } from '../config/permissions';

// Helper to sync Employee & TeacherProfile or Parent from User
const syncEmployeeAndTeacher = async (userDoc: any, payload: any) => {
  try {
    const roleName = userDoc.role?.name || payload.roleName || '';
    const isParentRole = roleName === 'Parent';

    if (isParentRole) {
      // Sync or create Parent profile record
      await Parent.findOneAndUpdate(
        {
          $or: [
            { userId: userDoc._id },
            { primaryEmail: userDoc.email },
          ],
        },
        {
          userId: userDoc._id,
          fatherName: `${userDoc.firstName} ${userDoc.lastName}`.trim(),
          motherName: payload.motherName || 'Mother',
          primaryEmail: userDoc.email,
          address: payload.address || 'Registered Address',
          fatherContact: userDoc.phoneNumber || payload.phoneNumber || '',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return;
    }

    // Otherwise, it is a staff role (Teacher, Admin, Principal, etc.)
    const employeeCode = payload.employeeCode || `EMP-${userDoc._id.toString().slice(-6).toUpperCase()}`;
    const employee = await Employee.findOneAndUpdate(
      { userId: userDoc._id },
      {
        userId: userDoc._id,
        employeeCode,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        designation: payload.designation || userDoc.designation || 'Staff Member',
        qualification: payload.qualification || userDoc.qualification,
        experienceYears: payload.experienceYears ?? userDoc.experienceYears ?? 0,
        salary: payload.salary ?? userDoc.salary ?? 0,
        joiningDate: payload.joinDate ? new Date(payload.joinDate) : (userDoc.joinDate || new Date()),
        performanceNotes: payload.performanceNotes || userDoc.performanceNotes,
        employmentStatus: userDoc.isActive === false ? 'Terminated' : 'Active',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (
      roleName === 'Teacher' ||
      payload.teachingAssignments ||
      (userDoc.teachingAssignments && userDoc.teachingAssignments.length > 0)
    ) {
      await TeacherProfile.findOneAndUpdate(
        { userId: userDoc._id },
        {
          userId: userDoc._id,
          employeeId: employee._id,
          teachingAssignments: payload.teachingAssignments || userDoc.teachingAssignments || [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  } catch (err) {
    console.warn('Non-blocking Employee/TeacherProfile/Parent sync warning:', err);
  }
};

// @desc    Get all staff/users
// @route   GET /api/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const isFullAccess = ['Admin', 'SuperAdmin', 'Principal'].includes(userRole || '');

    const users = await User.find().select('-passwordHash').populate('role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Create a staff member or parent user
// @route   POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      roleName,
      phoneNumber,
      salary,
      designation,
      joinDate,
      qualification,
      experienceYears,
      performanceNotes,
      teachingAssignments,
      assignedClass,
      schoolId,
      campusId,
      status,
      isActive,
    } = req.body;

    const trimmedFirst = firstName ? String(firstName).trim() : '';
    const trimmedLast = lastName ? String(lastName).trim() : '';

    if (!trimmedFirst || !trimmedLast || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, institutional email, and password are all required.',
      });
    }

    const passwordValidation = validatePasswordPolicy(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error || 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: `An account with email ${normalizedEmail} already exists.`,
      });
    }

    // Canonicalize role name
    const rawRole = (roleName || 'Teacher').trim();
    const canonicalRoleName =
      rawRole.toLowerCase() === 'superadmin' ? 'SuperAdmin' :
      rawRole.toLowerCase() === 'admin' ? 'Admin' :
      rawRole.toLowerCase() === 'principal' ? 'Principal' :
      rawRole.toLowerCase() === 'teacher' ? 'Teacher' :
      rawRole.toLowerCase() === 'parent' ? 'Parent' :
      rawRole.toLowerCase() === 'accountant' ? 'Accountant' :
      rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

    // Find or create role with canonical permissions
    let role = await Role.findOne({ name: canonicalRoleName });
    const defaultPermissions = ROLE_PERMISSIONS[canonicalRoleName] || [];
    if (!role) {
      role = await Role.create({
        name: canonicalRoleName,
        permissions: defaultPermissions,
      });
    } else if (!role.permissions || role.permissions.length === 0) {
      role.permissions = defaultPermissions;
      await role.save();
    }

    const passwordHash = await hashPassword(password);

    // Resolve tenant relationships
    const resolvedSchoolId = schoolId || req.user?.schoolId;
    const resolvedCampusId = campusId || req.user?.campusId;

    // Pre-validate linked children if role is Parent
    const linkedChildrenInput = Array.isArray(req.body.linkedChildren)
      ? req.body.linkedChildren
      : Array.isArray(req.body.children)
      ? req.body.children
      : [];

    const validatedChildren: any[] = [];
    if (canonicalRoleName === 'Parent' && linkedChildrenInput.length > 0) {
      const seenStudentIds = new Set<string>();
      for (const item of linkedChildrenInput) {
        const studentId =
          typeof item === 'object' && item !== null
            ? item.studentId || item._id || item.id
            : String(item);

        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
          return res.status(400).json({
            success: false,
            message: `Invalid student ID for linking: ${studentId}`,
          });
        }

        if (seenStudentIds.has(String(studentId))) {
          return res.status(400).json({
            success: false,
            message: 'Duplicate child specified in link list. Each child can only be linked once.',
          });
        }
        seenStudentIds.add(String(studentId));

        const student = await Student.findById(studentId);
        if (!student) {
          return res.status(400).json({
            success: false,
            message: `Student with ID ${studentId} does not exist in the database.`,
          });
        }

        if (resolvedSchoolId && student.schoolId && String(student.schoolId) !== String(resolvedSchoolId)) {
          return res.status(400).json({
            success: false,
            message: `Student ${student.firstName} ${student.lastName} belongs to a different school and cannot be linked.`,
          });
        }

        const canonicalRel =
          ['Father', 'Mother', 'Guardian', 'Other'].find(
            (r) => r.toLowerCase() === String(item.relationship || item.relationshipType || 'Guardian').toLowerCase()
          ) || 'Guardian';

        validatedChildren.push({
          student,
          relationship: canonicalRel,
          isPrimary: Boolean(item.isPrimary),
          emergencyContact: Boolean(item.emergencyContact ?? item.isEmergencyContact ?? true),
          canPickup: Boolean(item.canPickup ?? true),
          receivesNotifications: Boolean(item.receivesNotifications ?? true),
        });
      }
    }

    const user = await User.create({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: normalizedEmail,
      passwordHash,
      role: role._id,
      phoneNumber: phoneNumber ? String(phoneNumber).trim() : undefined,
      isActive: isActive !== false,
      status: status || (isActive === false ? 'Inactive' : 'Active'),
      isDeleted: false,
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      salary,
      designation: designation ? String(designation).trim() : undefined,
      qualification: qualification ? String(qualification).trim() : undefined,
      experienceYears: experienceYears ?? 0,
      performanceNotes,
      teachingAssignments,
      assignedClass: assignedClass ? String(assignedClass).trim() : undefined,
      joinDate: joinDate ? new Date(joinDate) : new Date(),
    });

    // Relational Sync: Employee & TeacherProfile or Parent
    await syncEmployeeAndTeacher(user, { ...req.body, roleName: canonicalRoleName });

    // Link validated children to Parent record
    const linkedChildrenResults: any[] = [];
    if (canonicalRoleName === 'Parent' && validatedChildren.length > 0) {
      try {
        const parentDoc = await Parent.findOne({
          $or: [{ userId: user._id }, { primaryEmail: user.email }],
        });

        if (parentDoc && validatedChildren.length > 0) {
          for (let i = 0; i < validatedChildren.length; i++) {
            const vc = validatedChildren[i];
            const isPrimary = vc.isPrimary || i === 0;

            const link = await StudentParent.findOneAndUpdate(
              { parentId: parentDoc._id, studentId: vc.student._id },
              {
                parentId: parentDoc._id,
                studentId: vc.student._id,
                relationship: vc.relationship,
                relationshipType: vc.relationship,
                isPrimary,
                emergencyContact: vc.emergencyContact,
                isEmergencyContact: vc.emergencyContact,
                canPickup: vc.canPickup,
                receivesNotifications: vc.receivesNotifications,
                status: 'active',
                schoolId: resolvedSchoolId || vc.student.schoolId,
                campusId: resolvedCampusId || vc.student.campusId,
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            if (isPrimary || !vc.student.parentId) {
              await Student.findByIdAndUpdate(vc.student._id, { parentId: parentDoc._id });
            }

            linkedChildrenResults.push({
              _id: link._id,
              studentId: vc.student._id,
              studentName: `${vc.student.firstName} ${vc.student.lastName}`,
              admissionNumber: vc.student.admissionNumber,
              grade: vc.student.grade,
              relationship: link.relationship,
              isPrimary: link.isPrimary,
            });
          }
        }
      } catch (linkError) {
        // Rollback created user & parent on partial linking failure
        await User.findByIdAndDelete(user._id);
        await Parent.findOneAndDelete({ userId: user._id });
        throw linkError;
      }
    }

    res.status(201).json({
      success: true,
      message: `${canonicalRoleName} account created successfully.`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: { _id: role._id, name: canonicalRoleName },
        designation: user.designation,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        status: user.status,
        createdAt: user.createdAt,
      },
      linkedChildren: linkedChildrenResults,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: { _id: role._id, name: canonicalRoleName },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error?.message || 'Invalid user data',
      error,
    });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const isSelf = req.user?.id === req.params.id;
    const isAdmin = req.user?.role === 'Admin' || req.user?.role === 'SuperAdmin';
    
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'User not authorized to update this profile' });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      roleName,
      isActive,
      status,
      salary,
      designation,
      joinDate,
      qualification,
      experienceYears,
      performanceNotes,
      teachingAssignments,
      assignedClass,
    } = req.body;
    
    // Everyone can update basic profile info
    const updates: Record<string, unknown> = {};
    if (firstName !== undefined) updates.firstName = String(firstName).trim();
    if (lastName !== undefined) updates.lastName = String(lastName).trim();
    if (email !== undefined) updates.email = normalizeEmail(email);
    if (password) {
      const passwordValidation = validatePasswordPolicy(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ success: false, message: passwordValidation.error });
      }
      updates.passwordHash = await hashPassword(password);
    }
    if (phoneNumber !== undefined) updates.phoneNumber = String(phoneNumber).trim();
    if (designation !== undefined) updates.designation = designation;
    if (qualification !== undefined) updates.qualification = qualification;
    if (experienceYears !== undefined) updates.experienceYears = experienceYears;
    if (performanceNotes !== undefined) updates.performanceNotes = performanceNotes;
    
    // Only Admin/SuperAdmin can change roles and active status
    if (isAdmin) {
      if (isActive !== undefined) updates.isActive = isActive;
      if (status !== undefined) updates.status = status;
      if (roleName) {
        const canonicalRoleName =
          roleName.toLowerCase() === 'superadmin' ? 'SuperAdmin' :
          roleName.toLowerCase() === 'admin' ? 'Admin' :
          roleName.toLowerCase() === 'principal' ? 'Principal' :
          roleName.toLowerCase() === 'teacher' ? 'Teacher' :
          roleName.toLowerCase() === 'parent' ? 'Parent' :
          roleName.toLowerCase() === 'accountant' ? 'Accountant' :
          roleName.charAt(0).toUpperCase() + roleName.slice(1);

        let role = await Role.findOne({ name: canonicalRoleName });
        if (!role) {
          role = await Role.create({
            name: canonicalRoleName,
            permissions: ROLE_PERMISSIONS[canonicalRoleName] || [],
          });
        }
        updates.role = role._id;
      }
      if (salary !== undefined) updates.salary = salary;
      if (joinDate !== undefined) updates.joinDate = new Date(joinDate);
      if (assignedClass !== undefined) updates.assignedClass = assignedClass;
      if (teachingAssignments !== undefined) updates.teachingAssignments = teachingAssignments;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('role', 'name')
      .populate('teachingAssignments.classId', 'name')
      .populate('teachingAssignments.subjectId', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Relational Sync: Employee & TeacherProfile or Parent
    await syncEmployeeAndTeacher(user, req.body);
    
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Invalid data', error });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get current user's preferences (e.g. preferredLanguage)
// @route   GET /api/v1/users/me/preferences
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(userId).select('preferredLanguage firstName lastName email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      preferredLanguage: user.preferredLanguage || 'en',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving preferences', error });
  }
};

// @desc    Update current user's preferences (e.g. preferredLanguage)
// @route   PATCH /api/v1/users/me/preferences
export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { preferredLanguage } = req.body;
    const supported = ['en', 'ta', 'hi', 'ml', 'te', 'kn', 'bn', 'mr', 'ar', 'es', 'fr', 'de'];
    if (!preferredLanguage || !supported.includes(preferredLanguage)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language. Must be one of: ${supported.join(', ')}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferredLanguage },
      { new: true, runValidators: true }
    ).select('preferredLanguage firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferredLanguage: user?.preferredLanguage || 'en',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating preferences', error });
  }
};

