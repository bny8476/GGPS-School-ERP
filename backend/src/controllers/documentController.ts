import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import StudentDocument from '../models/StudentDocument';
import EmployeeDocument from '../models/EmployeeDocument';
import FileRecord from '../models/FileRecord';
import AuditLog from '../models/AuditLog';
import { broadcastEvent } from '../socket';

// @desc    Get Student Documents
// @route   GET /api/v1/documents
export const getStudentDocuments = async (req: Request, res: Response) => {
  try {
    const { studentId, category, verificationStatus } = req.query;
    const filter: Record<string, any> = {};

    if (studentId && mongoose.isValidObjectId(String(studentId))) {
      filter.studentId = new mongoose.Types.ObjectId(String(studentId));
    }

    if (category && category !== 'all') {
      filter.category = String(category);
    }

    if (verificationStatus && verificationStatus !== 'all') {
      filter.verificationStatus = String(verificationStatus);
    }

    const docs = await StudentDocument.find(filter)
      .populate('studentId', 'firstName lastName admissionNumber grade section rollNumber')
      .populate('fileRecordId')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: docs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error fetching student documents', error: error.message });
  }
};

// @desc    Upload Student Document (Multipart file + metadata)
// @route   POST /api/v1/documents/upload
export const uploadStudentDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { studentId, title, category, expiryDate } = req.body;

    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ success: false, message: 'Valid studentId is required.' });
    }

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Document title and category are required.' });
    }

    let fileRecordId: mongoose.Types.ObjectId | undefined;
    let documentUrl = req.body.documentUrl;
    let fileName = file?.originalname || 'Uploaded Document';
    let fileSize = file?.size || 0;
    let mimeType = file?.mimetype || 'application/pdf';

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileRecord = await FileRecord.create({
        schoolId: req.user?.schoolId,
        campusId: req.user?.campusId,
        uploadedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : new mongoose.Types.ObjectId(),
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        extension: ext,
        size: file.size,
        storageKey: `students/${file.filename}`,
        url: `/api/v1/files/download`,
        category: 'students',
        entityType: 'Student',
        entityId: new mongoose.Types.ObjectId(studentId),
        visibility: 'private',
        status: 'active',
        version: 1,
        verificationStatus: 'Pending',
      });

      fileRecord.url = `/api/v1/files/${fileRecord._id}/download`;
      await fileRecord.save();

      fileRecordId = fileRecord._id as mongoose.Types.ObjectId;
      documentUrl = fileRecord.url;
      fileName = file.originalname;
      fileSize = file.size;
      mimeType = file.mimetype;
    }

    if (!documentUrl) {
      return res.status(400).json({ success: false, message: 'Please attach a document file.' });
    }

    const doc = await StudentDocument.create({
      studentId: new mongoose.Types.ObjectId(studentId),
      fileRecordId,
      title: title.trim(),
      category,
      fileName,
      fileSize,
      mimeType,
      documentUrl,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      verificationStatus: 'Pending',
      uploadedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
    });

    await doc.populate('fileRecordId');

    // Audit log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_UPLOADED',
      module: 'StudentDocuments',
      targetId: String(doc._id),
      ipAddress: req.ip,
      details: `Uploaded student document '${title}' (${category}) for student ${studentId}.`,
    }).catch(() => null);

    broadcastEvent('file:upload:completed', {
      documentId: doc._id,
      studentId,
      title: doc.title,
      category: doc.category,
    });

    res.status(201).json({
      success: true,
      message: 'Student document uploaded successfully and pending verification.',
      data: doc,
    });
  } catch (error: any) {
    console.error('Error creating student document:', error);
    res.status(500).json({ success: false, message: 'Failed to upload student document', error: error.message });
  }
};

// @desc    Verify or Reject Student Document
// @route   PUT /api/v1/documents/:id/verify
export const verifyStudentDocument = async (req: Request, res: Response) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;
    const verifiedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;

    const validStatuses = ['Pending', 'Verified', 'Rejected', 'Replacement Required', 'Expired'];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const doc = await StudentDocument.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus,
        rejectionReason: rejectionReason || undefined,
        verifiedBy,
        verifiedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'firstName lastName admissionNumber');

    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Also update attached FileRecord if exists
    if (doc.fileRecordId) {
      await FileRecord.findByIdAndUpdate(doc.fileRecordId, {
        verificationStatus: verificationStatus === 'Expired' ? 'Rejected' : verificationStatus,
        verifiedBy,
        verifiedAt: new Date(),
        rejectionReason,
      }).catch(() => null);
    }

    // Audit log
    const action = verificationStatus === 'Verified' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED';
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action,
      module: 'StudentDocuments',
      targetId: String(doc._id),
      ipAddress: req.ip,
      details: `Student document '${doc.title}' marked as '${verificationStatus}'. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
    }).catch(() => null);

    broadcastEvent(verificationStatus === 'Verified' ? 'document:verified' : 'document:rejected', {
      documentId: doc._id,
      studentId: doc.studentId,
      status: verificationStatus,
      rejectionReason,
    });

    res.json({
      success: true,
      message: `Document successfully marked as '${verificationStatus}'.`,
      data: doc,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Invalid verification update', error: error.message });
  }
};

// @desc    Delete Student Document
// @route   DELETE /api/v1/documents/:id
export const deleteStudentDocument = async (req: Request, res: Response) => {
  try {
    const doc = await StudentDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (doc.fileRecordId) {
      await FileRecord.findByIdAndUpdate(doc.fileRecordId, { status: 'deleted' }).catch(() => null);
    }

    await StudentDocument.findByIdAndDelete(req.params.id);

    // Audit Log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_DELETED',
      module: 'StudentDocuments',
      targetId: String(doc._id),
      ipAddress: req.ip,
      details: `Deleted student document '${doc.title}'.`,
    }).catch(() => null);

    res.json({ success: true, message: 'Document removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error deleting document', error: error.message });
  }
};

// @desc    Get Employee / Teacher Documents
// @route   GET /api/v1/documents/employees
export const getEmployeeDocuments = async (req: Request, res: Response) => {
  try {
    const { userId, employeeId, category, verificationStatus } = req.query;
    const filter: Record<string, any> = {};

    if (userId && mongoose.isValidObjectId(String(userId))) {
      filter.userId = new mongoose.Types.ObjectId(String(userId));
    }
    if (employeeId && mongoose.isValidObjectId(String(employeeId))) {
      filter.employeeId = new mongoose.Types.ObjectId(String(employeeId));
    }
    if (category && category !== 'all') {
      filter.category = String(category);
    }
    if (verificationStatus && verificationStatus !== 'all') {
      filter.verificationStatus = String(verificationStatus);
    }

    const docs = await EmployeeDocument.find(filter)
      .populate('userId', 'firstName lastName email role employeeCode')
      .populate('employeeId', 'designation department')
      .populate('fileRecordId')
      .populate('verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching employee documents', error: error.message });
  }
};

// @desc    Upload Employee Document
// @route   POST /api/v1/documents/employees/upload
export const uploadEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { userId, employeeId, title, category } = req.body;

    const targetUserId = userId || req.user?.id;
    if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required.' });
    }

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required.' });
    }

    let fileRecordId: mongoose.Types.ObjectId | undefined;
    let documentUrl = req.body.documentUrl;
    let fileName = file?.originalname || 'Uploaded Document';
    let fileSize = file?.size || 0;
    let mimeType = file?.mimetype || 'application/pdf';

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileRecord = await FileRecord.create({
        schoolId: req.user?.schoolId,
        campusId: req.user?.campusId,
        uploadedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : new mongoose.Types.ObjectId(),
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        extension: ext,
        size: file.size,
        storageKey: `employees/${file.filename}`,
        url: `/api/v1/files/download`,
        category: 'employees',
        entityType: 'Employee',
        entityId: new mongoose.Types.ObjectId(targetUserId),
        visibility: 'private',
        status: 'active',
        version: 1,
        verificationStatus: 'Pending',
      });

      fileRecord.url = `/api/v1/files/${fileRecord._id}/download`;
      await fileRecord.save();

      fileRecordId = fileRecord._id as mongoose.Types.ObjectId;
      documentUrl = fileRecord.url;
      fileName = file.originalname;
      fileSize = file.size;
      mimeType = file.mimetype;
    }

    if (!documentUrl) {
      return res.status(400).json({ success: false, message: 'Document file is required.' });
    }

    const doc = await EmployeeDocument.create({
      userId: new mongoose.Types.ObjectId(targetUserId),
      employeeId: employeeId && mongoose.isValidObjectId(employeeId) ? new mongoose.Types.ObjectId(employeeId) : undefined,
      fileRecordId,
      title: title.trim(),
      category,
      fileName,
      fileSize,
      mimeType,
      documentUrl,
      verificationStatus: 'Pending',
      uploadedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
    });

    await doc.populate('fileRecordId');

    // Audit log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_UPLOADED',
      module: 'EmployeeDocuments',
      targetId: String(doc._id),
      ipAddress: req.ip,
      details: `Uploaded employee document '${title}' (${category}) for user ${targetUserId}.`,
    }).catch(() => null);

    res.status(201).json({
      success: true,
      message: 'Employee document uploaded successfully.',
      data: doc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error uploading employee document', error: error.message });
  }
};

// @desc    Verify or Reject Employee Document
// @route   PUT /api/v1/documents/employees/:id/verify
export const verifyEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;
    const verifiedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;

    const validStatuses = ['Pending', 'Verified', 'Rejected', 'Replacement Required', 'Expired'];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const doc = await EmployeeDocument.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus,
        rejectionReason: rejectionReason || undefined,
        verifiedBy,
        verifiedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (doc.fileRecordId) {
      await FileRecord.findByIdAndUpdate(doc.fileRecordId, {
        verificationStatus: verificationStatus === 'Expired' ? 'Rejected' : verificationStatus,
        verifiedBy,
        verifiedAt: new Date(),
        rejectionReason,
      }).catch(() => null);
    }

    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: verificationStatus === 'Verified' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      module: 'EmployeeDocuments',
      targetId: String(doc._id),
      ipAddress: req.ip,
      details: `Updated employee document '${doc.title}' verification status to ${verificationStatus}.`,
    }).catch(() => null);

    res.json({
      success: true,
      message: `Document status updated to ${verificationStatus}`,
      data: doc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify employee document', error: error.message });
  }
};

// @desc    Delete Employee Document
// @route   DELETE /api/v1/documents/employees/:id
export const deleteEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const doc = await EmployeeDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (doc.fileRecordId) {
      const fileRecord = await FileRecord.findById(doc.fileRecordId);
      if (fileRecord && fileRecord.storedName) {
        const filePath = path.join(process.cwd(), 'uploads', 'employees', fileRecord.storedName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        await fileRecord.deleteOne();
      }
    }

    await doc.deleteOne();

    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'DOCUMENT_DELETED',
      module: 'EmployeeDocuments',
      targetId: req.params.id,
      ipAddress: req.ip,
      details: `Deleted employee document '${doc.title}'.`,
    }).catch(() => null);

    res.json({
      success: true,
      message: 'Employee document permanently deleted.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete employee document', error: error.message });
  }
};
