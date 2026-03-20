import { Request, Response } from 'express';
import { videosService } from './videos.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/auth';

export class VideosController {
  async getById(req: AuthRequest, res: Response) {
    try {
      const result = await videosService.getById(req.params.id, req.user?.userId);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { title, description, youtube_url, section_id, order_index, duration_seconds } = req.body;
      if (!title || !youtube_url || !section_id || order_index === undefined) {
        return sendError(res, 'Title, youtube_url, section_id, and order_index are required', 400);
      }
      const result = await videosService.create({ title, description, youtube_url, section_id, order_index, duration_seconds });
      return sendSuccess(res, result, 'Video created', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await videosService.update(req.params.id, req.body);
      return sendSuccess(res, result, 'Video updated');
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await videosService.delete(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }
}

export const videosController = new VideosController();
