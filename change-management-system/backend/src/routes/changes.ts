import express from 'express';
import {
  getChanges,
  getChange,
  createChange,
  updateChange,
  deleteChange,
  approveChange,
  rejectChange,
  cabApproveChange,
  updateBenefitScore,
} from '../controllers/changeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getChanges).post(protect, createChange);

router.route('/:id').get(protect, getChange).put(protect, updateChange).delete(protect, deleteChange);

router.post('/:id/approve', protect, authorize('cab_member', 'manager', 'admin'), approveChange);
router.post('/:id/reject', protect, authorize('cab_member', 'manager', 'admin'), rejectChange);
router.post('/:id/cab-approve', protect, authorize('cab_member', 'manager', 'admin'), cabApproveChange);

router.put('/:id/benefit-score', protect, updateBenefitScore);
export default router;
