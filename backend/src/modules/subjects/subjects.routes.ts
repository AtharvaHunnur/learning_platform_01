import { Router } from 'express';
import { subjectsController } from './subjects.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// Public
router.get('/', (req, res) => subjectsController.list(req, res));
router.get('/:id', (req, res) => subjectsController.getById(req, res));

// Authenticated
router.get('/:id/tree', authenticate, (req, res) => subjectsController.getTree(req, res));
router.post('/:id/enroll', authenticate, (req, res) => subjectsController.enroll(req, res));
router.get('/:id/enrollment', authenticate, (req, res) => subjectsController.checkEnrollment(req, res));

// Admin
router.post('/', authenticate, requireAdmin, (req, res) => subjectsController.create(req, res));
router.put('/:id', authenticate, requireAdmin, (req, res) => subjectsController.update(req, res));
router.delete('/:id', authenticate, requireAdmin, (req, res) => subjectsController.delete(req, res));

export default router;
