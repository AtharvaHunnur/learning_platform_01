import prisma from '../../config/db';

export class VideosService {
  async getById(videoId: string, userId?: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        section: {
          include: {
            subject: {
              include: {
                sections: {
                  orderBy: { order_index: 'asc' },
                  include: {
                    videos: {
                      orderBy: { order_index: 'asc' },
                      select: { id: true, title: true, order_index: true, is_published: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!video) {
      throw { status: 404, message: 'Video not found' };
    }

    // Flatten all videos for ordering
    const allVideos: { id: string; title: string }[] = [];
    video.section.subject.sections.forEach((section) => {
      section.videos.forEach((v) => {
        allVideos.push({ id: v.id, title: v.title });
      });
    });

    const currentIndex = allVideos.findIndex((v) => v.id === videoId);
    const previousVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
    const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

    // Check lock status
    let locked = false;
    let unlockReason = '';

    if (userId) {
      // Check enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          user_id_subject_id: {
            user_id: userId,
            subject_id: video.section.subject.id,
          },
        },
      });

      if (!enrollment) {
        throw { status: 403, message: 'You are not enrolled in this subject' };
      }

      if (currentIndex === 0) {
        locked = false;
      } else {
        const prevVideoId = allVideos[currentIndex - 1].id;
        const prevProgress = await prisma.videoProgress.findUnique({
          where: { user_id_video_id: { user_id: userId, video_id: prevVideoId } },
        });

        if (!prevProgress || !prevProgress.is_completed) {
          locked = true;
          unlockReason = `Complete "${allVideos[currentIndex - 1].title}" first`;
        }
      }

      // Get current video progress
      const progress = await prisma.videoProgress.findUnique({
        where: { user_id_video_id: { user_id: userId, video_id: videoId } },
      });

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        youtube_url: video.youtube_url,
        duration_seconds: video.duration_seconds,
        is_published: video.is_published,
        section_title: video.section.title,
        subject_id: video.section.subject.id,
        subject_title: video.section.subject.title,
        previous_video_id: previousVideo?.id || null,
        next_video_id: nextVideo?.id || null,
        locked,
        unlock_reason: unlockReason,
        progress: progress
          ? {
              last_position_seconds: progress.last_position_seconds,
              is_completed: progress.is_completed,
              completed_at: progress.completed_at,
            }
          : null,
      };
    }

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      youtube_url: video.youtube_url,
      duration_seconds: video.duration_seconds,
      is_published: video.is_published,
      section_title: video.section.title,
      subject_id: video.section.subject.id,
      subject_title: video.section.subject.title,
      previous_video_id: previousVideo?.id || null,
      next_video_id: nextVideo?.id || null,
      locked: true,
      unlock_reason: 'Login required',
      progress: null,
    };
  }

  async create(data: {
    title: string;
    description?: string;
    youtube_url: string;
    section_id: string;
    order_index: number;
    duration_seconds?: number;
  }) {
    const section = await prisma.section.findUnique({ where: { id: data.section_id } });
    if (!section) throw { status: 404, message: 'Section not found' };

    return prisma.video.create({ data });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    youtube_url?: string;
    order_index?: number;
    duration_seconds?: number;
    is_published?: boolean;
  }) {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) throw { status: 404, message: 'Video not found' };

    return prisma.video.update({ where: { id }, data });
  }

  async delete(id: string) {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) throw { status: 404, message: 'Video not found' };

    await prisma.video.delete({ where: { id } });
    return { message: 'Video deleted' };
  }
}

export const videosService = new VideosService();
