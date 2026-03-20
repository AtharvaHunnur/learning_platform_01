import prisma from '../../config/db';
import { subjectsService } from '../subjects/subjects.service';
import { PaymentStatus } from '@prisma/client';

export class PaymentService {
  async initiatePayment(userId: string, subjectId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    if (!subject.price) {
      throw { status: 400, message: 'This subject is free or price not set' };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    });

    if (existingEnrollment) {
      throw { status: 400, message: 'Already enrolled in this subject' };
    }

    // Create a pending payment
    const payment = await prisma.payment.create({
      data: {
        user_id: userId,
        subject_id: subjectId,
        amount: subject.price,
        status: PaymentStatus.PENDING,
        transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    });

    return payment;
  }

  async completePayment(paymentId: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw { status: 404, message: 'Payment record not found' };
    }

    if (payment.user_id !== userId) {
      throw { status: 403, message: 'Unauthorized' };
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    // Update payment to completed
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        payment_method: 'DUMMY_GATEWAY',
      },
    });

    // Create enrollment
    await subjectsService.enroll(userId, payment.subject_id);

    return updatedPayment;
  }

  async getPaymentHistory(userId: string) {
    return prisma.payment.findMany({
      where: { user_id: userId },
      include: {
        subject: {
          select: {
            title: true,
            thumbnail_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAllPayments() {
    return prisma.payment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subject: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}

export const paymentService = new PaymentService();
