import express from 'express';
import {
  getParents,
  createParent,
  getParentById,
  updateParent,
  getMyParentProfile,
  getMyChildren,
  updateMyParentProfile,
  getChildById,
  getChildAttendance,
  getChildDiary,
  getChildHomework,
  getChildActivities,
  getChildAssessments,
  getChildResults,
  getChildTimetable,
  getChildFees,
  getChildNotifications,
  downloadChildReportCard,
  getParentChildren,
  linkChildToParent,
  unlinkChildFromParent,
  updateChildRelationship,
} from '../controllers/parentController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// 1. Current Logged-in Parent Self-Management & Linked Children
router.route('/me')
  .get(getMyParentProfile)
  .put(updateMyParentProfile);

router.route('/me/children')
  .get(getMyChildren);

// 2. Child-Specific Data Endpoints (Strictly Authorized & Relationship-Verified)
router.route('/me/children/:childId')
  .get(getChildById);

router.route('/me/children/:childId/attendance')
  .get(getChildAttendance);

router.route('/me/children/:childId/diary')
  .get(getChildDiary);

router.route('/me/children/:childId/homework')
  .get(getChildHomework);

router.route('/me/children/:childId/activities')
  .get(getChildActivities);

router.route('/me/children/:childId/assessments')
  .get(getChildAssessments);

router.route('/me/children/:childId/results')
  .get(getChildResults);

router.route('/me/children/:childId/timetable')
  .get(getChildTimetable);

router.route('/me/children/:childId/fees')
  .get(getChildFees);

router.route('/me/children/:childId/notifications')
  .get(getChildNotifications);

router.route('/me/children/:childId/report-card')
  .get(downloadChildReportCard);

// 3. Admin Child Linking & Unlinking Endpoints
router.route('/:id/children')
  .get(authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher'), getParentChildren)
  .post(authorize('SuperAdmin', 'Admin', 'Principal'), linkChildToParent);

router.route('/:id/children/:childId')
  .delete(authorize('SuperAdmin', 'Admin', 'Principal'), unlinkChildFromParent)
  .put(authorize('SuperAdmin', 'Admin', 'Principal'), updateChildRelationship);

// 4. Admin Parent Profiles CRUD
router.route('/')
  .get(authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher'), getParents)
  .post(authorize('SuperAdmin', 'Admin', 'Principal'), createParent);

router.route('/:id')
  .get(authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher'), getParentById)
  .put(authorize('SuperAdmin', 'Admin', 'Principal'), updateParent);

export default router;
