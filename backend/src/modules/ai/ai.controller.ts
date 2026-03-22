import { Request, Response } from 'express';
import { AIService } from './ai.service';
import { AssistantType } from '@prisma/client';
import { env } from '../../config/env';

const aiService = new AIService();

export class AIController {
  async chat(req: Request, res: Response) {
    try {
      const { sessionId, message } = req.body;
      const userId = (req as any).user.userId;

      if (!sessionId || !message) {
        return res.status(400).json({ message: 'Session ID and message are required' });
      }

      if (!env.HUGGINGFACE_API_KEY) {
        return res.status(500).json({ message: 'Hugging Face API key is not configured in Vercel Environment Variables. Please add HUGGINGFACE_API_KEY.' });
      }

      const responseMsg = await aiService.chat(sessionId, userId, message);
      res.json(responseMsg);
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ message: error.message || 'Error occurred during AI chat' });
    }
  }

  async createSession(req: Request, res: Response) {
    try {
      const { type, title } = req.body;
      const userId = (req as any).user.userId;

      if (!type || !Object.values(AssistantType).includes(type)) {
        return res.status(400).json({ message: 'Invalid assistant type' });
      }

      const session = await aiService.createSession(userId, type as AssistantType, title);
      res.status(201).json(session);
    } catch (error: any) {
      console.error('Create Session Error:', error);
      res.status(500).json({ message: error.message || 'Error creating chat session' });
    }
  }

  async getSessions(req: Request, res: Response) {
    try {
      const { type } = req.query;
      const userId = (req as any).user.userId;

      const sessions = await aiService.getSessions(userId, type as AssistantType);
      res.json(sessions);
    } catch (error: any) {
      console.error('Get Sessions Error:', error);
      res.status(500).json({ message: error.message || 'Error fetching chat sessions' });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user.userId;

      const messages = await aiService.getMessages(sessionId, userId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Error fetching chat messages' });
    }
  }
}
