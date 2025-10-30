import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const attendeeRouter = createTRPCRouter({
  upsert: publicProcedure
    .input(z.object({ id: z.string(), eventId: z.string() }))
    .query(async ({ input }) => {
      return db.attendee.upsert({
        where: { id: input.id },
        create: {
          id: input.id,
          events: { connect: { id: input.eventId } },
        },
        update: {
          events: { connect: { id: input.eventId } },
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string().nullable(),
        linkedin: z.string().nullable(),
        type: z.string().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.attendee.update({
        where: { id: input.id },
        data: { ...input },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.attendee.delete({ where: { id: input } });
  }),
  getAnalytics: protectedProcedure
    .input(z.string())
    .query(async ({ input: eventId }) => {
      const attendees = await db.attendee.findMany({
        where: { events: { some: { id: eventId } } },
        include: {
          _count: {
            select: {
              feedback: { where: { eventId } },
              votes: { where: { eventId } },
            },
          },
          eventFeedback: {
            where: { eventId },
            select: { surveyOpened: true, comment: true },
          },
        },
        orderBy: { name: "asc" },
      });

      return attendees;
    }),
});
