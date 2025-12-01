import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getDiagramState, saveDiagramState } from '../controllers/diagramController.js';

const router = Router();

router.get('/state', protect, getDiagramState);
router.post('/state', protect, saveDiagramState);

export default router;
