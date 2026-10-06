import express from 'express';
import { 
  getHealthLogs, createHealthLog, updateHealthLog, deleteHealthLog 
} from '../controllers/operationsController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

const staffAuth = [protect, authorize('Admin', 'Teacher', 'SuperAdmin')];

router.get('/health', staffAuth, getHealthLogs);
router.post('/health', staffAuth, createHealthLog);
router.put('/health/:id', staffAuth, updateHealthLog);
router.delete('/health/:id', staffAuth, deleteHealthLog);

export default router;
