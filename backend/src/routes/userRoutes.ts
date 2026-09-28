import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserPreferences,
  updateUserPreferences,
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Current user preferences
router.route('/me/preferences')
  .get(protect, getUserPreferences)
  .patch(protect, updateUserPreferences);

router.route('/')
  .get(protect, authorize('Admin', 'SuperAdmin', 'Principal', 'Teacher'), getUsers)
  .post(protect, authorize('Admin', 'SuperAdmin'), createUser);

router.route('/:id')
  .put(protect, authorize('Admin', 'SuperAdmin'), updateUser)
  .delete(protect, authorize('Admin', 'SuperAdmin'), deleteUser);

export default router;
