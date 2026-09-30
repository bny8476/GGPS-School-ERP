import express from 'express';
import {
  getStudentDocuments,
  uploadStudentDocument,
  verifyStudentDocument,
  deleteStudentDocument,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  verifyEmployeeDocument,
  deleteEmployeeDocument,
} from '../controllers/documentController';
import { protect, authorize } from '../middleware/auth';
import { upload, handleUploadErrors } from '../middleware/fileUpload';

const router = express.Router();

router.use(protect);

const staffAuth = authorize('SuperAdmin', 'Admin', 'Principal', 'Teacher', 'Receptionist', 'Accountant');
const verifyAuth = authorize('SuperAdmin', 'Admin', 'Principal');

// Student Documents
router.route('/')
  .get(getStudentDocuments);

router.post(
  '/upload',
  staffAuth,
  upload.single('file'),
  handleUploadErrors,
  uploadStudentDocument
);

router.route('/:id/verify')
  .put(verifyAuth, verifyStudentDocument);

router.route('/:id')
  .delete(verifyAuth, deleteStudentDocument);

// Employee Documents
router.get('/employees', staffAuth, getEmployeeDocuments);
router.post(
  '/employees/upload',
  staffAuth,
  upload.single('file'),
  handleUploadErrors,
  uploadEmployeeDocument
);
router.put('/employees/:id/verify', verifyAuth, verifyEmployeeDocument);
router.delete('/employees/:id', verifyAuth, deleteEmployeeDocument);

export default router;
