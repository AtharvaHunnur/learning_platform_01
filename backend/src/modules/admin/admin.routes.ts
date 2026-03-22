import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import { paymentService } from '../payment/payment.service';
import { sendSuccess } from '../../utils/apiResponse';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', (req, res) => adminController.getDashboardStats(req, res));
router.get('/progress', (req, res) => adminController.getAllLearnerProgress(req, res));
router.get('/payments', async (req, res) => {
  const result = await paymentService.getAllPayments();
  return sendSuccess(res, result);
});

export default router;
