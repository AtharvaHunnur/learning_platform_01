import { PrismaClient, Role, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting expanded seeding...');

  // 1. Core Users (Admin/Student)
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: { password_hash: adminPassword },
    create: {
      name: 'Admin',
      email: 'admin@lms.com',
      password_hash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@lms.com' },
    update: { password_hash: studentPassword },
    create: {
      name: 'Test Student',
      email: 'student@lms.com',
      password_hash: studentPassword,
      role: Role.STUDENT,
    },
  });

  // 2. Course Data Definitions
  const courses = [
    {
      title: 'MERN Stack Development 2024',
      slug: 'mern-stack-development-2024',
      description: 'Master MongoDB, Express, React, and Node.js. Build high-performance full-stack web applications from scratch.',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      price: 3499.00,
      sections: [
        { title: 'Introduction to MERN', videos: [
          { title: 'MERN Stack Explained', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M', duration: 1200 },
          { title: 'Project Setup & Architecture', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M', duration: 900 }
        ]},
        { title: 'Backend with Node & Express', videos: [
          { title: 'Express Server Setup', url: 'https://www.youtube.com/watch?v=-MTSQjw5DrM', duration: 1500 },
          { title: 'MongoDB & Mongoose', url: 'https://www.youtube.com/watch?v=fgTGADljAeg', duration: 1800 }
        ]}
      ]
    },
    {
      title: 'Data Science & Machine Learning Bootcamp',
      slug: 'data-science-bootcamp',
      description: 'From Python basics to advanced Machine Learning models. Learn NumPy, Pandas, Scikit-Learn, and more.',
      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      price: 4999.00,
      sections: [
        { title: 'Data Analysis with Python', videos: [
          { title: 'Pandas Crash Course', url: 'https://www.youtube.com/watch?v=dcqPhpLi7NY', duration: 2400 },
          { title: 'Data Cleaning Mastery', url: 'https://www.youtube.com/watch?v=bDhvCp3_lYw', duration: 1800 }
        ]},
        { title: 'Machine Learning Models', videos: [
          { title: 'Linear Regression Explained', url: 'https://www.youtube.com/watch?v=Kz4M0Oat7u4', duration: 2100 }
        ]}
      ]
    },
    {
      title: 'AWS Certified Cloud Practitioner',
      slug: 'aws-cloud-practitioner',
      description: 'The ultimate guide to passing the AWS Cloud Practitioner exam. Learn EC2, S3, RDS, and AWS architecture.',
      thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      price: 2999.00,
      sections: [
        { title: 'AWS Services Overview', videos: [
          { title: 'Intro to AWS', url: 'https://www.youtube.com/watch?v=SOTamWNgDKc', duration: 3600 }
        ]}
      ]
    },
    {
      title: 'Cyber Security Essentials',
      slug: 'cyber-security-essentials',
      description: 'Protect systems and networks from digital attacks. Learn ethical hacking, firewalls, and security protocols.',
      thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      price: 1999.00,
      sections: [
        { title: 'Network Security', videos: [
          { title: 'Penetration Testing Basics', url: 'https://www.youtube.com/watch?v=nzj7Wg4DAbs', duration: 4200 }
        ]}
      ]
    },
    {
      title: 'UI/UX Design with Figma',
      slug: 'ui-ux-figma',
      description: 'Design stunning user interfaces and great user experiences. Master Figma, Prototyping, and Design Systems.',
      thumbnail_url: 'https://images.unsplash.com/photo-1541462608141-ad4d1f995502?w=800',
      price: 2499.00,
      sections: [
        { title: 'Figma Mastery', videos: [
          { title: 'Auto Layout Deep Dive', url: 'https://www.youtube.com/watch?v=c9Wg6ndoxdg', duration: 1500 }
        ]}
      ]
    },
    {
      title: 'Next.js 14 Masterclass',
      slug: 'nextjs-14-masterclass',
      description: 'Learn the latest Next.js 14 features. App Router, Server Components, and real-world project builds.',
      thumbnail_url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
      price: 3999.00,
      sections: [
        { title: 'App Router & Basics', videos: [
          { title: 'Server Components vs Client', url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk', duration: 1800 }
        ]}
      ]
    },
    {
      title: 'DevOps & Docker Bootcamp',
      slug: 'devops-bootcamp',
      description: 'Streamline software development and operations. Learn Docker, Kubernetes, CI/CD, and Infrastructure as Code.',
      thumbnail_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
      price: 5999.00,
      sections: [
        { title: 'Containerization', videos: [
          { title: 'Docker for Beginners', url: 'https://www.youtube.com/watch?v=hQcFE0RD0cQ', duration: 2400 }
        ]}
      ]
    },
    {
      title: 'Generative AI (GenAI) Foundation',
      slug: 'gen-ai-foundation',
      description: 'Enter the world of AI. Learn prompt engineering, LLMs, and building AI-powered applications.',
      thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      price: 6499.00,
      sections: [
        { title: 'LLM Basics', videos: [
          { title: 'Intro to Large Language Models', url: 'https://www.youtube.com/watch?v=gyMwXuJrbJQ', duration: 1200 }
        ]}
      ]
    }
  ];

  // 3. Clear existing data (optional, but good for fresh seed)
  // await prisma.enrollment.deleteMany({});
  // await prisma.videoProgress.deleteMany({});
  // await prisma.payment.deleteMany({});
  // await prisma.video.deleteMany({});
  // await prisma.section.deleteMany({});
  // await prisma.subject.deleteMany({});

  // 4. Run seeding loop
  for (const cData of courses) {
    const subject = await prisma.subject.upsert({
      where: { slug: cData.slug },
      update: { 
        price: cData.price,
        description: cData.description,
        thumbnail_url: cData.thumbnail_url
      },
      create: {
        title: cData.title,
        slug: cData.slug,
        description: cData.description,
        thumbnail_url: cData.thumbnail_url,
        price: cData.price,
        is_published: true,
      },
    });

    console.log(`✅ Subject created/updated: ${subject.title} (₹${cData.price})`);

    for (let i = 0; i < cData.sections.length; i++) {
      const sData = cData.sections[i];
      const section = await prisma.section.create({
        data: {
          title: sData.title,
          subject_id: subject.id,
          order_index: i + 1,
        },
      });

      for (let j = 0; j < sData.videos.length; j++) {
        const vData = sData.videos[j];
        await prisma.video.create({
          data: {
            title: vData.title,
            youtube_url: vData.url,
            duration_seconds: vData.duration,
            section_id: section.id,
            order_index: j + 1,
            is_published: true,
          },
        });
      }
    }
  }

  console.log('🎉 Expanded seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@lms.com / admin123');
  console.log('   Student: student@lms.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
