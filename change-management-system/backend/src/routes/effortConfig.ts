import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAllEffortConfigs,
  getEffortConfigById,
  getEffortConfigByType,
  updateEffortConfig,
} from '../controllers/effortConfigController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/effort-config - Get all configs
router.get('/', getAllEffortConfigs);

// GET /api/effort-config/:id - Get config by ID
router.get('/:id', getEffortConfigById);

// GET /api/effort-config/type/:type - Get config by effort type
router.get('/type/:type', getEffortConfigByType);

// PUT /api/effort-config/:id - Update config (admin only)
router.put('/:id', updateEffortConfig);

export default router;
