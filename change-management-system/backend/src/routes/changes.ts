import express from 'express';
import {
  getChanges,
  getChange,
  createChange,
  updateChange,
  deleteChange,
  approveChange,
  rejectChange,
} from '../controllers/changeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getChanges).post(protect, createChange);

router.route('/:id').get(protect, getChange).put(protect, updateChange).delete(protect, deleteChange);

router.post('/:id/approve', protect, authorize('CAB_Member', 'Dept_Head', 'Admin'), approveChange);
router.post('/:id/reject', protect, authorize('CAB_Member', 'Dept_Head', 'Admin'), rejectChange);

export default router;
