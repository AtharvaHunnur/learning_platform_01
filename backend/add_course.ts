import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adding new course...');

  const subject = await prisma.subject.upsert({
    where: { slug: 'nextjs-15-mastery' },
    update: {
      price: 4999.00,
    },
    create: {
      title: 'Next.js 15 & Tailwind CSS 4 Mastery',
      slug: 'nextjs-15-mastery',
      description: 'Master the latest version of Next.js 15 with Tailwind CSS 4. Learn about the App Router, Server Actions, React 19 integration, and building high-performance full-stack applications.',
      thumbnail_url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
      price: 4999.00,
      is_published: true,
    },
  });

  console.log('✅ Subject created/updated:', subject.title);

  // Create sections
  const section1 = await prisma.section.upsert({
    where: { subject_id_order_index: { subject_id: subject.id, order_index: 1 } },
    update: {},
    create: {
      title: 'Introduction to Next.js 15',
      subject_id: subject.id,
      order_index: 1,
    },
  });

  const section2 = await prisma.section.upsert({
    where: { subject_id_order_index: { subject_id: subject.id, order_index: 2 } },
    update: {},
    create: {
      title: 'Building a Full-Stack Project',
      subject_id: subject.id,
      order_index: 2,
    },
  });

  // Add videos
  const videos = [
    {
      title: 'Next.js 15 Crash Course 2025',
      description: 'Everything you need to know about Next.js 15 in one hour.',
      youtube_url: 'https://www.youtube.com/watch?v=ZjAqacIC_3c',
      section_id: section1.id,
      order_index: 1,
      duration_seconds: 3600,
      is_published: true,
    },
    {
      title: 'Tailwind CSS 4: What is New?',
      description: 'Exploring the massive updates in Tailwind CSS 4.',
      youtube_url: 'https://www.youtube.com/watch?v=vCOSTG10DK8',
      section_id: section1.id,
      order_index: 2,
      duration_seconds: 1200,
      is_published: true,
    },
    {
      title: 'Building a Modern Blog with Next.js 15',
      description: 'Step-by-step guide to building a production-ready blog.',
      youtube_url: 'https://www.youtube.com/watch?v=Zq5fmkH0T78',
      section_id: section2.id,
      order_index: 1,
      duration_seconds: 5400,
      is_published: true,
    },
  ];

  for (const video of videos) {
    await prisma.video.upsert({
      where: { section_id_order_index: { section_id: video.section_id, order_index: video.order_index } },
      update: {
        title: video.title,
        description: video.description,
        youtube_url: video.youtube_url,
        duration_seconds: video.duration_seconds,
        is_published: true,
      },
      create: video,
    });
  }

  console.log('✅ Videos added successfully');
  console.log('🎉 Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error adding course:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
