import prisma from '../../config/db';

export class CertificatesService {
  /**
   * Check if user has completed all videos in a subject and issue certificate if eligible
   */
  async issueCertificate(userId: string, subjectId: string) {
    // Check if certificate already exists
    const existing = await prisma.certificate.findUnique({
      where: {
        user_id_subject_id: { user_id: userId, subject_id: subjectId }
      }
    });

    if (existing) {
      return existing;
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_subject_id: { user_id: userId, subject_id: subjectId }
      }
    });

    if (!enrollment) {
      throw { status: 403, message: 'Must be enrolled in the subject to get a certificate' };
    }

    // Get all videos for the subject
    const sections = await prisma.section.findMany({
      where: { subject_id: subjectId },
      include: { videos: { select: { id: true } } }
    });

    const allVideoIds = sections.flatMap(s => s.videos.map(v => v.id));
    if (allVideoIds.length === 0) {
      throw { status: 400, message: 'Subject has no content' };
    }

    // Get user's completed videos for this subject
    const completedProgress = await prisma.videoProgress.findMany({
      where: {
        user_id: userId,
        video_id: { in: allVideoIds },
        is_completed: true
      }
    });

    if (completedProgress.length < allVideoIds.length) {
      throw { status: 400, message: 'You must complete all videos to earn a certificate' };
    }

    // Issue certificate
    return prisma.certificate.create({
      data: {
        user_id: userId,
        subject_id: subjectId
      },
      include: {
        subject: { select: { title: true } },
      }
    });
  }

  /**
   * Get public details of a certificate by ID
   */
  async getById(id: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        subject: { select: { title: true, description: true } }
      }
    });

    if (!certificate) {
      throw { status: 404, message: 'Certificate not found' };
    }

    return certificate;
  }

  /**
   * Get all certificates earned by a user
   */
  async getByUserId(userId: string) {
    return prisma.certificate.findMany({
      where: { user_id: userId },
      include: {
        subject: { select: { title: true, thumbnail_url: true, slug: true } }
      },
      orderBy: { issued_at: 'desc' }
    });
  }
}

export const certificatesService = new CertificatesService();
