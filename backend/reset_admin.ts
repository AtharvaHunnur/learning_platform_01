import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.update({
    where: { email: 'admin123@gmail.com' },
    data: { password_hash: hash }
  });
  console.log('Password updated to password123');
}

main().finally(() => prisma.$disconnect());
