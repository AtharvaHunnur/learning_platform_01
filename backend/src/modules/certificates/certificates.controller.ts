import { Request, Response } from 'express';
import { certificatesService } from './certificates.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { AuthRequest } from '../../middleware/auth';

export class CertificatesController {
  async issueCertificate(req: AuthRequest, res: Response) {
    try {
      const { subjectId } = req.body;
      if (!subjectId) {
        return sendError(res, 'subjectId is required', 400);
      }
      const certificate = await certificatesService.issueCertificate(req.user!.userId, subjectId);
      return sendSuccess(res, certificate, 'Certificate issued successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async getMyCertificates(req: AuthRequest, res: Response) {
    try {
      const certificates = await certificatesService.getByUserId(req.user!.userId);
      return sendSuccess(res, certificates);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const certificate = await certificatesService.getById(req.params.id);
      return sendSuccess(res, certificate);
    } catch (error: any) {
      return sendError(res, error.message, error.status || 500);
    }
  }
}

export const certificatesController = new CertificatesController();
