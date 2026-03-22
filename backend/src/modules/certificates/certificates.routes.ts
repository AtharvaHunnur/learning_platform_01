import { Router } from 'express';
import { certificatesController } from './certificates.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Get public certificate details (No auth required to view)
router.get('/:id', (req, res) => certificatesController.getById(req, res));

// User specific routes
router.use(authenticate);
router.post('/', (req, res) => certificatesController.issueCertificate(req, res));
router.get('/me/all', (req, res) => certificatesController.getMyCertificates(req, res));

export default router;
