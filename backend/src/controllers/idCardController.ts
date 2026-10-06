import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import PDFDocument from 'pdfkit';
import IdCard, { IIdCard } from '../models/IdCard';
import Student from '../models/Student';
import Parent from '../models/Parent';
import StudentParent from '../models/StudentParent';
import SystemSettings from '../models/Settings';
import AuditLog from '../models/AuditLog';
import { generateNextCardNumber } from '../services/sequenceService';
import { emitToRole, emitToUser, broadcastEvent } from '../socket';
import { escapeRegex } from '../utils/sanitizers';

// In-memory tracker for real-time bulk generation progress
const activeBulkJobs = new Map<
  string,
  {
    jobId: string;
    total: number;
    processed: number;
    failed: number;
    status: 'in_progress' | 'completed' | 'failed';
    cardIds: string[];
    createdAt: Date;
  }
>();

// Helper to resolve linked students for Parent
async function getLinkedStudentIdsForParent(parentUserId: string): Promise<mongoose.Types.ObjectId[]> {
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

// Helper to get school branding
async function getLatestBranding() {
  const settings = await SystemSettings.findOne();
  return {
    schoolName: settings?.schoolName || 'GGPS School',
    tagline: settings?.schoolTagline || 'Learn • Grow • Succeed',
    logoUrl: settings?.logoUrl || '/logo.png',
    address: settings?.schoolAddress || '123 Education Lane, Knowledge Park, Tamil Nadu, India',
    phone: settings?.schoolPhone || '+91 98765 43210',
    email: settings?.schoolEmail || 'admissions@ggps.edu',
    website: settings?.website || 'https://ggps-school.edu',
    primaryColor: settings?.primaryColor || '#0050CB',
    secondaryColor: settings?.secondaryColor || '#FF690C',
    principalSignatureUrl: settings?.principalSignatureUrl || '/signature-principal.png',
  };
}

// @desc    List all ID cards with filters & stats
// @route   GET /api/v1/id-cards
export const getIdCards = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      status,
      academicYear,
      templateId,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const query: Record<string, any> = {};

    // Role-based isolation for Parents
    if (req.user?.role === 'Parent') {
      const allowedStudentIds = await getLinkedStudentIdsForParent(req.user.id);
      if (allowedStudentIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0,
          stats: { total: 0, active: 0, revoked: 0, expired: 0 },
        });
      }
      query.studentId = { $in: allowedStudentIds };
      query.status = { $in: ['active', 'generated'] };
    }

    if (studentId && mongoose.isValidObjectId(studentId)) {
      query.studentId = new mongoose.Types.ObjectId(studentId as string);
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    if (templateId && templateId !== 'all') {
      query.templateId = templateId;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    // Search by card number or student name if provided
    if (search) {
      const searchRegex = new RegExp(escapeRegex(String(search).trim()), 'i');
      const matchingStudents = await Student.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { admissionNumber: searchRegex },
          { studentId: searchRegex },
        ],
      }).select('_id');

      const matchingStudentIds = matchingStudents.map((s) => s._id);

      query.$or = [
        { cardNumber: searchRegex },
        { barcodeValue: searchRegex },
        { studentId: { $in: matchingStudentIds } },
      ];
    }

    const [cards, total, statsAggregation] = await Promise.all([
      IdCard.find(query)
        .populate({
          path: 'studentId',
          select:
            'firstName lastName admissionNumber rollNumber grade photoUrl dateOfBirth gender bloodGroup parentId emergencyContact address studentId',
          populate: {
            path: 'parentId',
            select: 'fatherName motherName primaryEmail fatherContact motherContact address',
          },
        })
        .populate('generatedBy', 'firstName lastName email')
        .populate('revokedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      IdCard.countDocuments(query),
      IdCard.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = {
      total: 0,
      active: 0,
      revoked: 0,
      expired: 0,
      generated: 0,
    };

    statsAggregation.forEach((item) => {
      stats.total += item.count;
      if (item._id in stats) {
        (stats as any)[item._id] = item.count;
      }
    });

    return res.json({
      success: true,
      data: cards,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      stats,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve ID cards', error: error.message });
  }
};

// @desc    Get single ID card
// @route   GET /api/v1/id-cards/:id
export const getIdCardById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID card format' });
    }

    const card = await IdCard.findById(id)
      .populate({
        path: 'studentId',
        select:
          'firstName lastName admissionNumber rollNumber grade photoUrl dateOfBirth gender bloodGroup parentId emergencyContact address studentId',
        populate: {
          path: 'parentId',
          select: 'fatherName motherName primaryEmail fatherContact motherContact address',
        },
      })
      .populate('generatedBy', 'firstName lastName email')
      .populate('revokedBy', 'firstName lastName email');

    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    // Role check for Parents
    if (req.user?.role === 'Parent') {
      const allowedStudentIds = await getLinkedStudentIdsForParent(req.user.id);
      const isAllowed = allowedStudentIds.some((sId) => sId.toString() === card.studentId._id.toString());
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: 'Access denied to this student ID card' });
      }
    }

    return res.json({ success: true, data: card });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving ID card', error: error.message });
  }
};

// @desc    Create / Generate Single ID Card
// @route   POST /api/v1/id-cards
export const createIdCard = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      templateId = 'modern-blue',
      validFrom: rawValidFrom,
      validTill: rawValidTill,
      fields = {},
      photoUrl,
      academicYear = '2026-2027',
    } = req.body;

    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ success: false, message: 'A valid studentId is required' });
    }

    const student = await Student.findById(studentId).populate('parentId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found in system' });
    }

    const validFrom = rawValidFrom ? new Date(rawValidFrom) : new Date();
    const validTill = rawValidTill
      ? new Date(rawValidTill)
      : new Date(validFrom.getFullYear() + 1, 4, 31); // Default till May 31 next year

    if (validTill <= validFrom) {
      return res.status(400).json({ success: false, message: 'Card validity expiration must be after start date' });
    }

    // Deactivate / archive any previous active cards for this student to ensure single active card
    await IdCard.updateMany(
      { studentId: student._id, status: 'active' },
      { $set: { status: 'expired' } }
    );

    const cardNumber = await generateNextCardNumber(academicYear);
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const barcodeValue = student.studentId || student.admissionNumber || cardNumber;
    const schoolBranding = await getLatestBranding();

    const resolvedPhoto = photoUrl || student.photoUrl || '';

    const newIdCard = await IdCard.create({
      schoolId: student.schoolId,
      campusId: student.campusId,
      studentId: student._id,
      academicYear,
      cardNumber,
      templateId,
      validFrom,
      validTill,
      status: 'active',
      photoUrl: resolvedPhoto,
      fields: {
        showBloodGroup: fields.showBloodGroup !== false,
        showParentName: fields.showParentName !== false,
        showParentPhone: fields.showParentPhone !== false,
        showAddress: fields.showAddress !== false,
        showEmergencyContact: fields.showEmergencyContact !== false,
        showQRCode: fields.showQRCode !== false,
        showBarcode: fields.showBarcode !== false,
        house: fields.house || '',
        notes: fields.notes || '',
      },
      verificationToken,
      barcodeValue,
      version: 1,
      schoolBranding,
      generatedAt: new Date(),
      generatedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
    });

    // Populate for response
    await newIdCard.populate([
      {
        path: 'studentId',
        select:
          'firstName lastName admissionNumber rollNumber grade photoUrl dateOfBirth gender bloodGroup parentId emergencyContact address studentId',
        populate: {
          path: 'parentId',
          select: 'fatherName motherName primaryEmail fatherContact motherContact address',
        },
      },
      { path: 'generatedBy', select: 'firstName lastName email' },
    ]);

    // Audit Logging
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      action: 'IDCARD_GENERATED',
      entityType: 'IdCard',
      entityId: newIdCard._id,
      description: `Generated ID card ${cardNumber} for student ${student.firstName} ${student.lastName} (${student.admissionNumber})`,
      metadata: { cardNumber, studentId: student._id, templateId, validTill },
    }).catch(() => null);

    // Socket.IO real-time notification
    emitToRole('Admin', 'idcard:generated', newIdCard);
    emitToRole('Teacher', 'idcard:generated', newIdCard);
    if (student.parentId) {
      const parentUser = await Parent.findById(student.parentId).select('userId');
      if (parentUser?.userId) {
        emitToUser(parentUser.userId.toString(), 'idcard:generated', newIdCard);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Student ID card generated successfully',
      data: newIdCard,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate ID card', error: error.message });
  }
};

// @desc    Update ID Card configuration
// @route   PATCH /api/v1/id-cards/:id
export const updateIdCard = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID card format' });
    }

    const { templateId, validFrom, validTill, fields, photoUrl, status } = req.body;

    const card = await IdCard.findById(id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    if (templateId) card.templateId = templateId;
    if (validFrom) card.validFrom = new Date(validFrom);
    if (validTill) card.validTill = new Date(validTill);
    if (photoUrl !== undefined) card.photoUrl = photoUrl;
    if (status) card.status = status;
    if (fields) {
      card.fields = {
        ...card.fields,
        ...fields,
      };
    }

    await card.save();

    await card.populate([
      {
        path: 'studentId',
        select:
          'firstName lastName admissionNumber rollNumber grade photoUrl dateOfBirth gender bloodGroup parentId emergencyContact address studentId',
        populate: {
          path: 'parentId',
          select: 'fatherName motherName primaryEmail fatherContact motherContact address',
        },
      },
      { path: 'generatedBy', select: 'firstName lastName email' },
    ]);

    // Audit Log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      action: 'IDCARD_UPDATED',
      entityType: 'IdCard',
      entityId: card._id,
      description: `Updated ID card configuration for ${card.cardNumber}`,
      metadata: { cardId: card._id, cardNumber: card.cardNumber },
    }).catch(() => null);

    return res.json({ success: true, message: 'ID card updated successfully', data: card });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update ID card', error: error.message });
  }
};

// @desc    Regenerate ID Card (archives old card and creates new version)
// @route   POST /api/v1/id-cards/:id/regenerate
export const regenerateIdCard = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID card format' });
    }

    const oldCard = await IdCard.findById(id);
    if (!oldCard) {
      return res.status(404).json({ success: false, message: 'Existing ID card not found' });
    }

    const student = await Student.findById(oldCard.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record no longer exists' });
    }

    // Archive previous card
    oldCard.status = 'revoked';
    oldCard.revocationReason = 'Reissued with new ID card generation';
    oldCard.revokedAt = new Date();
    oldCard.revokedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
    await oldCard.save();

    const academicYear = req.body.academicYear || oldCard.academicYear || '2026-2027';
    const newCardNumber = await generateNextCardNumber(academicYear);
    const newVerificationToken = crypto.randomBytes(16).toString('hex');
    const schoolBranding = await getLatestBranding();

    const newCard = await IdCard.create({
      schoolId: oldCard.schoolId,
      campusId: oldCard.campusId,
      studentId: student._id,
      academicYear,
      cardNumber: newCardNumber,
      templateId: req.body.templateId || oldCard.templateId,
      validFrom: req.body.validFrom ? new Date(req.body.validFrom) : new Date(),
      validTill: req.body.validTill ? new Date(req.body.validTill) : oldCard.validTill,
      status: 'active',
      photoUrl: req.body.photoUrl || oldCard.photoUrl || student.photoUrl,
      fields: req.body.fields || oldCard.fields,
      verificationToken: newVerificationToken,
      barcodeValue: student.studentId || student.admissionNumber || newCardNumber,
      version: (oldCard.version || 1) + 1,
      schoolBranding,
      generatedAt: new Date(),
      generatedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
    });

    await newCard.populate([
      {
        path: 'studentId',
        select:
          'firstName lastName admissionNumber rollNumber grade photoUrl dateOfBirth gender bloodGroup parentId emergencyContact address studentId',
        populate: {
          path: 'parentId',
          select: 'fatherName motherName primaryEmail fatherContact motherContact address',
        },
      },
      { path: 'generatedBy', select: 'firstName lastName email' },
    ]);

    // Audit Log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      action: 'IDCARD_REGENERATED',
      entityType: 'IdCard',
      entityId: newCard._id,
      description: `Regenerated ID card ${newCardNumber} (version ${newCard.version}), archived old card ${oldCard.cardNumber}`,
      metadata: { newCardNumber, oldCardNumber: oldCard.cardNumber, studentId: student._id },
    }).catch(() => null);

    // Socket.IO event
    emitToRole('Admin', 'idcard:regenerated', { oldCard, newCard });
    emitToRole('Teacher', 'idcard:regenerated', { oldCard, newCard });

    return res.status(201).json({
      success: true,
      message: 'ID card regenerated successfully',
      data: newCard,
      archivedCard: oldCard,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to regenerate ID card', error: error.message });
  }
};

// @desc    Revoke ID Card
// @route   POST /api/v1/id-cards/:id/revoke
export const revokeIdCard = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { reason = 'Revoked by school administrator' } = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID card format' });
    }

    const card = await IdCard.findById(id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    card.status = 'revoked';
    card.revocationReason = reason;
    card.revokedAt = new Date();
    card.revokedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
    await card.save();

    await card.populate([
      {
        path: 'studentId',
        select: 'firstName lastName admissionNumber rollNumber grade',
      },
      { path: 'revokedBy', select: 'firstName lastName email' },
    ]);

    // Audit Log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      action: 'IDCARD_REVOKED',
      entityType: 'IdCard',
      entityId: card._id,
      description: `Revoked ID card ${card.cardNumber}. Reason: ${reason}`,
      metadata: { cardNumber: card.cardNumber, reason, studentId: card.studentId },
    }).catch(() => null);

    // Socket.IO event
    broadcastEvent('idcard:revoked', {
      cardId: card._id,
      cardNumber: card.cardNumber,
      reason,
      revokedAt: card.revokedAt,
    });

    return res.json({
      success: true,
      message: `ID Card ${card.cardNumber} has been revoked successfully`,
      data: card,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to revoke ID card', error: error.message });
  }
};

// @desc    Public verification of student ID card via QR token
// @route   GET /api/v1/id-cards/verify/:token
export const verifyStudentCard = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, status: 'INVALID_TOKEN', message: 'Verification token required' });
    }

    const card = await IdCard.findOne({ verificationToken: token }).populate({
      path: 'studentId',
      select: 'firstName lastName admissionNumber rollNumber grade photoUrl studentId',
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        status: 'NOT_FOUND',
        message: 'No official GGPS ID card found matching this verification code.',
      });
    }

    const student: any = card.studentId || {};
    const now = new Date();
    let calculatedStatus = card.status;

    if (card.status === 'revoked') {
      calculatedStatus = 'revoked';
    } else if (now > new Date(card.validTill)) {
      calculatedStatus = 'expired';
    } else {
      calculatedStatus = 'active';
    }

    // Only return safe public data - strictly exclude parent credentials, internal IDs, and private details
    return res.json({
      success: true,
      isValid: calculatedStatus === 'active',
      status: calculatedStatus.toUpperCase(),
      data: {
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
        studentId: student.studentId || card.barcodeValue,
        admissionNumber: student.admissionNumber || '-',
        className: student.grade || 'Pre-KG',
        photoUrl: card.photoUrl || student.photoUrl || '',
        cardNumber: card.cardNumber,
        validFrom: card.validFrom,
        validTill: card.validTill,
        schoolName: card.schoolBranding?.schoolName || 'GGPS School',
        schoolTagline: card.schoolBranding?.tagline || 'Learn • Grow • Succeed',
        schoolAddress: card.schoolBranding?.address || '123 Education Lane, Knowledge Park, Tamil Nadu, India',
        issuedAt: card.generatedAt,
        revocationReason: card.status === 'revoked' ? card.revocationReason : undefined,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Verification error', error: error.message });
  }
};

// @desc    Download high-res printable PDF for single card
// @route   GET /api/v1/id-cards/:id/pdf
export const downloadIdCardPDF = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const card = await IdCard.findById(id).populate({
      path: 'studentId',
      select:
        'firstName lastName admissionNumber rollNumber grade photoUrl dateOfBirth gender bloodGroup parentId emergencyContact address studentId',
      populate: {
        path: 'parentId',
        select: 'fatherName motherName primaryEmail fatherContact motherContact address',
      },
    });

    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    const student: any = card.studentId || {};
    const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
    const parent: any = student.parentId || {};
    const parentName = parent.fatherName || parent.motherName || 'Parent / Guardian';
    const contact = parent.fatherContact || parent.motherContact || student.emergencyContact || '+91 98765 43210';
    const address = student.address || parent.address || 'Knowledge Park, Tamil Nadu';

    // Generate QR code buffer
    const appOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${appOrigin}/verify/student/${card.verificationToken}`;
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 150, margin: 1 });

    // Standard CR80 layout on A4 printable sheet (595.28 x 841.89 pt)
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="GGPS-ID-Card-${student.admissionNumber || card.cardNumber}.pdf"`
    );

    doc.pipe(res);

    // Header Sheet Info
    doc.fillColor('#0050CB').fontSize(16).text('GGPS School - Official Student Identity Card', { align: 'center' });
    doc.fillColor('#64748B').fontSize(9).text(`Card No: ${card.cardNumber} • Academic Year: ${card.academicYear} • CR80 PVC Standard Dimensions`, { align: 'center' });
    doc.moveDown(1.5);

    // Positions for Side-by-Side CR80 Cards (243pt x 153pt or portrait 153pt x 243pt)
    // CR80 Portrait: 153pt wide x 243pt high
    const cardW = 180;
    const cardH = 285;
    const startY = 120;
    const frontX = 100;
    const backX = 315;

    // --- FRONT CARD CONTAINER ---
    doc.roundedRect(frontX, startY, cardW, cardH, 12).stroke('#0050CB');
    // Header Banner
    doc.rect(frontX, startY, cardW, 55).fill('#0050CB');
    doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('GGPS SCHOOL', frontX, startY + 12, { width: cardW, align: 'center' });
    doc.fillColor('#E5EEFF').fontSize(7).font('Helvetica').text('Learn • Grow • Succeed', frontX, startY + 28, { width: cardW, align: 'center' });
    doc.fillColor('#FF690C').fontSize(7.5).font('Helvetica-Bold').text('STUDENT IDENTITY CARD', frontX, startY + 39, { width: cardW, align: 'center' });

    // Photo Box Placeholder / Box
    const photoY = startY + 65;
    doc.roundedRect(frontX + 50, photoY, 80, 80, 8).stroke('#CBD5E1');
    doc.fillColor('#64748B').fontSize(8).font('Helvetica').text('Photo Box', frontX + 50, photoY + 35, { width: 80, align: 'center' });

    // Student Info
    const infoY = photoY + 90;
    doc.fillColor('#000E28').fontSize(11).font('Helvetica-Bold').text(studentName, frontX, infoY, { width: cardW, align: 'center' });
    doc.fillColor('#0050CB').fontSize(9).font('Helvetica-Bold').text(`Class: ${student.grade || 'LKG'}`, frontX, infoY + 15, { width: cardW, align: 'center' });

    // Details Grid
    doc.fillColor('#334155').fontSize(7.5).font('Helvetica');
    doc.text(`ID: ${student.studentId || card.barcodeValue}`, frontX + 15, infoY + 32);
    doc.text(`Adm No: ${student.admissionNumber || '-'}`, frontX + 15, infoY + 44);
    if (card.fields.showBloodGroup) {
      doc.text(`Blood: ${student.bloodGroup || 'B+'}`, frontX + 15, infoY + 56);
    }
    const validTillStr = new Date(card.validTill).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    doc.text(`Valid Till: ${validTillStr}`, frontX + 15, infoY + 68);

    // Front Bottom Accent
    doc.rect(frontX, startY + cardH - 6, cardW, 6).fill('#FF690C');

    // --- BACK CARD CONTAINER ---
    doc.roundedRect(backX, startY, cardW, cardH, 12).stroke('#000E28');
    doc.rect(backX, startY, cardW, 28).fill('#000E28');
    doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('EMERGENCY & CONTACT', backX, startY + 9, { width: cardW, align: 'center' });

    // Back Details
    let backY = startY + 38;
    if (card.fields.showParentName) {
      doc.fillColor('#64748B').fontSize(7).font('Helvetica-Bold').text('PARENT / GUARDIAN', backX + 15, backY);
      doc.fillColor('#000E28').fontSize(8.5).font('Helvetica').text(parentName, backX + 15, backY + 9);
      backY += 24;
    }
    if (card.fields.showParentPhone) {
      doc.fillColor('#64748B').fontSize(7).font('Helvetica-Bold').text('CONTACT PHONE', backX + 15, backY);
      doc.fillColor('#000E28').fontSize(8.5).font('Helvetica').text(contact, backX + 15, backY + 9);
      backY += 24;
    }
    if (card.fields.showAddress) {
      doc.fillColor('#64748B').fontSize(7).font('Helvetica-Bold').text('ADDRESS', backX + 15, backY);
      doc.fillColor('#000E28').fontSize(7.5).font('Helvetica').text(address, backX + 15, backY + 9, { width: cardW - 30 });
      backY += 30;
    }

    // Embed QR code on Back
    if (card.fields.showQRCode && qrBuffer) {
      doc.image(qrBuffer, backX + 55, backY, { width: 70, height: 70 });
      doc.fillColor('#64748B').fontSize(6.5).font('Helvetica').text('Scan to Verify Student ID', backX, backY + 74, { width: cardW, align: 'center' });
      backY += 88;
    }

    // Authorized Signature Line
    doc.moveTo(backX + 40, startY + cardH - 24).lineTo(backX + cardW - 40, startY + cardH - 24).stroke('#94A3B8');
    doc.fillColor('#64748B').fontSize(7).font('Helvetica').text('Principal / Authorized Signatory', backX, startY + cardH - 20, { width: cardW, align: 'center' });

    // Cut Guideline instructions
    doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text('✂ Cut along the solid outer border. Card fits standard CR80 ID Card sleeves & holders.', 0, startY + cardH + 30, { align: 'center' });

    doc.end();
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'PDF generation failed', error: error.message });
  }
};

// @desc    Bulk generate ID cards for students
// @route   POST /api/v1/id-cards/bulk
export const bulkGenerateIdCards = async (req: Request, res: Response) => {
  try {
    const {
      studentIds,
      className,
      sectionName,
      academicYear = '2026-2027',
      templateId = 'modern-blue',
      validFrom: rawValidFrom,
      validTill: rawValidTill,
      fields = {},
    } = req.body;

    let targetStudentIds: string[] = [];

    if (Array.isArray(studentIds) && studentIds.length > 0) {
      targetStudentIds = studentIds.filter((id) => mongoose.isValidObjectId(id));
    } else if (className) {
      const filter: Record<string, any> = { grade: className, status: 'Active' };
      const found = await Student.find(filter).select('_id');
      targetStudentIds = found.map((s) => s._id.toString());
    }

    if (targetStudentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No eligible students selected for bulk ID generation' });
    }

    const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
    const total = targetStudentIds.length;

    activeBulkJobs.set(jobId, {
      jobId,
      total,
      processed: 0,
      failed: 0,
      status: 'in_progress',
      cardIds: [],
      createdAt: new Date(),
    });

    // Send started event
    emitToRole('Admin', 'idcard:generation:started', { jobId, total });

    // Process asynchronously without freezing HTTP connection
    (async () => {
      const validFrom = rawValidFrom ? new Date(rawValidFrom) : new Date();
      const validTill = rawValidTill ? new Date(rawValidTill) : new Date(validFrom.getFullYear() + 1, 4, 31);
      const schoolBranding = await getLatestBranding();
      const job = activeBulkJobs.get(jobId)!;

      for (let i = 0; i < targetStudentIds.length; i++) {
        const sId = targetStudentIds[i];
        try {
          const student = await Student.findById(sId);
          if (!student) {
            job.failed++;
            continue;
          }

          // Deactivate previous active card
          await IdCard.updateMany(
            { studentId: student._id, status: 'active' },
            { $set: { status: 'expired' } }
          );

          const cardNumber = await generateNextCardNumber(academicYear);
          const verificationToken = crypto.randomBytes(16).toString('hex');
          const barcodeValue = student.studentId || student.admissionNumber || cardNumber;

          const createdCard = await IdCard.create({
            schoolId: student.schoolId,
            campusId: student.campusId,
            studentId: student._id,
            academicYear,
            cardNumber,
            templateId,
            validFrom,
            validTill,
            status: 'active',
            photoUrl: student.photoUrl || '',
            fields: {
              showBloodGroup: fields.showBloodGroup !== false,
              showParentName: fields.showParentName !== false,
              showParentPhone: fields.showParentPhone !== false,
              showAddress: fields.showAddress !== false,
              showEmergencyContact: fields.showEmergencyContact !== false,
              showQRCode: fields.showQRCode !== false,
              showBarcode: fields.showBarcode !== false,
            },
            verificationToken,
            barcodeValue,
            version: 1,
            schoolBranding,
            generatedAt: new Date(),
            generatedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
          });

          job.cardIds.push(createdCard._id.toString());
          job.processed++;

          const percentage = Math.round((job.processed / total) * 100);
          emitToRole('Admin', 'idcard:generation:progress', {
            jobId,
            processed: job.processed,
            total,
            percentage,
            currentStudent: `${student.firstName} ${student.lastName}`,
          });
        } catch (err) {
          job.failed++;
        }
      }

      job.status = 'completed';
      emitToRole('Admin', 'idcard:generation:completed', {
        jobId,
        total,
        processed: job.processed,
        failed: job.failed,
        cardIds: job.cardIds,
      });

      // Audit Log
      await AuditLog.create({
        userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
        action: 'IDCARD_BULK_GENERATED',
        entityType: 'IdCard',
        description: `Bulk generated ${job.processed} ID cards (${job.failed} failed)`,
        metadata: { jobId, processed: job.processed, total },
      }).catch(() => null);
    })();

    return res.status(202).json({
      success: true,
      message: `Bulk generation initiated for ${total} students`,
      jobId,
      total,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Bulk generation error', error: error.message });
  }
};

// @desc    Get bulk generation job status
// @route   GET /api/v1/id-cards/jobs/:jobId
export const getBulkJobStatus = async (req: Request, res: Response) => {
  const rawJobId = req.params.jobId;
  const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
  const job = jobId ? activeBulkJobs.get(jobId) : null;

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  return res.json({ success: true, data: job });
};

// @desc    Download batch of ID cards as a ZIP archive
// @route   POST /api/v1/id-cards/bulk/download-zip
export const bulkDownloadZip = async (req: Request, res: Response) => {
  try {
    const { cardIds } = req.body;

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of cardIds required' });
    }

    const cards = await IdCard.find({ _id: { $in: cardIds } }).populate({
      path: 'studentId',
      select: 'firstName lastName admissionNumber grade studentId',
    });

    if (cards.length === 0) {
      return res.status(404).json({ success: false, message: 'No cards found' });
    }

    const zip = new JSZip();

    // Generate PDF for each card and add to zip
    for (const card of cards) {
      const student: any = card.studentId || {};
      const filename = `GGPS-ID-Card-${student.admissionNumber || card.cardNumber}.pdf`;

      // Helper to generate PDF as a Buffer
      const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fillColor('#0050CB').fontSize(16).text('GGPS School - Official Student Identity Card', { align: 'center' });
        doc.fillColor('#64748B').fontSize(9).text(`Card No: ${card.cardNumber} • Class: ${student.grade || 'LKG'}`, { align: 'center' });
        doc.moveDown(1.5);

        const cardW = 180;
        const cardH = 285;
        const startY = 120;
        const frontX = 100;
        const backX = 315;

        // Front
        doc.roundedRect(frontX, startY, cardW, cardH, 12).stroke('#0050CB');
        doc.rect(frontX, startY, cardW, 55).fill('#0050CB');
        doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('GGPS SCHOOL', frontX, startY + 12, { width: cardW, align: 'center' });
        doc.fillColor('#E5EEFF').fontSize(7).font('Helvetica').text('Learn • Grow • Succeed', frontX, startY + 28, { width: cardW, align: 'center' });
        doc.fillColor('#FF690C').fontSize(7.5).font('Helvetica-Bold').text('STUDENT IDENTITY CARD', frontX, startY + 39, { width: cardW, align: 'center' });

        const sName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
        doc.fillColor('#000E28').fontSize(11).font('Helvetica-Bold').text(sName, frontX, startY + 160, { width: cardW, align: 'center' });
        doc.fillColor('#0050CB').fontSize(9).font('Helvetica-Bold').text(`Class: ${student.grade || 'LKG'}`, frontX, startY + 175, { width: cardW, align: 'center' });
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica').text(`ID: ${student.studentId || card.barcodeValue}`, frontX + 15, startY + 195);
        doc.text(`Card No: ${card.cardNumber}`, frontX + 15, startY + 208);

        // Back
        doc.roundedRect(backX, startY, cardW, cardH, 12).stroke('#000E28');
        doc.rect(backX, startY, cardW, 28).fill('#000E28');
        doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('EMERGENCY & CONTACT', backX, startY + 9, { width: cardW, align: 'center' });
        doc.fillColor('#334155').fontSize(8).font('Helvetica').text('GGPS School Campus', backX + 15, startY + 45);
        doc.text('Knowledge Park, Tamil Nadu', backX + 15, startY + 58);
        doc.text('Ph: +91 98765 43210', backX + 15, startY + 71);

        doc.end();
      });

      zip.file(filename, pdfBuffer);
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="GGPS-ID-Cards-Batch.zip"');
    return res.send(zipContent);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'ZIP generation failed', error: error.message });
  }
};
