import { eventRouter } from "~/server/api/routers/event";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { attendeeRouter } from "./routers/attendee";
import { awardRouter } from "./routers/award";
import { demoRouter } from "./routers/demo";
import { eventFeedbackRouter } from "./routers/eventFeedback";
import { feedbackRouter } from "./routers/feedback";
import { matchRouter } from "./routers/match";
import { submissionRouter } from "./routers/submission";
import { voteRouter } from "./routers/vote";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  event: eventRouter,
  submission: submissionRouter,
  demo: demoRouter,
  attendee: attendeeRouter,
  award: awardRouter,
  feedback: feedbackRouter,
  vote: voteRouter,
  eventFeedback: eventFeedbackRouter,
  match: matchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
