import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import FileRecord, { IFileRecord } from '../models/FileRecord';
import AuditLog from '../models/AuditLog';
import { getFilePath } from '../middleware/fileUpload';
import { broadcastEvent } from '../socket';

// Helper to calculate SHA-256 checksum of a file
function getFileChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

// @desc    Upload single or multiple files
// @route   POST /api/v1/files/upload
export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const rawFiles = req.files as Express.Multer.File[] | undefined;
    const singleFile = req.file as Express.Multer.File | undefined;
    const filesToProcess: Express.Multer.File[] = [];

    if (rawFiles && Array.isArray(rawFiles) && rawFiles.length > 0) {
      filesToProcess.push(...rawFiles);
    } else if (singleFile) {
      filesToProcess.push(singleFile);
    }

    if (filesToProcess.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILES_PROVIDED',
        message: 'No file was received for upload. Please select a valid document or image.',
      });
    }

    const {
      category = 'general',
      entityType,
      entityId,
      visibility = 'private',
      description,
    } = req.body;

    const createdRecords: IFileRecord[] = [];

    for (const f of filesToProcess) {
      const ext = path.extname(f.originalname).toLowerCase();
      const storedName = f.filename;
      const fullPath = f.path;
      const checksum = await getFileChecksum(fullPath).catch(() => undefined);

      const fileRecord = await FileRecord.create({
        schoolId: req.user?.schoolId,
        campusId: req.user?.campusId,
        uploadedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : new mongoose.Types.ObjectId(),
        originalName: f.originalname,
        storedName,
        mimeType: f.mimetype,
        extension: ext,
        size: f.size,
        storageKey: `${category}/${storedName}`,
        url: `/api/v1/files/download`, // placeholder replaced below with real _id
        category,
        entityType: entityType || undefined,
        entityId: entityId && mongoose.isValidObjectId(entityId) ? new mongoose.Types.ObjectId(entityId) : undefined,
        visibility: ['public', 'private', 'restricted'].includes(visibility) ? visibility : 'private',
        status: 'active',
        version: 1,
        checksum,
        metadata: {
          description,
          clientMime: f.mimetype,
          encoding: f.encoding,
        },
      });

      // Update self url with permanent API route
      fileRecord.url = `/api/v1/files/${fileRecord._id}/download`;
      await fileRecord.save();

      createdRecords.push(fileRecord);

      // Audit Log
      await AuditLog.create({
        userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
        userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
        userRole: req.user?.role,
        action: 'FILE_UPLOADED',
        module: 'Files',
        targetId: String(fileRecord._id),
        ipAddress: req.ip,
        details: `Uploaded file '${f.originalname}' (${(f.size / 1024).toFixed(1)} KB) into '${category}'.`,
      }).catch(() => null);

      // Realtime notification
      broadcastEvent('file:upload:completed', {
        fileId: fileRecord._id,
        name: fileRecord.originalName,
        category: fileRecord.category,
        size: fileRecord.size,
        url: fileRecord.url,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${createdRecords.length} file(s).`,
      data: createdRecords.length === 1 ? createdRecords[0] : createdRecords,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_UPLOAD_ERROR',
      message: 'Failed to process and store uploaded file.',
      error: error.message,
    });
  }
};

// @desc    Download file by ID (Binary streaming attachment)
// @route   GET /api/v1/files/:fileId/download
export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_FILE_ID',
        message: 'Invalid file identifier format.',
      });
    }

    const file = await FileRecord.findById(fileId);
    if (!file || file.status === 'deleted') {
      return res.status(404).json({
        success: false,
        code: 'FILE_NOT_FOUND',
        message: 'The requested document does not exist or has been removed.',
      });
    }

    // Role-based visibility check
    if (file.visibility === 'restricted') {
      const userRole = req.user?.role;
      if (!['SuperAdmin', 'Admin', 'Principal'].includes(userRole || '')) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN_ACCESS',
          message: 'Access denied: You do not possess clearance to download this classified document.',
        });
      }
    }

    const diskPath = getFilePath(file.category, file.storedName);

    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({
        success: false,
        code: 'STORAGE_FILE_MISSING',
        message: 'Physical file is unavailable on the server storage.',
      });
    }

    // Clean filename for Content-Disposition header - RFC 5987 safe
    const cleanFilename = file.originalName.replace(/["\\]/g, '_');
    const encodedFilename = encodeURIComponent(file.originalName);

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', file.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Audit log
    AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_DOWNLOADED',
      module: 'Files',
      targetId: String(file._id),
      ipAddress: req.ip,
      details: `Downloaded '${file.originalName}' (${file.size} bytes).`,
    }).catch(() => null);

    const stream = fs.createReadStream(diskPath);
    stream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Stream reading error' });
      }
    });

    stream.pipe(res);
  } catch (error: any) {
    console.error('Download error:', error);
    return res.status(500).json({
      success: false,
      code: 'DOWNLOAD_FAILED',
      message: 'Failed to initiate file download.',
      error: error.message,
    });
  }
};

// @desc    Preview file inline (for PDF, images, etc.)
// @route   GET /api/v1/files/:fileId/preview
export const previewFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    const file = await FileRecord.findById(fileId);
    if (!file || file.status === 'deleted') {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const diskPath = getFilePath(file.category, file.storedName);
    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({ success: false, message: 'Physical storage file missing' });
    }

    const cleanFilename = file.originalName.replace(/["\\]/g, '_');
    const encodedFilename = encodeURIComponent(file.originalName);

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', file.size);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${cleanFilename}"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Audit log
    AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_PREVIEWED',
      module: 'Files',
      targetId: String(file._id),
      ipAddress: req.ip,
      details: `Previewed '${file.originalName}'.`,
    }).catch(() => null);

    fs.createReadStream(diskPath).pipe(res);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Preview failed', error: error.message });
  }
};

// @desc    List all files with search, filtering and pagination
// @route   GET /api/v1/files
export const listFiles = async (req: Request, res: Response) => {
  try {
    const {
      category,
      entityType,
      entityId,
      search,
      status = 'active',
      page = 1,
      limit = 20,
    } = req.query;

    const query: Record<string, any> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all' && category !== 'All Folders') {
      query.category = String(category).toLowerCase();
    }

    if (entityType) {
      query.entityType = String(entityType);
    }

    if (entityId && mongoose.isValidObjectId(String(entityId))) {
      query.entityId = new mongoose.Types.ObjectId(String(entityId));
    }

    if (search) {
      query.originalName = { $regex: String(search).trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [files, total] = await Promise.all([
      FileRecord.find(query)
        .populate('uploadedBy', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      FileRecord.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: files,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to list files', error: error.message });
  }
};

// @desc    Get single file metadata
// @route   GET /api/v1/files/:fileId
export const getFileMetadata = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    const file = await FileRecord.findById(fileId).populate('uploadedBy', 'firstName lastName email');
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    return res.json({ success: true, data: file });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to get file metadata', error: error.message });
  }
};

// @desc    Replace existing file with a newer version
// @route   PUT /api/v1/files/:fileId/replace
export const replaceFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const newFile = req.file;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    if (!newFile) {
      return res.status(400).json({ success: false, message: 'New replacement file is required' });
    }

    const file = await FileRecord.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Original file not found' });
    }

    // Push current version to versionHistory
    if (!file.versionHistory) file.versionHistory = [];
    file.versionHistory.push({
      storedName: file.storedName,
      storageKey: file.storageKey,
      size: file.size,
      mimeType: file.mimeType,
      uploadedBy: file.uploadedBy,
      createdAt: file.updatedAt,
      changeNote: req.body.changeNote || 'Replaced with newer revision',
    });

    // Update with new file attributes
    const ext = path.extname(newFile.originalname).toLowerCase();
    file.originalName = newFile.originalname;
    file.storedName = newFile.filename;
    file.mimeType = newFile.mimetype;
    file.extension = ext;
    file.size = newFile.size;
    file.storageKey = `${file.category}/${newFile.filename}`;
    file.version += 1;
    file.verificationStatus = 'Pending'; // Re-verify on replace
    await file.save();

    // Audit Log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_REPLACED',
      module: 'Files',
      targetId: String(file._id),
      ipAddress: req.ip,
      details: `Replaced file '${file.originalName}' (now v${file.version}).`,
    }).catch(() => null);

    broadcastEvent('file:replaced', {
      fileId: file._id,
      name: file.originalName,
      version: file.version,
    });

    return res.json({
      success: true,
      message: `File replaced successfully. Advanced to version ${file.version}.`,
      data: file,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to replace file', error: error.message });
  }
};

// @desc    Delete file
// @route   DELETE /api/v1/files/:fileId
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    const file = await FileRecord.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Role check: Only Uploader or Admins can delete
    const isOwner = file.uploadedBy?.toString() === req.user?.id?.toString();
    const isAdmin = ['SuperAdmin', 'Admin', 'Principal'].includes(req.user?.role || '');
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file' });
    }

    const diskPath = getFilePath(file.category, file.storedName);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    file.status = 'deleted';
    await file.save();

    // Audit Log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_DELETED',
      module: 'Files',
      targetId: String(file._id),
      ipAddress: req.ip,
      details: `Deleted file '${file.originalName}'.`,
    }).catch(() => null);

    broadcastEvent('file:deleted', { fileId });

    return res.json({ success: true, message: `File '${file.originalName}' deleted successfully.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete file', error: error.message });
  }
};

// @desc    Verify or reject a file / document
// @route   PUT /api/v1/files/:fileId/verify
export const verifyFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { verificationStatus, rejectionReason } = req.body;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    const validStatuses = ['Pending', 'Verified', 'Rejected', 'Replacement Required'];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const file = await FileRecord.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    file.verificationStatus = verificationStatus;
    file.verifiedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
    file.verifiedAt = new Date();
    if (rejectionReason) file.rejectionReason = rejectionReason;
    await file.save();

    const action = verificationStatus === 'Verified' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED';
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action,
      module: 'Documents',
      targetId: String(file._id),
      ipAddress: req.ip,
      details: `Set status of document '${file.originalName}' to ${verificationStatus}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
    }).catch(() => null);

    broadcastEvent(verificationStatus === 'Verified' ? 'document:verified' : 'document:rejected', {
      fileId: file._id,
      status: verificationStatus,
      rejectionReason,
    });

    return res.json({
      success: true,
      message: `Document status updated to ${verificationStatus}.`,
      data: file,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
};
