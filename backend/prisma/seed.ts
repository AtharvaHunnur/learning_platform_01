import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin123@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin123@gmail.com',
      password_hash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create a student user
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@lms.com' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'student@lms.com',
      password_hash: studentPassword,
      role: Role.STUDENT,
    },
  });
  console.log('✅ Student user created:', student.email);

  // Create sample subjects
  const subject1 = await prisma.subject.upsert({
    where: { slug: 'javascript-fundamentals' },
    update: {},
    create: {
      title: 'JavaScript Fundamentals',
      slug: 'javascript-fundamentals',
      description: 'Learn the fundamentals of JavaScript programming from scratch. This comprehensive course covers variables, data types, functions, loops, DOM manipulation, and modern ES6+ features.',
      thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
      is_published: true,
    },
  });

  const subject2 = await prisma.subject.upsert({
    where: { slug: 'react-masterclass' },
    update: {},
    create: {
      title: 'React Masterclass',
      slug: 'react-masterclass',
      description: 'Master React.js from beginner to advanced. Build real-world applications with hooks, context, Redux, and Next.js integration.',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
      is_published: true,
    },
  });

  const subject3 = await prisma.subject.upsert({
    where: { slug: 'python-for-beginners' },
    update: {},
    create: {
      title: 'Python for Beginners',
      slug: 'python-for-beginners',
      description: 'Start your programming journey with Python. Learn syntax, data structures, OOP, file handling, and build practical projects.',
      thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      is_published: true,
    },
  });

  // Create sections and videos for Subject 1 - JavaScript
  const jsSection1 = await prisma.section.create({
    data: {
      title: 'Getting Started',
      subject_id: subject1.id,
      order_index: 1,
    },
  });

  const jsSection2 = await prisma.section.create({
    data: {
      title: 'Variables & Data Types',
      subject_id: subject1.id,
      order_index: 2,
    },
  });

  const jsSection3 = await prisma.section.create({
    data: {
      title: 'Functions & Scope',
      subject_id: subject1.id,
      order_index: 3,
    },
  });

  // Videos for JS Section 1
  await prisma.video.createMany({
    data: [
      {
        title: 'Welcome to JavaScript',
        description: 'Introduction to the course and what you will learn.',
        youtube_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        section_id: jsSection1.id,
        order_index: 1,
        duration_seconds: 720,
        is_published: true,
      },
      {
        title: 'Setting Up Your Environment',
        description: 'Install VS Code and set up your development environment.',
        youtube_url: 'https://www.youtube.com/watch?v=hPAWzMxHj-o',
        section_id: jsSection1.id,
        order_index: 2,
        duration_seconds: 540,
        is_published: true,
      },
    ],
  });

  // Videos for JS Section 2
  await prisma.video.createMany({
    data: [
      {
        title: 'Variables: let, const, var',
        description: 'Understanding variable declarations in JavaScript.',
        youtube_url: 'https://www.youtube.com/watch?v=9WIJQDvt4Us',
        section_id: jsSection2.id,
        order_index: 1,
        duration_seconds: 660,
        is_published: true,
      },
      {
        title: 'Data Types Explained',
        description: 'Strings, numbers, booleans, null, undefined, and symbols.',
        youtube_url: 'https://www.youtube.com/watch?v=O57UmAiffWM',
        section_id: jsSection2.id,
        order_index: 2,
        duration_seconds: 780,
        is_published: true,
      },
      {
        title: 'Type Coercion & Conversion',
        description: 'How JavaScript handles type conversions.',
        youtube_url: 'https://www.youtube.com/watch?v=XBEfM1ZxAQI',
        section_id: jsSection2.id,
        order_index: 3,
        duration_seconds: 480,
        is_published: true,
      },
    ],
  });

  // Videos for JS Section 3
  await prisma.video.createMany({
    data: [
      {
        title: 'Function Declarations vs Expressions',
        description: 'Different ways to create functions in JavaScript.',
        youtube_url: 'https://www.youtube.com/watch?v=bGDP-ECLSPY',
        section_id: jsSection3.id,
        order_index: 1,
        duration_seconds: 600,
        is_published: true,
      },
      {
        title: 'Arrow Functions',
        description: 'Modern ES6 arrow function syntax.',
        youtube_url: 'https://www.youtube.com/watch?v=h33Srr5J9nY',
        section_id: jsSection3.id,
        order_index: 2,
        duration_seconds: 420,
        is_published: true,
      },
    ],
  });

  // Create sections and videos for Subject 2 - React
  const reactSection1 = await prisma.section.create({
    data: {
      title: 'React Basics',
      subject_id: subject2.id,
      order_index: 1,
    },
  });

  const reactSection2 = await prisma.section.create({
    data: {
      title: 'Hooks Deep Dive',
      subject_id: subject2.id,
      order_index: 2,
    },
  });

  await prisma.video.createMany({
    data: [
      {
        title: 'What is React?',
        description: 'Introduction to React and the component model.',
        youtube_url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
        section_id: reactSection1.id,
        order_index: 1,
        duration_seconds: 900,
        is_published: true,
      },
      {
        title: 'JSX in Depth',
        description: 'Understanding JSX syntax and expressions.',
        youtube_url: 'https://www.youtube.com/watch?v=7fPXI_MnBOY',
        section_id: reactSection1.id,
        order_index: 2,
        duration_seconds: 660,
        is_published: true,
      },
      {
        title: 'useState Hook',
        description: 'Managing state with the useState hook.',
        youtube_url: 'https://www.youtube.com/watch?v=O6P86uwfdR0',
        section_id: reactSection2.id,
        order_index: 1,
        duration_seconds: 720,
        is_published: true,
      },
      {
        title: 'useEffect Hook',
        description: 'Side effects and lifecycle with useEffect.',
        youtube_url: 'https://www.youtube.com/watch?v=0ZJgIjIuY7U',
        section_id: reactSection2.id,
        order_index: 2,
        duration_seconds: 840,
        is_published: true,
      },
    ],
  });

  // Create sections and videos for Subject 3 - Python
  const pySection1 = await prisma.section.create({
    data: {
      title: 'Python Basics',
      subject_id: subject3.id,
      order_index: 1,
    },
  });

  await prisma.video.createMany({
    data: [
      {
        title: 'Installing Python',
        description: 'Download and install Python on your machine.',
        youtube_url: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
        section_id: pySection1.id,
        order_index: 1,
        duration_seconds: 360,
        is_published: true,
      },
      {
        title: 'Your First Python Program',
        description: 'Write and run your first Python script.',
        youtube_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        section_id: pySection1.id,
        order_index: 2,
        duration_seconds: 480,
        is_published: true,
      },
    ],
  });

  // Enroll student in JavaScript course
  await prisma.enrollment.create({
    data: {
      user_id: student.id,
      subject_id: subject1.id,
    },
  });

  console.log('✅ Sample subjects created with sections and videos');
  console.log('✅ Student enrolled in JavaScript Fundamentals');
  console.log('🎉 Seed completed!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin123@gmail.com / admin123');
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
