import express from 'express';
import {
  registerUser,
  loginUser,
  refreshAuthToken,
  logoutUser,
  getUserProfile,
  updateSelfProfile,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
} from '../validators/authValidator';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', refreshAuthToken);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateSelfProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-code', validate(verifyResetCodeSchema), verifyResetCode);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
