import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const matchRouter = createTRPCRouter({
  // Get all matches for an event
  all: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      return db.match.findMany({
        where: { eventId: input.eventId },
        include: {
          startupA: true,
          startupB: true,
          votes: {
            include: {
              attendee: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get a specific match
  get: publicProcedure
    .input(z.object({ matchId: z.string() }))
    .query(async ({ input }) => {
      return db.match.findUnique({
        where: { id: input.matchId },
        include: {
          startupA: true,
          startupB: true,
          votes: {
            include: {
              attendee: true,
            },
          },
        },
      });
    }),

  // Create a new match
  create: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        startupAId: z.string(),
        startupBId: z.string(),
        roundType: z.string().optional(),
        votingWindow: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.match.create({
        data: {
          eventId: input.eventId,
          startupAId: input.startupAId,
          startupBId: input.startupBId,
          roundType: input.roundType,
          votingWindow: input.votingWindow,
        },
        include: {
          startupA: true,
          startupB: true,
        },
      });
    }),

  // Start a match
  start: publicProcedure
    .input(z.object({ matchId: z.string() }))
    .mutation(async ({ input }) => {
      return db.match.update({
        where: { id: input.matchId },
        data: {
          isActive: true,
          startTime: new Date(),
        },
      });
    }),

  // Close voting for a match and compute winner
  closeVoting: publicProcedure
    .input(z.object({ matchId: z.string() }))
    .mutation(async ({ input }) => {
      const match = await db.match.findUnique({
        where: { id: input.matchId },
        include: {
          votes: {
            include: {
              attendee: true,
            },
          },
          startupA: true,
          startupB: true,
        },
      });

      if (!match) throw new Error("Match not found");

      // Compute weighted scores
      const result = computeMatchWinner(match);

      return db.match.update({
        where: { id: input.matchId },
        data: {
          isActive: false,
          endTime: new Date(),
          winnerId: result.winnerId,
        },
      });
    }),

  // Get match results with weighted scoring
  getResults: publicProcedure
    .input(z.object({ matchId: z.string() }))
    .query(async ({ input }) => {
      const match = await db.match.findUnique({
        where: { id: input.matchId },
        include: {
          votes: {
            include: {
              attendee: true,
            },
          },
          startupA: true,
          startupB: true,
        },
      });

      if (!match) throw new Error("Match not found");

      return computeMatchWinner(match);
    }),

  // Delete a match
  delete: publicProcedure
    .input(z.object({ matchId: z.string() }))
    .mutation(async ({ input }) => {
      return db.match.delete({
        where: { id: input.matchId },
      });
    }),
});

// Helper function to compute match winner with weighted voting
function computeMatchWinner(match: any) {
  const votesA = match.votes.filter(
    (v: any) => v.demoId === match.startupAId,
  );
  const votesB = match.votes.filter(
    (v: any) => v.demoId === match.startupBId,
  );

  // Separate audience and judge votes
  const audienceVotesA = votesA.filter((v: any) => v.voteType === "audience");
  const audienceVotesB = votesB.filter((v: any) => v.voteType === "audience");
  const judgeVotesA = votesA.filter((v: any) => v.voteType === "judge");
  const judgeVotesB = votesB.filter((v: any) => v.voteType === "judge");

  const totalAudienceVotes = audienceVotesA.length + audienceVotesB.length;
  const totalJudgeVotes = judgeVotesA.length + judgeVotesB.length;

  let finalScoreA = 0;
  let finalScoreB = 0;

  // Calculate weighted scores (50% audience, 50% judge)
  if (totalAudienceVotes > 0) {
    finalScoreA += (audienceVotesA.length / totalAudienceVotes) * 0.5;
    finalScoreB += (audienceVotesB.length / totalAudienceVotes) * 0.5;
  }

  if (totalJudgeVotes > 0) {
    finalScoreA += (judgeVotesA.length / totalJudgeVotes) * 0.5;
    finalScoreB += (judgeVotesB.length / totalJudgeVotes) * 0.5;
  }

  // If no judges, give full weight to audience
  if (totalJudgeVotes === 0 && totalAudienceVotes > 0) {
    finalScoreA = audienceVotesA.length / totalAudienceVotes;
    finalScoreB = audienceVotesB.length / totalAudienceVotes;
  }

  const winnerId =
    finalScoreA > finalScoreB
      ? match.startupAId
      : finalScoreB > finalScoreA
        ? match.startupBId
        : null;

  return {
    matchId: match.id,
    startupA: match.startupA,
    startupB: match.startupB,
    votesA: {
      total: votesA.length,
      audience: audienceVotesA.length,
      judge: judgeVotesA.length,
    },
    votesB: {
      total: votesB.length,
      audience: audienceVotesB.length,
      judge: judgeVotesB.length,
    },
    finalScoreA,
    finalScoreB,
    winnerId,
    winner:
      winnerId === match.startupAId
        ? match.startupA
        : winnerId === match.startupBId
          ? match.startupB
          : null,
  };
}
