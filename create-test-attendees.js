// Create test attendees linked to test users
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findUnique({
    where: { id: 'sf-demo' },
  });

  if (!event) {
    console.error('❌ Event sf-demo not found');
    return;
  }

  // Create attendee for test user
  const attendee1 = await prisma.attendee.upsert({
    where: { id: 'cmho8f90f0000wjmtkh8fz04t' },
    update: {},
    create: {
      id: 'cmho8f90f0000wjmtkh8fz04t',
      name: 'Test User',
      email: 'test@example.com',
      events: {
        connect: { id: 'sf-demo' }
      }
    },
  });

  console.log('✅ Attendee created for test user:', attendee1);

  // Create attendee for judge user
  const attendee2 = await prisma.attendee.upsert({
    where: { id: 'cmi382a1900019n7p1rkv6jkf' },
    update: {},
    create: {
      id: 'cmi382a1900019n7p1rkv6jkf',
      name: 'Test Judge',
      email: 'judge@example.com',
      events: {
        connect: { id: 'sf-demo' }
      }
    },
  });

  console.log('✅ Attendee created for judge:', attendee2);
  console.log('\n🎉 All attendees created!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
