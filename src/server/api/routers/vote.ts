import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const voteRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendeeId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const votes = await db.vote.findMany({
        where: { eventId: input.eventId, attendeeId: input.attendeeId },
      });
      // Group votes by awardId - for demo nights returns single vote, for pitch nights returns array
      return votes;
    }),
  upsert: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendeeId: z.string(),
        awardId: z.string(),
        demoId: z.string().nullable(),
        amount: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Validate investment amount if provided
        if (input.amount !== null && input.amount !== undefined) {
          if (input.amount % 1000 !== 0) {
            throw new Error("Investment amount must be in $1k increments");
          }
          if (input.amount < 0) {
            throw new Error("Investment amount cannot be negative");
          }

          // Check total allocated doesn't exceed $100k for this award
          const existingVotes = await db.vote.findMany({
            where: {
              eventId: input.eventId,
              attendeeId: input.attendeeId,
              awardId: input.awardId,
              NOT: {
                demoId: input.demoId, // Exclude current demo to avoid double-counting on update
              },
            },
          });

          const totalAllocated = existingVotes.reduce(
            (sum, v) => sum + (v.amount ?? 0),
            0,
          );

          if (totalAllocated + input.amount > 100000) {
            const remaining = 100000 - totalAllocated;
            throw new Error(
              `Total investment cannot exceed $100,000. You have $${remaining / 1000}k remaining.`,
            );
          }
        }

        // Use the new compound unique key that includes demoId
        // If demoId is null, we need to delete any existing vote for this award (demo night clearing vote)
        if (input.demoId === null) {
          // For demo nights: delete existing vote for this award if clearing selection
          await db.vote.deleteMany({
            where: {
              eventId: input.eventId,
              attendeeId: input.attendeeId,
              awardId: input.awardId,
            },
          });
          return null as any; // Return null when clearing vote
        }

        // For valid votes (demoId is not null), upsert the vote
        return db.vote.upsert({
          where: {
            eventId_attendeeId_awardId_demoId: {
              eventId: input.eventId,
              attendeeId: input.attendeeId,
              awardId: input.awardId,
              demoId: input.demoId,
            },
          },
          create: { ...input },
          update: { ...input },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("Cannot vote for the same award twice");
        }
        throw error;
      }
    }),
  getTotalInvestments: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        awardId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const votes = await db.vote.findMany({
        where: {
          eventId: input.eventId,
          awardId: input.awardId,
        },
        include: {
          demo: true,
        },
      });

      const investmentsByDemo = votes.reduce(
        (acc, vote) => {
          if (vote.demoId && vote.amount) {
            acc[vote.demoId] = (acc[vote.demoId] ?? 0) + vote.amount;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      return investmentsByDemo;
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.vote.delete({
      where: { id: input },
    });
  }),
});
