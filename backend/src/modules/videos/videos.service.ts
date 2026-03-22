import prisma from '../../config/db';
import { getYouTubeThumbnail } from '../../utils/youtube';

export class VideosService {
  // ... existing getById ...

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
