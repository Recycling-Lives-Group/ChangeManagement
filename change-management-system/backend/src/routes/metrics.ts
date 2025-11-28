import express from 'express';
import { getMetrics } from '../controllers/metricsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMetrics);

export default router;
