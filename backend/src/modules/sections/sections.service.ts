import prisma from '../../config/db';

export class SectionsService {
  async listBySubject(subjectId: string) {
    return prisma.section.findMany({
      where: { subject_id: subjectId },
      orderBy: { order_index: 'asc' },
      include: {
        videos: {
          orderBy: { order_index: 'asc' },
          select: { id: true, title: true, order_index: true, duration_seconds: true, is_published: true },
        },
      },
    });
  }

  async create(subjectId: string, title: string, order_index: number) {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw { status: 404, message: 'Subject not found' };

    return prisma.section.create({
      data: { title, subject_id: subjectId, order_index },
    });
  }

  async update(id: string, data: { title?: string; order_index?: number }) {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) throw { status: 404, message: 'Section not found' };

    return prisma.section.update({ where: { id }, data });
  }

  async delete(id: string) {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) throw { status: 404, message: 'Section not found' };

    await prisma.section.delete({ where: { id } });
    return { message: 'Section deleted' };
  }
}

export const sectionsService = new SectionsService();
