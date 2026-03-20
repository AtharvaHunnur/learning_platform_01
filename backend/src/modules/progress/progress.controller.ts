import { Response } from 'express';
import { progressService } from './progress.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/auth';

export class ProgressController {
  async getVideoProgress(req: AuthRequest, res: Response) {
    try {
      const result = await progressService.getVideoProgress(req.user!.userId, req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async updateVideoProgress(req: AuthRequest, res: Response) {
    try {
      const { last_position_seconds, is_completed } = req.body;
      const result = await progressService.updateVideoProgress(
        req.user!.userId,
        req.params.id,
        { last_position_seconds, is_completed }
      );
      return sendSuccess(res, result, 'Progress updated');
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async getSubjectProgress(req: AuthRequest, res: Response) {
    try {
      const result = await progressService.getSubjectProgress(req.user!.userId, req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }
}

export const progressController = new ProgressController();
