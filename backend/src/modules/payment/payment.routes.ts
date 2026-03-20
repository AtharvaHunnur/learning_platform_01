import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';

const router = Router();

// Authenticated (Student)
router.post('/initiate', authenticate, (req, res) => paymentController.initiate(req, res));
router.post('/:paymentId/complete', authenticate, (req, res) => paymentController.complete(req, res));
router.get('/history', authenticate, (req, res) => paymentController.history(req, res));

// Admin
router.get('/admin/all', authenticate, requireAdmin, (req, res) => paymentController.allPayments(req, res));

export default router;
