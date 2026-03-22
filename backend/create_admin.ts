import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: { password_hash: hash, role: Role.ADMIN },
    create: {
      name: 'Admin',
      email: 'admin@lms.com',
      password_hash: hash,
      role: Role.ADMIN,
    },
  });
  console.log('Admin user updated in DB: admin@lms.com / admin123');
}

main().finally(() => prisma.$disconnect());
