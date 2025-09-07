import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning up existing data...');
    await prisma.todoItem.deleteMany();
    await prisma.todoList.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();
  }

  // Seed data would go here if needed
  console.log('✅ Seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
