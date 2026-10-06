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
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../validators/userValidator';

const router = express.Router();

// Current user preferences
router.route('/me/preferences')
  .get(protect, getUserPreferences)
  .patch(protect, updateUserPreferences);

router.route('/')
  .get(protect, authorize('Admin', 'SuperAdmin', 'Principal', 'Teacher'), getUsers)
  .post(protect, authorize('Admin', 'SuperAdmin'), validate(createUserSchema), createUser);

router.route('/:id')
  .put(protect, authorize('Admin', 'SuperAdmin'), validate(updateUserSchema), updateUser)
  .delete(protect, authorize('Admin', 'SuperAdmin'), deleteUser);

export default router;
