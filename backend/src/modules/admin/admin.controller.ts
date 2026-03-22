import { Request, Response } from 'express';
import prisma from '../../config/db';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class AdminController {
  async getAllLearnerProgress(req: Request, res: Response) {
    try {
      const enrollments = await prisma.enrollment.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          subject: {
            include: { 
              sections: { 
                include: { 
                  _count: { select: { videos: true } } 
                } 
              } 
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      const progressData = await Promise.all(enrollments.map(async (enrol: any) => {
        const allVideoIds = enrol.subject.sections.flatMap((s: any) => s.videos?.map((v: any) => v.id) || []);
        
        // If the query above doesn't fetch video IDs (it doesn't in the include), we need to fetch them
        const subjectWithVideos = await prisma.subject.findUnique({
          where: { id: enrol.subject_id },
          include: { sections: { include: { videos: { select: { id: true } } } } }
        });

        const videoIds = subjectWithVideos?.sections.flatMap(s => s.videos.map(v => v.id)) || [];
        
        const completedCount = await prisma.videoProgress.count({
          where: {
            user_id: enrol.user_id,
            video_id: { in: videoIds },
            is_completed: true
          }
        });

        return {
          id: enrol.id,
          user: enrol.user,
          subject: {
            id: enrol.subject_id,
            title: enrol.subject.title,
            total_videos: videoIds.length
          },
          completed_videos: completedCount,
          progress_percentage: videoIds.length > 0 ? Math.round((completedCount / videoIds.length) * 100) : 0,
          enrolled_at: enrol.created_at
        };
      }));

      return sendSuccess(res, progressData);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const [userCount, subjectCount, totalRevenue] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.subject.count(),
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true }
        })
      ]);

      return sendSuccess(res, {
        users: userCount,
        courses: subjectCount,
        revenue: totalRevenue._sum.amount || 0
      });
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}

export const adminController = new AdminController();
