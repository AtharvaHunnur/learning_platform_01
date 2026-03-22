import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const aiController = new AIController();

router.use(authenticate);

router.post('/chat', aiController.chat);
router.post('/sessions', aiController.createSession);
router.get('/sessions', aiController.getSessions);
router.get('/sessions/:sessionId/messages', aiController.getMessages);

export default router;
