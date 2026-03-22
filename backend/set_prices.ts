import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany();
  console.log(`Found ${subjects.length} subjects.`);
  
  for (const subject of subjects) {
    if (!subject.price || Number(subject.price) === 0) {
      const newPrice = Math.floor(Math.random() * 500) + 499; // Random price between 499 and 998
      await prisma.subject.update({
        where: { id: subject.id },
        data: { price: newPrice }
      });
      console.log(`Updated subject "${subject.title}" with price ₹${newPrice}`);
    } else {
      console.log(`Subject "${subject.title}" already has a price of ₹${subject.price}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
