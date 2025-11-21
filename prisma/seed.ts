import { type Feedback, PrismaClient, SubmissionStatus } from "@prisma/client";
import { DEFAULT_CHAPTERS } from "~/lib/types/chapter";
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Seed default chapters
  console.log("Seeding chapters...");
  for (const chapter of DEFAULT_CHAPTERS) {
    const existingChapter = await prisma.chapter.findUnique({
      where: { slug: chapter.slug },
    });

    if (!existingChapter) {
      await prisma.chapter.create({
        data: chapter,
      });
      console.log(`✓ Created chapter: ${chapter.name}`);
    } else {
      console.log(`✓ Chapter already exists: ${chapter.name}`);
    }
  }

  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
    },
  });

  const demosInfo = [
    {
      name: "Cofactory",
      description: "The future of value creation in an AI-based economy.",
      url: "https://cofactory.ai/",
    },
    {
      name: "Revamp",
      description:
        "The future of email + SMS personalization for brands and customers is here.",
      url: "https://getrevamp.ai/",
    },
    {
      name: "Cognition",
      description:
        "We are an applied AI lab focused on reasoning, and code is just the beginning.",
      url: "https://cognition.ai/",
    },
    {
      name: "Cursor",
      description: "The AI-first Code Editor.",
      url: "https://cursor.sh/",
    },
    {
      name: "Paradigm.ai",
      description: "Perfectly human-in-the-loop agents that work for you.",
      url: "https://paradigm.ai/",
    },
    {
      name: "Marblism",
      description: "Launch your React and Node.js app in minutes.",
      url: "https://marblism.com/",
    },
    {
      name: "Mercor",
      description:
        "An AI-powered platform that sources, vets, and pays your next employees.",
      url: "https://mercor.com/",
    },
    {
      name: "LlamaIndex",
      description: "The central interface between LLMs and your external data.",
      url: "https://www.llamaindex.ai/",
    },
    {
      name: "Higgsfield AI",
      description:
        "Using video AI to democratize social media video creation for all.",
      url: "https://higgsfield.ai/",
    },
    {
      name: "Software Applications Inc.",
      description: "Rethinking the personal computing experience",
      url: "https://software.inc/",
    },
  ];

  const demos = demosInfo.map((demo, index) => ({
    id: `demo-${index + 1}`,
    name: demo.name,
    description: demo.description,
    index: index,
    email: `demo-${index + 1}@example.com`,
    url: demo.url,
  }));

  const submissions = demos.map((demo) => ({
    id: `submission-${demo.id}`,
    name: demo.name,
    tagline: demo.description.split(".")[0]?.trim() ?? demo.name,
    description: demo.description,
    email: demo.email,
    url: demo.url,
    pocName: "Ada Lovelace",
    demoUrl: demo.url,
    status: SubmissionStatus.CONFIRMED,
    flagged: false,
    rating: Math.floor(Math.random() * 3) + 3,
    comment: "",
  }));

  const awardsInfo = [
    {
      name: "🏆 Best Overall",
      description: "Award for the best overall demo!",
    },
    {
      name: "🤖 Best Technology",
      description: "Award for the most technically impressive demo!",
    },
    {
      name: "🎨 Best Design",
      description: "Award for the most visually appealing demo!",
    },
  ];

  const awards = awardsInfo.map((award, index) => ({
    id: `award-${index + 1}`,
    name: award.name,
    description: award.description,
    winnerId: `demo-${index + 1}`,
    index: index,
  }));

  const attendeesInfo = [
    {
      name: "Chappy Asel",
      email: "chappy@aicollective.com",
      linkedin: "https://linkedin.com/in/chappyasel",
      type: "Founder",
    },
    {
      name: "Tim Cook",
      email: "tim@apple.com",
    },
    {
      name: "Elon Musk",
      type: "Investor",
    },
  ];

  const attendees = attendeesInfo.map((attendee, index) => ({
    id: `attendee-${index + 1}`,
    name: attendee.name,
    email: attendee.email,
    linkedin: attendee.linkedin,
    type: attendee.type,
  }));

  const feedbackInfo = [
    {
      rating: 5,
      claps: 7,
      tellMeMore: true,
      comment: "Great demo! Please tell me more! 😄",
    },
    {
      rating: 4,
      claps: 2,
      quickActions: ["invest"],
      comment: "Well done!",
    },
    {
      rating: 1,
      claps: 0,
      comment: "Interesting idea. Terrible execution.",
    },
  ];

  const feedback = feedbackInfo.map((feedback, index) => ({
    id: `feedback-${index + 1}`,
    attendeeId: `attendee-${index + 1}`,
    demoId: "demo-1",
    rating: feedback.rating,
    claps: feedback.claps,
    tellMeMore: feedback.tellMeMore,
    comment: feedback.comment,
  }));

  const votes = Array.from({ length: 3 }, (_, index) => ({
    id: `vote-${index + 1}`,
    attendeeId: `attendee-${index + 1}`,
    awardId: `award-${index + 1}`,
    demoId: `demo-${Math.floor(Math.random() * 10) + 1}`,
  }));

  const eventFeedbackInfo = [
    {
      comment:
        "Amazing event! The demos were incredibly inspiring. Looking forward to the next one!",
    },
    {
      comment:
        "Great organization and fantastic lineup of demos. The voting system worked smoothly.",
    },
  ];

  const eventFeedback = eventFeedbackInfo.map((feedback, index) => ({
    id: `event-feedback-${index + 1}`,
    attendeeId: `attendee-${index + 1}`,
    comment: feedback.comment,
  }));

  await prisma.event.upsert({
    where: { id: "sf-demo" },
    update: {},
    create: {
      id: "sf-demo",
      name: "SF Demo Night 🚀",
      date: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      url: "https://lu.ma/demo-night",
      submissions: { create: submissions },
      demos: { create: demos },
      awards: { create: awards },
      attendees: { create: attendees },
      feedback: { create: feedback },
      votes: { create: votes },
      eventFeedback: { create: eventFeedback },
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
