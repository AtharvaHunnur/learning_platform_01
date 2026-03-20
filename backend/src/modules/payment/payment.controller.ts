import { Request, Response } from 'express';
import { paymentService } from './payment.service';

export class PaymentController {
  async initiate(req: Request, res: Response) {
    try {
      const { subjectId } = req.body;
      const userId = (req as any).user.userId;

      if (!subjectId) {
        return res.status(400).json({ message: 'Subject ID is required' });
      }

      const payment = await paymentService.initiatePayment(userId, subjectId);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
  }

  async complete(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const userId = (req as any).user.userId;

      const payment = await paymentService.completePayment(paymentId, userId);
      res.status(200).json(payment);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
  }

  async history(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const history = await paymentService.getPaymentHistory(userId);
      res.status(200).json(history);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
  }

  async allPayments(req: Request, res: Response) {
    try {
      const payments = await paymentService.getAllPayments();
      res.status(200).json(payments);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export const paymentController = new PaymentController();
