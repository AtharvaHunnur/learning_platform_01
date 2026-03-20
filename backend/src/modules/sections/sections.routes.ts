import { Router } from 'express';
import { sectionsController } from './sections.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// Public
router.get('/subject/:subjectId', (req, res) => sectionsController.listBySubject(req, res));

// Admin
router.post('/subject/:subjectId', authenticate, requireAdmin, (req, res) => sectionsController.create(req, res));
router.put('/:id', authenticate, requireAdmin, (req, res) => sectionsController.update(req, res));
router.delete('/:id', authenticate, requireAdmin, (req, res) => sectionsController.delete(req, res));

export default router;
