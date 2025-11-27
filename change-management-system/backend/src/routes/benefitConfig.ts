import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAllBenefitConfigs,
  getBenefitConfigById,
  getBenefitConfigByType,
  createBenefitConfig,
  updateBenefitConfig,
  deleteBenefitConfig,
} from '../controllers/benefitConfigController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/benefit-config - Get all configs
router.get('/', getAllBenefitConfigs);

// GET /api/benefit-config/:id - Get config by ID
router.get('/:id', getBenefitConfigById);

// GET /api/benefit-config/type/:type - Get config by benefit type
router.get('/type/:type', getBenefitConfigByType);

// POST /api/benefit-config - Create new config (admin only)
router.post('/', createBenefitConfig);

// PUT /api/benefit-config/:id - Update config (admin only)
router.put('/:id', updateBenefitConfig);

// DELETE /api/benefit-config/:id - Soft delete config (admin only)
router.delete('/:id', deleteBenefitConfig);

export default router;
