import express from 'express';
import {
  uploadFiles,
  downloadFile,
  previewFile,
  listFiles,
  getFileMetadata,
  replaceFile,
  deleteFile,
  verifyFile,
} from '../controllers/fileController';
import { protect, authorize } from '../middleware/auth';
import { upload, handleUploadErrors } from '../middleware/fileUpload';

const router = express.Router();

// Download & Preview endpoints (Support token in auth header or cookies or query param for direct browser preview)
router.get('/:fileId/download', protect, downloadFile);
router.get('/:fileId/preview', protect, previewFile);

// All other endpoints require full JWT authentication
router.use(protect);

router.route('/')
  .get(listFiles)
  .post(
    upload.array('files', 10),
    handleUploadErrors,
    uploadFiles
  );

router.route('/:fileId')
  .get(getFileMetadata)
  .delete(deleteFile);

router.put(
  '/:fileId/replace',
  upload.single('file'),
  handleUploadErrors,
  replaceFile
);

router.put(
  '/:fileId/verify',
  authorize('SuperAdmin', 'Admin', 'Principal', 'Accountant'),
  verifyFile
);

export default router;
