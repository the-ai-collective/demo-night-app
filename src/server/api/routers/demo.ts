import { type Demo, type Feedback } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

type BaseFeedback = {
  id: string;
  rating: number | null;
  claps: number;
  comment: string | null;
};

type FeedbackAttribution = {
  tellMeMore: boolean;
  quickActions: string[];
  attendee: {
    name: string | null;
    email: string | null;
    linkedin: string | null;
    type: string | null;
  };
};

export type DemoFeedback = BaseFeedback & Partial<FeedbackAttribution>;

export type CompleteDemo = Demo & {
  feedback: DemoFeedback[];
};

export type FeedbackAndAttendee = Feedback & {
  attendee: { name: string | null; type: string | null };
};

export type DemoStats = {
  totalFeedback: number;
  averageRating: number | null;
  totalClaps: number;
  totalTellMeMore: number;
  quickActionCounts: Record<string, number>;
  totalMoneyRaised: number;
};

export const demoRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string(), secret: z.string() }))
    .query(async ({ input }) => {
      const demo = await db.demo.findUnique({
        where: { id: input.id, secret: input.secret },
        include: {
          feedback: {
            include: {
              attendee: true,
            },
          },
        },
      });
      if (!demo) {
        throw new Error("Demo not found");
      }
      const allFeedback: DemoFeedback[] = [];
      for (const feedback of demo.feedback) {
        if (feedback.tellMeMore || feedback.quickActions.length > 0) {
          allFeedback.push({
            id: feedback.id,
            claps: feedback.claps,
            comment: feedback.comment,
            rating: feedback.rating,
            tellMeMore: feedback.tellMeMore,
            quickActions: feedback.quickActions,
            attendee: {
              name: feedback.attendee?.name,
              email: feedback.attendee?.email,
              linkedin: feedback.attendee?.linkedin,
              type: feedback.attendee.type,
            },
          });
        } else {
          allFeedback.push({
            id: feedback.id,
            claps: feedback.claps,
            comment: feedback.comment,
            rating: feedback.rating,
          });
        }
      }
      return { ...demo, feedback: allFeedback };
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        secret: z.string(),
        name: z.string(),
        description: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        url: z.string().url().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ input }) => {
      return db.demo.update({
        where: { id: input.id, secret: input.secret },
        data: {
          ...input,
          description: input.description ?? null,
          email: input.email ?? null,
          url: input.url ?? null,
        },
      });
    }),
  getFeedback: protectedProcedure
    .input(z.string().nullable())
    .query(async ({ input }): Promise<FeedbackAndAttendee[]> => {
      if (!input) {
        return [];
      }
      return db.feedback.findMany({
        where: { demoId: input },
        include: {
          attendee: { select: { name: true, type: true } },
        },
      });
    }),
  upsert: protectedProcedure
    .input(
      z.object({
        originalId: z.string().optional(),
        id: z.string().optional(),
        eventId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        url: z.string().url().optional().or(z.literal("")),
        votable: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const processedInput = {
        ...input,
        description: input.description ?? null,
        email: input.email ?? null,
        url: input.url ?? null,
      };

      if (input.originalId) {
        return db.demo.update({
          where: { id: input.originalId },
          data: {
            id: processedInput.id,
            name: processedInput.name,
            description: processedInput.description,
            email: processedInput.email,
            url: processedInput.url,
            votable: processedInput.votable,
          },
        });
      } else {
        const index = await db.demo.count({
          where: { eventId: input.eventId },
        });
        return db.demo.create({
          data: {
            ...processedInput,
            index,
          },
        });
      }
    }),
  updateIndex: protectedProcedure
    .input(z.object({ id: z.string(), index: z.number() }))
    .mutation(async ({ input }) => {
      return db.$transaction(async (prisma) => {
        const demoToUpdate = await prisma.demo.findUnique({
          where: { id: input.id },
          select: { index: true, eventId: true },
        });

        if (!demoToUpdate) {
          throw new Error("Demo not found");
        }

        if (demoToUpdate.index === input.index || input.index < 0) {
          return;
        }

        const maxIndex =
          (await prisma.demo.count({
            where: { eventId: demoToUpdate.eventId },
          })) - 1;

        if (input.index > maxIndex) {
          return;
        }

        if (demoToUpdate.index < input.index) {
          await prisma.demo.updateMany({
            where: {
              eventId: demoToUpdate.eventId,
              index: { gte: demoToUpdate.index, lte: input.index },
              NOT: { id: input.id },
            },
            data: {
              index: { decrement: 1 },
            },
          });
        } else {
          await prisma.demo.updateMany({
            where: {
              eventId: demoToUpdate.eventId,
              index: { gte: input.index, lte: demoToUpdate.index },
              NOT: { id: input.id },
            },
            data: {
              index: { increment: 1 },
            },
          });
        }

        return prisma.demo.update({
          where: { id: input.id },
          data: { index: input.index },
        });
      });
    }),
  setDemos: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        demos: z.array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            description: z.string().optional(),
            email: z.string().optional(),
            url: z.string().optional(),
            votable: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return db.$transaction(async (prisma) => {
        await prisma.demo.deleteMany({
          where: { eventId: input.eventId },
        });
        await prisma.demo.createMany({
          data: input.demos.map((demo, index) => ({
            ...demo,
            description: demo.description ?? null,
            email: demo.email ?? null,
            url: demo.url ?? null,
            eventId: input.eventId,
            index,
          })),
        });
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.$transaction(async (prisma) => {
      const demoToDelete = await prisma.demo.findUnique({
        where: { id: input },
        select: { eventId: true, index: true },
      });

      if (!demoToDelete) {
        throw new Error("Demo not found");
      }

      await prisma.demo.delete({
        where: { id: input },
      });

      await prisma.demo.updateMany({
        where: {
          eventId: demoToDelete.eventId,
          index: { gt: demoToDelete.index },
        },
        data: {
          index: { decrement: 1 },
        },
      });
    });
  }),
  getStats: publicProcedure
    .input(z.object({ id: z.string(), secret: z.string() }))
    .query(async ({ input }): Promise<DemoStats> => {
      const demo = await db.demo.findUnique({
        where: { id: input.id, secret: input.secret },
        include: {
          feedback: true,
          votes: true,
        },
      });

      if (!demo) {
        throw new Error("Demo not found");
      }

      // Calculate aggregate stats
      const totalFeedback = demo.feedback.length;
      const ratingsOnly = demo.feedback
        .filter((f) => f.rating !== null)
        .map((f) => f.rating!);
      const averageRating =
        ratingsOnly.length > 0
          ? ratingsOnly.reduce((sum, r) => sum + r, 0) / ratingsOnly.length
          : null;
      const totalClaps = demo.feedback.reduce((sum, f) => sum + f.claps, 0);
      const totalTellMeMore = demo.feedback.filter((f) => f.tellMeMore).length;

      // Count quick actions
      const quickActionCounts: Record<string, number> = {};
      demo.feedback.forEach((f) => {
        f.quickActions.forEach((action) => {
          quickActionCounts[action] = (quickActionCounts[action] ?? 0) + 1;
        });
      });

      // Calculate total money raised (in cents)
      const totalMoneyRaised = demo.votes.reduce(
        (sum, v) => sum + (v.amount ?? 0),
        0,
      );

      return {
        totalFeedback,
        averageRating,
        totalClaps,
        totalTellMeMore,
        quickActionCounts,
        totalMoneyRaised,
      };
    }),
});
