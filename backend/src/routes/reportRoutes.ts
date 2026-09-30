import express from 'express';
import { 
  getFeeDefaulters, 
  getAdmissionAnalytics, 
  getAttendanceSummary,
  getAcademicReport,
  getStaffReport,
  exportReport,
} from '../controllers/reportController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

const adminStaffAuth = authorize('SuperAdmin', 'Admin', 'Principal', 'Accountant');
const generalStaffAuth = authorize('SuperAdmin', 'Admin', 'Principal', 'Accountant', 'Teacher');

router.get('/export/:reportType', generalStaffAuth, exportReport);

router.get('/fee-defaulters', adminStaffAuth, getFeeDefaulters);
router.get('/admissions', adminStaffAuth, getAdmissionAnalytics);
router.get('/attendance', generalStaffAuth, getAttendanceSummary);
router.get('/academic', generalStaffAuth, getAcademicReport);
router.get('/staff', adminStaffAuth, getStaffReport);

export default router;
