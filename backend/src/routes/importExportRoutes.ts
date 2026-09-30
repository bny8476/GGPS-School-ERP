import express from 'express';
import {
  downloadTemplate,
  importEntityData,
  exportEntityData,
} from '../controllers/importExportController';
import { protect, authorize } from '../middleware/auth';
import { upload, handleUploadErrors } from '../middleware/fileUpload';

const router = express.Router();

router.use(protect);

const adminAuth = authorize('SuperAdmin', 'Admin', 'Principal', 'Accountant');

router.get('/template/:entity', adminAuth, downloadTemplate);
router.get('/export/:entity', adminAuth, exportEntityData);
router.post(
  '/import/:entity',
  adminAuth,
  upload.single('file'),
  handleUploadErrors,
  importEntityData
);

export default router;
