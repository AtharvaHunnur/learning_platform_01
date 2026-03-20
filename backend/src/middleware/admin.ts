import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { sendError } from '../utils/apiResponse';

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    sendError(res, 'Admin access required', 403);
    return;
  }
  next();
};
