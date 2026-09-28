import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import { getSystemSettings, updateSystemSettings, getSchoolBranding } from '../controllers/settingsController';

const router = Router();

router.get('/school', getSchoolBranding);
router.get('/', protect, getSystemSettings);
router.put('/', protect, adminOnly, updateSystemSettings);

export default router;
