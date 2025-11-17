// Create test data for match mode demo
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create or get the sf-demo event
  const event = await prisma.event.upsert({
    where: { id: 'sf-demo' },
    update: { oneVsOneMode: true },
    create: {
      id: 'sf-demo',
      name: 'SF Demo Night',
      date: new Date(),
      url: 'sf-demo',
      secret: 'test-secret',
      oneVsOneMode: true,
    },
  });

  console.log('✅ Event created:', event.name);

  // Create some demo startups
  const demos = await Promise.all([
    prisma.demo.upsert({
      where: { id: 'demo-1' },
      update: {},
      create: {
        id: 'demo-1',
        eventId: 'sf-demo',
        index: 1,
        name: 'AI Chatbot Pro',
        description: 'Advanced AI-powered customer service chatbot',
        email: 'demo1@example.com',
        url: 'https://example.com/demo1',
        votable: true,
      },
    }),
    prisma.demo.upsert({
      where: { id: 'demo-2' },
      update: {},
      create: {
        id: 'demo-2',
        eventId: 'sf-demo',
        index: 2,
        name: 'CloudSync',
        description: 'Real-time cloud synchronization platform',
        email: 'demo2@example.com',
        url: 'https://example.com/demo2',
        votable: true,
      },
    }),
    prisma.demo.upsert({
      where: { id: 'demo-3' },
      update: {},
      create: {
        id: 'demo-3',
        eventId: 'sf-demo',
        index: 3,
        name: 'DataViz Pro',
        description: 'Beautiful data visualization tool',
        email: 'demo3@example.com',
        url: 'https://example.com/demo3',
        votable: true,
      },
    }),
    prisma.demo.upsert({
      where: { id: 'demo-4' },
      update: {},
      create: {
        id: 'demo-4',
        eventId: 'sf-demo',
        index: 4,
        name: 'SecureAuth',
        description: 'Next-gen authentication system',
        email: 'demo4@example.com',
        url: 'https://example.com/demo4',
        votable: true,
      },
    }),
  ]);

  console.log(`✅ Created ${demos.length} demo startups`);

  // Create a default award for voting
  const award = await prisma.award.upsert({
    where: { id: 'match-vote-award' },
    update: {},
    create: {
      id: 'match-vote-award',
      eventId: 'sf-demo',
      index: 1,
      name: 'Match Vote',
      description: 'Vote in match mode',
      votable: true,
    },
  });

  console.log('✅ Award created:', award.name);

  console.log('\n🎉 All test data created successfully!\n');
  console.log('You can now:');
  console.log('1. Refresh http://localhost:3000/admin/test-match');
  console.log('2. Select two startups from the dropdowns');
  console.log('3. Create a match and start testing!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
