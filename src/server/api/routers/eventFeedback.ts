import { type EventFeedback } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export type EventFeedbackAndAttendee = EventFeedback & {
  attendee: {
    name: string | null;
    type: string | null;
  };
};

export const eventFeedbackRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendeeId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const feedbacks = await db.eventFeedback.findUnique({
        where: {
          eventId_attendeeId: {
            eventId: input.eventId,
            attendeeId: input.attendeeId,
          },
        },
      });
      return feedbacks;
    }),
  getAdmin: protectedProcedure
    .input(z.string())
    .query(async ({ input }): Promise<EventFeedbackAndAttendee[]> => {
      return db.eventFeedback.findMany({
        where: { eventId: input },
        include: {
          attendee: { select: { name: true, type: true } },
        },
      });
    }),
  upsert: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendeeId: z.string(),
        comment: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return db.eventFeedback.upsert({
          where: {
            eventId_attendeeId: {
              eventId: input.eventId,
              attendeeId: input.attendeeId,
            },
          },
          create: { ...input },
          update: { ...input },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("Cannot give feedback for the same event twice");
        }
        throw error;
      }
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.eventFeedback.delete({
      where: { id: input },
    });
  }),
  markSurveyOpened: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendeeId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.eventFeedback.upsert({
        where: {
          eventId_attendeeId: {
            eventId: input.eventId,
            attendeeId: input.attendeeId,
          },
        },
        create: {
          eventId: input.eventId,
          attendeeId: input.attendeeId,
          surveyOpened: true,
        },
        update: {
          surveyOpened: true,
        },
      });
    }),
});
