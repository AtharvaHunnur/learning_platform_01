import prisma from '../../config/db';

export class ProgressService {
  async getVideoProgress(userId: string, videoId: string) {
    const progress = await prisma.videoProgress.findUnique({
      where: { user_id_video_id: { user_id: userId, video_id: videoId } },
    });

    return progress || {
      last_position_seconds: 0,
      is_completed: false,
      completed_at: null,
    };
  }

  async updateVideoProgress(
    userId: string,
    videoId: string,
    data: { last_position_seconds?: number; is_completed?: boolean }
  ) {
    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { section: true },
    });

    if (!video) {
      throw { status: 404, message: 'Video not found' };
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_subject_id: {
          user_id: userId,
          subject_id: video.section.subject_id,
        },
      },
    });

    if (!enrollment) {
      throw { status: 403, message: 'You are not enrolled in this subject' };
    }

    // Check if video is locked
    const subject = await prisma.subject.findUnique({
      where: { id: video.section.subject_id },
      include: {
        sections: {
          orderBy: { order_index: 'asc' },
          include: {
            videos: { orderBy: { order_index: 'asc' }, select: { id: true } },
          },
        },
      },
    });

    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    const allVideoIds: string[] = [];
    subject.sections.forEach((s) => s.videos.forEach((v) => allVideoIds.push(v.id)));

    const currentIndex = allVideoIds.indexOf(videoId);
    if (currentIndex > 0) {
      const prevVideoId = allVideoIds[currentIndex - 1];
      const prevProgress = await prisma.videoProgress.findUnique({
        where: { user_id_video_id: { user_id: userId, video_id: prevVideoId } },
      });

      if (!prevProgress || !prevProgress.is_completed) {
        throw { status: 403, message: 'Previous video must be completed first' };
      }
    }

    const updateData: any = {};
    if (data.last_position_seconds !== undefined) {
      updateData.last_position_seconds = data.last_position_seconds;
    }
    if (data.is_completed) {
      updateData.is_completed = true;
      updateData.completed_at = new Date();
    }

    return prisma.videoProgress.upsert({
      where: { user_id_video_id: { user_id: userId, video_id: videoId } },
      update: updateData,
      create: {
        user_id: userId,
        video_id: videoId,
        last_position_seconds: data.last_position_seconds || 0,
        is_completed: data.is_completed || false,
        completed_at: data.is_completed ? new Date() : null,
      },
    });
  }

  async getSubjectProgress(userId: string, subjectId: string) {
    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    });

    if (!enrollment) {
      throw { status: 403, message: 'You are not enrolled in this subject' };
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        sections: {
          orderBy: { order_index: 'asc' },
          include: {
            videos: {
              orderBy: { order_index: 'asc' },
              select: { id: true, title: true, duration_seconds: true },
            },
          },
        },
      },
    });

    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    const allVideoIds = subject.sections.flatMap((s) => s.videos.map((v) => v.id));

    const progressRecords = await prisma.videoProgress.findMany({
      where: { user_id: userId, video_id: { in: allVideoIds } },
    });

    const completedCount = progressRecords.filter((p) => p.is_completed).length;
    const totalVideos = allVideoIds.length;

    return {
      subject_id: subjectId,
      total_videos: totalVideos,
      completed_videos: completedCount,
      progress_percentage: totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0,
    };
  }
}

export const progressService = new ProgressService();
