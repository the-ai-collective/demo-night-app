// Quick script to create a test user for local development
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      isJudge: false, // Set to true if you want to test judge features
    },
  });

  console.log('✅ Test user created:', user);

  // Create a test judge user too
  const judge = await prisma.user.upsert({
    where: { email: 'judge@example.com' },
    update: {},
    create: {
      email: 'judge@example.com',
      name: 'Test Judge',
      isJudge: true,
    },
  });

  console.log('✅ Test judge created:', judge);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
