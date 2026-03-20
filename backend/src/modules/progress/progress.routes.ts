import { Router } from 'express';
import { progressController } from './progress.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/videos/:id', authenticate, (req, res) => progressController.getVideoProgress(req, res));
router.post('/videos/:id', authenticate, (req, res) => progressController.updateVideoProgress(req, res));
router.get('/subjects/:id', authenticate, (req, res) => progressController.getSubjectProgress(req, res));

export default router;
