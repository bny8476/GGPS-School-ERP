import express from 'express';
import { getAll, create, update, remove } from '../controllers/eventController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getAll);

router.use(protect);
const staffAuth = authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher');

router.post('/', staffAuth, create);

router.route('/:id')
  .put(staffAuth, update)
  .delete(authorize('SuperAdmin', 'Admin', 'Principal'), remove);

export default router;
