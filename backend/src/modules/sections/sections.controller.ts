import { Request, Response } from 'express';
import { sectionsService } from './sections.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class SectionsController {
  async listBySubject(req: Request, res: Response) {
    try {
      const result = await sectionsService.listBySubject(req.params.subjectId);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { title, order_index } = req.body;
      if (!title || order_index === undefined) {
        return sendError(res, 'Title and order_index are required', 400);
      }
      const result = await sectionsService.create(req.params.subjectId, title, order_index);
      return sendSuccess(res, result, 'Section created', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await sectionsService.update(req.params.id, req.body);
      return sendSuccess(res, result, 'Section updated');
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await sectionsService.delete(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }
}

export const sectionsController = new SectionsController();
