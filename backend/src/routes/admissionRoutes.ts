import express from 'express';
import {
  getAdmissions,
  createAdmission,
  updateAdmission,
  approveAdmission,
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  getEnquiryDetail,
  updateEnquiry,
  updateEnquiryStatus,
  assignEnquiry,
  addEnquiryFollowUp,
  addEnquiryNote,
  convertEnquiryToApplication,
  closeEnquiry,
} from '../controllers/admissionController';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createEnquirySchema,
  createAdmissionSchema,
  addEnquiryFollowUpSchema,
  addEnquiryNoteSchema,
} from '../validators/admissionValidator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiry submissions from this IP. Please wait a few minutes before trying again.',
  },
});

// Staff authorization for admission management
const staffAuth = [protect, authorize('Admin', 'Receptionist', 'SuperAdmin', 'Principal')];

// ==========================================
// 1. ADMISSION ENQUIRIES WORKFLOW
// ==========================================

// Public enquiry endpoints
router.post('/enquiries', enquiryLimiter, validate(createEnquirySchema), createEnquiry);
router.get('/enquiries/:enquiryId', getEnquiryById);

// Admin / Staff enquiry management endpoints
router.get('/enquiries', staffAuth, getEnquiries);
router.get('/enquiries/detail/:id', staffAuth, getEnquiryDetail);
router.patch('/enquiries/:id', staffAuth, updateEnquiry);
router.patch('/enquiries/:id/status', staffAuth, updateEnquiryStatus);
router.patch('/enquiries/:id/assignment', staffAuth, assignEnquiry);
router.post('/enquiries/:id/follow-ups', staffAuth, validate(addEnquiryFollowUpSchema), addEnquiryFollowUp);
router.post('/enquiries/:id/notes', staffAuth, validate(addEnquiryNoteSchema), addEnquiryNote);
router.post('/enquiries/:id/convert', staffAuth, convertEnquiryToApplication);
router.post('/enquiries/:id/close', staffAuth, closeEnquiry);

// ==========================================
// 2. FORMAL ADMISSIONS / APPLICATIONS
// ==========================================
router.post('/', enquiryLimiter, validate(createAdmissionSchema), createAdmission);
router.get('/', staffAuth, getAdmissions);
router.put('/:id', staffAuth, updateAdmission);
router.post('/:id/approve', staffAuth, approveAdmission);

export default router;
