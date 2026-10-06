import { Request, Response } from 'express';
import HealthLog from '../models/HealthLog';
import Student from '../models/Student';
import Parent from '../models/Parent';
import { getIO } from '../socket';
import { sendWhatsAppMessage } from '../utils/twilioService';

// Helper to find a parent's WhatsApp number
const getParentWhatsAppNumber = async (studentId: string): Promise<string | null> => {
  try {
    const student = await Student.findById(studentId).populate('parentId');
    if (!student || !student.parentId) return null;
    
    interface ParentDoc {
      whatsappNumber?: string;
      fatherContact?: string;
      motherContact?: string;
    }
    const parent = student.parentId as unknown as ParentDoc;
    // Prefer whatsappNumber, fallback to fatherContact, then motherContact
    let num = parent.whatsappNumber || parent.fatherContact || parent.motherContact;
    if (!num) return null;

    // Very basic normalization for Twilio (assumes US/India etc format. E.g., add + if missing, etc.)
    // For a real app, use a phone number parsing library like libphonenumber-js
    if (!num.startsWith('+')) {
      // Defaulting to India country code for this example ERP if no '+' provided
      num = `+91${num}`;
    }
    return num;
  } catch (error) {
    console.error('Error fetching parent number:', error);
    return null;
  }
};

// @desc    Get all health logs
// @route   GET /api/operations/health
export const getHealthLogs = async (req: Request, res: Response) => {
  try {
    const logs = await HealthLog.find()
      .sort({ date: -1 })
      .populate('studentId', 'firstName lastName')
      .populate('loggedBy', 'firstName lastName');
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Create a health log
// @route   POST /api/operations/health
export const createHealthLog = async (req: Request, res: Response) => {
  try {
    const loggedBy = req.user?.id;
    if (!loggedBy) return res.status(401).json({ message: 'User not authenticated' });
    const log = await HealthLog.create({ ...req.body, loggedBy });
    
    const isEmergency = log.temperature >= 99 || log.allergiesAlert;

    // Emit socket notification if feverish or allergy alert
    if (isEmergency) {
      const io = getIO();
      io.emit('notification', {
        title: 'Health Alert ⚠️',
        message: `Health update for student ${log.studentId}: ${log.temperature >= 99 ? 'Fever detected.' : 'Allergy alert.'}`,
        type: 'health',
        timestamp: new Date()
      });
    }

    // Send WhatsApp Notification if emergency
    if (isEmergency) {
      const parentNumber = await getParentWhatsAppNumber(log.studentId.toString());
      if (parentNumber) {
        const student = await Student.findById(log.studentId);
        const alertType = log.temperature >= 99 ? `Fever (${log.temperature}°F)` : 'Allergy Alert';
        const msg = `⚠️ *URGENT - GGPS School Health Alert*\n${student?.firstName} has a reported health issue: ${alertType}.\nPlease contact the school reception immediately.`;
        await sendWhatsAppMessage(parentNumber, msg);
      }
    }

    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error });
  }
};

export const updateHealthLog = async (req: Request, res: Response) => {
  try {
    const { date, temperature, symptoms, medicationAdministered, allergiesAlert, notes } = req.body;
    const allowedUpdates: Record<string, any> = {};
    if (date !== undefined) allowedUpdates.date = date;
    if (temperature !== undefined) allowedUpdates.temperature = temperature;
    if (symptoms !== undefined) allowedUpdates.symptoms = symptoms;
    if (medicationAdministered !== undefined) allowedUpdates.medicationAdministered = medicationAdministered;
    if (allergiesAlert !== undefined) allowedUpdates.allergiesAlert = allergiesAlert;
    if (notes !== undefined) allowedUpdates.notes = notes;

    const log = await HealthLog.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error });
  }
};

export const deleteHealthLog = async (req: Request, res: Response) => {
  try {
    const log = await HealthLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
