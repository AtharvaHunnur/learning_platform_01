import { Router } from 'express';
import { videosController } from './videos.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// Get video (optional auth for public info, auth for progress/unlock)
router.get('/:id', optionalAuth, (req, res) => videosController.getById(req, res));

// Admin
router.post('/', authenticate, requireAdmin, (req, res) => videosController.create(req, res));
router.put('/:id', authenticate, requireAdmin, (req, res) => videosController.update(req, res));
router.delete('/:id', authenticate, requireAdmin, (req, res) => videosController.delete(req, res));

export default router;
