import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Define base upload path: <project_root>/backend/uploads
const UPLOADS_BASE_DIR = path.resolve(process.cwd(), 'uploads');

// Validated categories
export const ALLOWED_CATEGORIES = [
  'students',
  'parents',
  'teachers',
  'employees',
  'admissions',
  'fees',
  'finance',
  'exams',
  'reports',
  'certificates',
  'id-cards',
  'communication',
  'chat',
  'events',
  'gallery',
  'settings',
  'general',
] as const;

export type FileCategory = (typeof ALLOWED_CATEGORIES)[number];

// Ensure required upload directories exist synchronously on boot
export function initializeUploadDirectories(): void {
  if (!fs.existsSync(UPLOADS_BASE_DIR)) {
    fs.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
  }

  for (const cat of ALLOWED_CATEGORIES) {
    const catDir = path.join(UPLOADS_BASE_DIR, cat);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }
  }
}

// Ensure directories are initialized
initializeUploadDirectories();

// Allowed MIME types mapped to accepted file extensions
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'application/rtf': ['.rtf'],
  'text/rtf': ['.rtf'],

  // Spreadsheets
  'application/vnd.ms-excel': ['.xls', '.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  'application/csv': ['.csv'],
  'text/x-csv': ['.csv'],

  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],

  // Presentations
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],

  // Archives
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
};

// Dangerous executable extensions strictly forbidden
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.js', '.msi', '.vbs', '.php',
  '.phtml', '.bin', '.com', '.scr', '.ps1', '.py', '.jar', '.apk',
]);

// Multer Disk Storage Engine
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    try {
      const requestedCategory = (req.body?.category || req.params?.category || 'general').toLowerCase();
      const safeCategory = ALLOWED_CATEGORIES.includes(requestedCategory as any)
        ? requestedCategory
        : 'general';

      const targetDir = path.join(UPLOADS_BASE_DIR, safeCategory);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      cb(null, targetDir);
    } catch (err: any) {
      cb(err, UPLOADS_BASE_DIR);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Sanitize original filename - strip path traversal characters
    const safeBaseName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(safeBaseName).toLowerCase();
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const storedName = `${timestamp}_${uniqueId}${ext}`;

    cb(null, storedName);
  },
});

// File filter validating both extension and MIME type
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Block dangerous executables
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Security Alert: File type ${ext} is strictly prohibited.`));
  }

  // 2. Validate MIME type against allowed list
  const allowedExtensions = ALLOWED_MIME_TYPES[file.mimetype.toLowerCase()];
  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    return cb(
      new Error(
        `Unsupported media type: '${file.mimetype}' with extension '${ext}'. Supported formats include PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, PPTX, JPG, PNG, WEBP, SVG, and ZIP.`
      )
    );
  }

  cb(null, true);
};

// 25 MB max file size limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 Megabytes
    files: 10,
  },
});

// Helper to resolve full disk path from category and storedName
export function getFilePath(category: string, storedName: string): string {
  // Prevent directory traversal
  const safeCategory = path.basename(category);
  const safeStoredName = path.basename(storedName);
  return path.join(UPLOADS_BASE_DIR, safeCategory, safeStoredName);
}

// Multer error handling wrapper middleware
export function handleUploadErrors(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds maximum permitted limit of 25MB.',
      });
    }
    return res.status(400).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: err.message,
    });
  } else if (err) {
    return res.status(415).json({
      success: false,
      code: 'UNSUPPORTED_MEDIA_TYPE',
      message: err.message,
    });
  }
  next();
}
