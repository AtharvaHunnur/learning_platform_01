import { Request, Response } from 'express';
import { subjectsService } from './subjects.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/auth';

export class SubjectsController {
  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const search = req.query.search as string | undefined;

      const result = await subjectsService.list(page, limit, search);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await subjectsService.getById(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async getTree(req: AuthRequest, res: Response) {
    try {
      const result = await subjectsService.getTree(req.params.id, req.user!.userId);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { title, description, thumbnail_url } = req.body;
      if (!title) return sendError(res, 'Title is required', 400);

      const result = await subjectsService.create({ title, description, thumbnail_url });
      return sendSuccess(res, result, 'Subject created', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const result = await subjectsService.update(req.params.id, req.body);
      return sendSuccess(res, result, 'Subject updated');
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await subjectsService.delete(req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async enroll(req: AuthRequest, res: Response) {
    try {
      const result = await subjectsService.enroll(req.user!.userId, req.params.id);
      return sendSuccess(res, result, 'Enrolled successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async checkEnrollment(req: AuthRequest, res: Response) {
    try {
      const result = await subjectsService.checkEnrollment(req.user!.userId, req.params.id);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }
}

export const subjectsController = new SubjectsController();
