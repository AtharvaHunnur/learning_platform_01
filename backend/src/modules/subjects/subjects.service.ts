import prisma from '../../config/db';
import slugify from 'slugify';
import { getYouTubeThumbnail } from '../../utils/youtube';

export class SubjectsService {
  async list(page: number = 1, limit: number = 12, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { is_published: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          _count: { select: { sections: true, enrollments: true } },
        },
      }),
      prisma.subject.count({ where }),
    ]);

    return {
      subjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order_index: 'asc' },
          include: {
            videos: {
              orderBy: { order_index: 'asc' },
              select: {
                id: true,
                title: true,
                order_index: true,
                duration_seconds: true,
                is_published: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    return subject;
  }

  async getTree(subjectId: string, userId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        sections: {
          orderBy: { order_index: 'asc' },
          include: {
            videos: {
              orderBy: { order_index: 'asc' },
            },
          },
        },
      },
    });

    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    });

    if (!enrollment) {
      throw { status: 403, message: 'You are not enrolled in this subject' };
    }

    // Flatten all videos to compute lock status
    const allVideos: any[] = [];
    subject.sections.forEach((section) => {
      section.videos.forEach((video) => {
        allVideos.push(video);
      });
    });

    // Get progress for all videos
    const progressRecords = await prisma.videoProgress.findMany({
      where: {
        user_id: userId,
        video_id: { in: allVideos.map((v) => v.id) },
      },
    });

    const progressMap = new Map(progressRecords.map((p) => [p.video_id, p]));

    // Compute lock status
    const videoStatusMap = new Map<string, { is_completed: boolean; locked: boolean; last_position_seconds: number }>();
    
    for (let i = 0; i < allVideos.length; i++) {
      const video = allVideos[i];
      const progress = progressMap.get(video.id);
      const isCompleted = progress?.is_completed || false;

      let locked = false;
      if (i === 0) {
        locked = false; // First video is always unlocked
      } else {
        const prevVideoId = allVideos[i - 1].id;
        const prevStatus = videoStatusMap.get(prevVideoId);
        locked = !prevStatus?.is_completed;
      }

      videoStatusMap.set(video.id, {
        is_completed: isCompleted,
        locked,
        last_position_seconds: progress?.last_position_seconds || 0,
      });
    }

    // Build tree response
    const tree = subject.sections.map((section) => ({
      id: section.id,
      title: section.title,
      order_index: section.order_index,
      videos: section.videos.map((video) => {
        const status = videoStatusMap.get(video.id)!;
        return {
          id: video.id,
          title: video.title,
          duration_seconds: video.duration_seconds,
          order_index: video.order_index,
          is_published: video.is_published,
          is_completed: status.is_completed,
          locked: status.locked,
          last_position_seconds: status.last_position_seconds,
        };
      }),
    }));

    return {
      id: subject.id,
      title: subject.title,
      slug: subject.slug,
      description: subject.description,
      thumbnail_url: subject.thumbnail_url,
      sections: tree,
    };
  }

  async create(data: { title: string; description?: string; thumbnail_url?: string; price?: number; preview_youtube_url?: string; is_published?: boolean }) {
    const slug = slugify(data.title, { lower: true, strict: true });

    const existing = await prisma.subject.findUnique({ where: { slug } });
    if (existing) {
      throw { status: 409, message: 'A subject with this title already exists' };
    }

    let { thumbnail_url, preview_youtube_url, ...rest } = data;
    if (!thumbnail_url && preview_youtube_url) {
      thumbnail_url = getYouTubeThumbnail(preview_youtube_url) || undefined;
    }

    return prisma.subject.create({
      data: { ...rest, thumbnail_url, slug },
    });
  }

  async update(id: string, data: { title?: string; description?: string; thumbnail_url?: string; is_published?: boolean; price?: number; preview_youtube_url?: string }) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    const { preview_youtube_url, ...rest } = data;
    const updateData: any = { ...rest };
    if (data.title) {
      updateData.slug = slugify(data.title, { lower: true, strict: true });
    }

    if (!data.thumbnail_url && preview_youtube_url) {
      updateData.thumbnail_url = getYouTubeThumbnail(preview_youtube_url);
    }

    return prisma.subject.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    await prisma.subject.delete({ where: { id } });
    return { message: 'Subject deleted' };
  }

  async enroll(userId: string, subjectId: string) {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw { status: 404, message: 'Subject not found' };
    }

    const existing = await prisma.enrollment.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    });

    if (existing) {
      throw { status: 409, message: 'Already enrolled' };
    }

    return prisma.enrollment.create({
      data: { user_id: userId, subject_id: subjectId },
    });
  }

  async checkEnrollment(userId: string, subjectId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    });

    let certificate_id = null;
    if (enrollment) {
      const cert = await prisma.certificate.findUnique({
        where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } }
      });
      if (cert) {
        certificate_id = cert.id;
      }
    }

    return { enrolled: !!enrollment, certificate_id };
  }
}

export const subjectsService = new SubjectsService();
