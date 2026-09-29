import express from 'express';
import {
  getIncidents,
  createIncident,
  updateIncidentStatus,
  deleteIncident,
} from '../controllers/disciplineController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

const staffAuth = authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher');

router.route('/')
  .get(getIncidents)
  .post(staffAuth, createIncident);

router.route('/:id/status')
  .patch(staffAuth, updateIncidentStatus);

router.route('/:id')
  .delete(staffAuth, deleteIncident);

export default router;
