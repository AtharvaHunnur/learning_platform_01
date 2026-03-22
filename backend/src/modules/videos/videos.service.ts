import prisma from '../../config/db';
import { getYouTubeThumbnail } from '../../utils/youtube';

export class VideosService {
  async getById(id: string, userId?: string) {
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        section: true,
      },
    });

    if (!video) throw { status: 404, message: 'Video not found' };

    // Fetch all sections and videos for this subject to compute prev/next and lock status
    const subjectSections = await prisma.section.findMany({
      where: { subject_id: video.section.subject_id },
      orderBy: { order_index: 'asc' },
      include: {
        videos: {
          orderBy: { order_index: 'asc' },
        },
      },
    });

    const allVideos = subjectSections.flatMap((s) => s.videos);
    const currentIndex = allVideos.findIndex((v) => v.id === id);

    const previous_video_id = currentIndex > 0 ? allVideos[currentIndex - 1].id : null;
    const next_video_id = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1].id : null;

    let locked = false;
    let unlock_reason = '';
    let progress = null;

    if (userId) {
      // Get progress for all videos in this subject
      const progresses = await prisma.videoProgress.findMany({
        where: {
          user_id: userId,
          video_id: { in: allVideos.map((v) => v.id) },
        },
      });

      const progressMap = new Map<string, any>(progresses.map((p) => [p.video_id, p]));

      progress = progressMap.get(id);

      if (currentIndex > 0) {
        const prevVideo = allVideos[currentIndex - 1];
        const prevProgress = progressMap.get(prevVideo.id);
        if (!prevProgress?.is_completed) {
          locked = true;
          unlock_reason = `Please complete the previous lesson: ${prevVideo.title}`;
        }
      }
    } else {
      // If not logged in, only the first video is unlocked (or all locked depending on your business rules)
      if (currentIndex > 0) {
        locked = true;
        unlock_reason = 'Please log in and enroll to access this lesson';
      }
    }

    return {
      id: video.id,
      title: video.title,
      description: video.description,
      youtube_url: video.youtube_url,
      duration_seconds: video.duration_seconds,
      section_title: video.section.title,
      previous_video_id,
      next_video_id,
      locked,
      unlock_reason,
      progress: progress ? { last_position_seconds: progress.last_position_seconds } : null,
    };
  }
  async create(data: {
    title: string;
    description?: string;
    youtube_url: string;
    section_id: string;
    order_index: number;
    duration_seconds?: number;
    thumbnail_url?: string;
  }) {
    const section = await prisma.section.findUnique({ where: { id: data.section_id } });
    if (!section) throw { status: 404, message: 'Section not found' };

    const thumbnail_url = data.thumbnail_url || getYouTubeThumbnail(data.youtube_url) || undefined;

    return prisma.video.create({ 
      data: { ...data, thumbnail_url } 
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    youtube_url?: string;
    order_index?: number;
    duration_seconds?: number;
    is_published?: boolean;
    thumbnail_url?: string;
  }) {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) throw { status: 404, message: 'Video not found' };

    const updateData: any = { ...data };
    if (data.youtube_url && !data.thumbnail_url) {
      updateData.thumbnail_url = getYouTubeThumbnail(data.youtube_url);
    }

    return prisma.video.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) throw { status: 404, message: 'Video not found' };

    await prisma.video.delete({ where: { id } });
    return { message: 'Video deleted' };
  }
}

export const videosService = new VideosService();
