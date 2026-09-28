import { Request, Response } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import Employee from '../models/Employee';
import TeacherProfile from '../models/TeacherProfile';
import bcrypt from 'bcryptjs';

// Helper to sync Employee & TeacherProfile from User
const syncEmployeeAndTeacher = async (userDoc: any, payload: any) => {
  try {
    const isStaffRole = userDoc.role?.name !== 'Parent';
    if (isStaffRole) {
      const employee = await Employee.findOneAndUpdate(
        { userId: userDoc._id },
        {
          userId: userDoc._id,
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
        { upsert: true, new: true }
      );

      if (payload.teachingAssignments || userDoc.teachingAssignments?.length > 0) {
        await TeacherProfile.findOneAndUpdate(
          { userId: userDoc._id },
          {
            userId: userDoc._id,
            employeeId: employee._id,
            teachingAssignments: payload.teachingAssignments || userDoc.teachingAssignments || [],
          },
          { upsert: true, new: true }
        );
      }
    }
  } catch (err) {
    console.warn('Non-blocking Employee/TeacherProfile sync warning:', err);
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

// @desc    Create a staff member
// @route   POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, roleName, salary, designation, joinDate, qualification, experienceYears, performanceNotes, teachingAssignments, assignedClass } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find or create role
    let role = await Role.findOne({ name: roleName || 'Teacher' });
    if (!role) {
      role = await Role.create({ name: roleName || 'Teacher', permissions: [] });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: role._id,
      salary,
      designation,
      qualification,
      experienceYears,
      performanceNotes,
      teachingAssignments,
      assignedClass,
      joinDate: joinDate ? new Date(joinDate) : undefined,
    });

    // Relational Sync: Employee & TeacherProfile
    await syncEmployeeAndTeacher(user, req.body);

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data', error });
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

    const { firstName, lastName, email, phoneNumber, roleName, isActive, salary, designation, joinDate, qualification, experienceYears, performanceNotes, teachingAssignments, assignedClass } = req.body;
    
    // Everyone can update basic profile info
    const updates: Record<string, unknown> = { firstName, lastName, email };
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (designation !== undefined) updates.designation = designation;
    if (qualification !== undefined) updates.qualification = qualification;
    if (experienceYears !== undefined) updates.experienceYears = experienceYears;
    if (performanceNotes !== undefined) updates.performanceNotes = performanceNotes;
    
    // Only Admin/SuperAdmin can change roles and active status
    if (isAdmin) {
      if (isActive !== undefined) updates.isActive = isActive;
      if (roleName) {
        let role = await Role.findOne({ name: roleName });
        if (!role) role = await Role.create({ name: roleName, permissions: [] });
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

    // Relational Sync: Employee & TeacherProfile
    await syncEmployeeAndTeacher(user, req.body);
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error });
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

