import express from 'express';
import {
  getIdCards,
  getIdCardById,
  createIdCard,
  updateIdCard,
  regenerateIdCard,
  revokeIdCard,
  verifyStudentCard,
  downloadIdCardPDF,
  bulkGenerateIdCards,
  getBulkJobStatus,
  bulkDownloadZip,
} from '../controllers/idCardController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// 1. Public verification endpoint (Accessed via QR scan - NO auth required)
router.get('/verify/:token', verifyStudentCard);

// 2. Protected ID card endpoints
router.get(
  '/',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal', 'Teacher', 'Parent'),
  getIdCards
);

router.get(
  '/:id',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal', 'Teacher', 'Parent'),
  getIdCardById
);

router.post(
  '/',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal'),
  createIdCard
);

router.patch(
  '/:id',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal'),
  updateIdCard
);

router.post(
  '/:id/regenerate',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal'),
  regenerateIdCard
);

router.post(
  '/:id/revoke',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal'),
  revokeIdCard
);

router.get(
  '/:id/pdf',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal', 'Teacher', 'Parent'),
  downloadIdCardPDF
);

router.post(
  '/bulk',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal'),
  bulkGenerateIdCards
);

router.get(
  '/jobs/:jobId',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal'),
  getBulkJobStatus
);

router.post(
  '/bulk/download-zip',
  protect,
  authorize('Admin', 'SuperAdmin', 'Principal'),
  bulkDownloadZip
);

export default router;
