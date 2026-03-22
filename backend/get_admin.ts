import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { role: 'ADMIN' } }).then(u => console.log('Admin:', u?.email)).finally(() => prisma.$disconnect());
