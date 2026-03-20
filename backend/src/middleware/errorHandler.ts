import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err);
  
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal Server Error';
  
  sendError(res, message, 500);
};

export const notFoundHandler = (
  _req: Request,
  res: Response
): void => {
  sendError(res, 'Route not found', 404);
};
