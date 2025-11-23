import { createTRPCRouter } from "~/server/api/trpc";
import { eventRouter } from "~/server/api/routers/event";
import { demoRouter } from "~/server/api/routers/demo";
import { submissionRouter } from "~/server/api/routers/submission";
import { attendeeRouter } from "~/server/api/routers/attendee";
import { feedbackRouter } from "~/server/api/routers/feedback";
import { voteRouter } from "~/server/api/routers/vote";
import { awardRouter } from "~/server/api/routers/award";
import { eventFeedbackRouter } from "~/server/api/routers/eventFeedback";
import { chapterRouter } from "~/server/api/routers/chapter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  event: eventRouter,
  demo: demoRouter,
  submission: submissionRouter,
  attendee: attendeeRouter,
  feedback: feedbackRouter,
  vote: voteRouter,
  award: awardRouter,
  eventFeedback: eventFeedbackRouter,
  chapter: chapterRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

// export caller for server-side calls
export const createCaller = appRouter.createCaller;
