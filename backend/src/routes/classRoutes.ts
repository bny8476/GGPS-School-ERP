import express from 'express';
import { getClasses, createClass, getSections, createSection, exportClassRoster } from '../controllers/classController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Specific routes before param routes
router.get('/roster/export', authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher'), exportClassRoster);

router.route('/')
  .get(authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher'), getClasses)
  .post(authorize('SuperAdmin', 'Admin', 'Principal'), createClass);

router.route('/:classId/sections')
  .get(authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher'), getSections)
  .post(authorize('SuperAdmin', 'Admin', 'Principal'), createSection);

router.get('/:classId/roster', authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher'), exportClassRoster);

export default router;

