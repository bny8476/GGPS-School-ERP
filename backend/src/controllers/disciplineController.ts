import { Request, Response } from 'express';
import mongoose from 'mongoose';
import DisciplineIncident from '../models/Discipline';
import Student from '../models/Student';
import User from '../models/User';
import { getIO } from '../socket';

// @desc    Get all disciplinary incidents
// @route   GET /api/v1/discipline
export const getIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, severity, status, search } = req.query;

    const query: any = {};
    if (category && category !== 'All') query.category = category;
    if (severity && severity !== 'All') query.severity = severity;
    if (status && status !== 'All') query.status = status;

    if (search && typeof search === 'string') {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { actionTaken: { $regex: search, $options: 'i' } },
      ];
    }

    const incidents = await DisciplineIncident.find(query)
      .populate('student', 'firstName lastName admissionNumber grade section')
      .populate('reportedBy', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error: any) {
    console.error('Error fetching discipline incidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve discipline incidents',
      error: error.message,
    });
  }
};

// @desc    Log a new disciplinary incident
// @route   POST /api/v1/discipline
export const createIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      student,
      studentId,
      category = 'Behavioral',
      severity = 'Medium',
      description,
      action,
      parentNotified = true,
      location,
      date,
    } = req.body;

    if (!description?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Incident description is required',
      });
      return;
    }

    let resolvedStudentId: mongoose.Types.ObjectId | undefined;
    let resolvedStudentName = typeof student === 'string' ? student.trim() : '';

    // If explicit student ObjectId provided
    if (studentId && mongoose.isValidObjectId(studentId)) {
      resolvedStudentId = new mongoose.Types.ObjectId(studentId);
      const studentDoc = await Student.findById(resolvedStudentId).lean();
      if (studentDoc) {
        resolvedStudentName = `${studentDoc.firstName} ${studentDoc.lastName} (${studentDoc.admissionNumber || studentDoc.studentId || 'ID'})`;
      }
    } else if (resolvedStudentName) {
      // Try to find matching student in database if admission number or name matches
      const match = await Student.findOne({
        $or: [
          { admissionNumber: resolvedStudentName },
          { studentId: resolvedStudentName },
        ],
      }).lean();
      if (match) {
        resolvedStudentId = match._id as mongoose.Types.ObjectId;
      }
    }

    if (!resolvedStudentName) {
      res.status(400).json({
        success: false,
        message: 'Student name or identifier is required',
      });
      return;
    }

    // Reporter info from auth user
    let reporterId: mongoose.Types.ObjectId | undefined;
    let reporterName = 'Discipline Committee';
    if (req.user?.id && mongoose.isValidObjectId(req.user.id)) {
      reporterId = new mongoose.Types.ObjectId(req.user.id);
      const reporterUser = await User.findById(reporterId).lean();
      if (reporterUser) {
        reporterName = `${reporterUser.firstName} ${reporterUser.lastName}`;
      }
    }

    const incident = await DisciplineIncident.create({
      student: resolvedStudentId,
      studentName: resolvedStudentName,
      category,
      severity,
      incidentDate: date ? new Date(date) : new Date(),
      location: location || 'School Campus',
      description: description.trim(),
      reportedBy: reporterId,
      reportedByName: reporterName,
      actionTaken: action?.trim() || 'Under review by discipline committee',
      parentNotified: Boolean(parentNotified),
      status: 'Under Investigation',
    });

    // Populate for response & socket broadcast
    const populated = await DisciplineIncident.findById(incident._id)
      .populate('student', 'firstName lastName admissionNumber grade section')
      .populate('reportedBy', 'firstName lastName role')
      .lean();

    // Broadcast realtime event via Socket.IO
    try {
      const io = getIO();
      if (io) {
        io.emit('discipline:incident:created', populated || incident);
        io.emit('notification', {
          title: 'Behavioral Incident Logged',
          message: `Discipline case recorded for ${resolvedStudentName} (${severity} severity)`,
          type: 'discipline',
          timestamp: new Date(),
        });
      }
    } catch (socketErr) {
      console.warn('Socket broadcast warning:', socketErr);
    }

    res.status(201).json({
      success: true,
      message: 'Disciplinary incident logged successfully',
      data: populated || incident,
    });
  } catch (error: any) {
    console.error('Error logging discipline incident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record discipline incident',
      error: error.message,
    });
  }
};

// @desc    Update incident status or action taken
// @route   PATCH /api/v1/discipline/:id/status
export const updateIncidentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid incident ID' });
      return;
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (actionTaken) updates.actionTaken = actionTaken;

    const updated = await DisciplineIncident.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'firstName lastName admissionNumber grade section')
      .populate('reportedBy', 'firstName lastName role')
      .lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Incident not found' });
      return;
    }

    // Realtime notification
    try {
      const io = getIO();
      if (io) {
        io.emit('discipline:incident:updated', updated);
      }
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: 'Incident updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update incident',
      error: error.message,
    });
  }
};

// @desc    Delete an incident
// @route   DELETE /api/v1/discipline/:id
export const deleteIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid incident ID' });
      return;
    }

    const deleted = await DisciplineIncident.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Incident not found' });
      return;
    }

    try {
      const io = getIO();
      if (io) {
        io.emit('discipline:incident:deleted', { id });
      }
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: 'Incident deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete incident',
      error: error.message,
    });
  }
};
