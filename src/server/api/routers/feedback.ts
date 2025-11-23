import { type Feedback } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { sanitizeEmailText } from "~/lib/sanitize";

export const MAX_RATING = 5;

export const feedbackRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendeeId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const feedbacks = await db.feedback.findMany({
        where: { eventId: input.eventId, attendeeId: input.attendeeId },
      });
      return feedbacks.reduce(
        (acc, feedback) => {
          acc[feedback.demoId] = feedback;
          return acc;
        },
        {} as Record<string, Feedback>,
      );
    }),
  upsert: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendeeId: z.string(),
        demoId: z.string(),
        rating: z.number().min(1).max(10).optional().nullable(),
        claps: z.number().min(0).optional(),
        tellMeMore: z.boolean().optional(),
        quickActions: z.array(z.string()).optional(),
        comment: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Sanitize user inputs
        const sanitizedData = {
          eventId: input.eventId,
          attendeeId: input.attendeeId,
          demoId: input.demoId,
          rating: input.rating,
          claps: input.claps,
          tellMeMore: input.tellMeMore,
          quickActions: input.quickActions?.map(action => sanitizeEmailText(action, 50)),
          comment: input.comment ? sanitizeEmailText(input.comment, 500) : null,
        };

        return db.feedback.upsert({
          where: {
            eventId_attendeeId_demoId: {
              eventId: input.eventId,
              attendeeId: input.attendeeId,
              demoId: input.demoId,
            },
          },
          create: sanitizedData,
          update: sanitizedData,
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("Cannot give feedback for the same demo twice");
        }
        throw error;
      }
    }),
  delete: adminProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.feedback.delete({
      where: { id: input },
    });
  }),
});
