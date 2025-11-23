import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.chapter.findMany({
      where: { hidden: false },
      orderBy: { name: "asc" },
    });
  }),

  getAllAdmin: protectedProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { events: true } } },
    });
  }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    return db.chapter.findUnique({
      where: { id: input },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        emoji: z.string().min(1),
        city: z.string().optional(),
        hidden: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.chapter.create({
        data: {
          name: input.name,
          emoji: input.emoji,
          city: input.city,
          hidden: input.hidden ?? false,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        emoji: z.string().min(1),
        city: z.string().optional(),
        hidden: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.chapter.update({
        where: { id: input.id },
        data: {
          name: input.name,
          emoji: input.emoji,
          city: input.city,
          hidden: input.hidden,
        },
      });
    }),

  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    const chapter = await db.chapter.findUnique({
      where: { id: input },
      include: { _count: { select: { events: true } } },
    });

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    if (chapter._count.events > 0) {
      throw new Error(
        `Cannot delete chapter "${chapter.name}" because it has ${chapter._count.events} associated events. Please reassign or delete them first.`,
      );
    }

    return db.chapter.delete({
      where: { id: input },
    });
  }),

  getStats: protectedProcedure
    .input(z.string())
    .query(async ({ input: chapterId }) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get chapter with all events
      const chapter = await db.chapter.findUnique({
        where: { id: chapterId },
        include: {
          events: {
            include: {
              _count: {
                select: {
                  attendees: true,
                  demos: true,
                  votes: true,
                  feedback: true,
                },
              },
            },
          },
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      // Calculate all-time stats
      const totalEvents = chapter.events.length;
      const totalAttendees = chapter.events.reduce(
        (sum, e) => sum + e._count.attendees,
        0,
      );
      const totalDemos = chapter.events.reduce(
        (sum, e) => sum + e._count.demos,
        0,
      );
      const totalVotes = chapter.events.reduce(
        (sum, e) => sum + e._count.votes,
        0,
      );
      const totalFeedback = chapter.events.reduce(
        (sum, e) => sum + e._count.feedback,
        0,
      );

      // Calculate 30-day stats
      const recentEvents = chapter.events.filter(
        (e) => e.date >= thirtyDaysAgo,
      );
      const eventsLast30Days = recentEvents.length;
      const attendeesLast30Days = recentEvents.reduce(
        (sum, e) => sum + e._count.attendees,
        0,
      );
      const votesLast30Days = recentEvents.reduce(
        (sum, e) => sum + e._count.votes,
        0,
      );

      // Get top demos by average rating
      const topDemos = await db.demo.findMany({
        where: {
          event: { chapterId },
          feedback: { some: { rating: { not: null } } },
        },
        include: {
          event: { select: { name: true, date: true } },
          feedback: { select: { rating: true } },
          _count: { select: { feedback: true, votes: true } },
        },
        orderBy: { feedback: { _count: "desc" } },
        take: 50, // Get more to calculate averages
      });

      // Calculate average ratings and sort
      const demosWithAvgRating = topDemos
        .map((demo) => {
          const ratings = demo.feedback
            .map((f) => f.rating)
            .filter((r): r is number => r !== null);
          const avgRating =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
              : 0;
          return {
            id: demo.id,
            name: demo.name,
            eventName: demo.event.name,
            eventDate: demo.event.date,
            avgRating,
            feedbackCount: demo._count.feedback,
            voteCount: demo._count.votes,
          };
        })
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 10); // Top 10

      // Get all chapters for comparison
      const allChapters = await db.chapter.findMany({
        include: {
          events: {
            where: { date: { gte: thirtyDaysAgo } },
            include: {
              _count: {
                select: { attendees: true, votes: true, feedback: true },
              },
            },
          },
        },
      });

      // Calculate rankings
      const chapterMetrics = allChapters.map((ch) => ({
        id: ch.id,
        name: ch.name,
        eventsLast30Days: ch.events.length,
        attendeesLast30Days: ch.events.reduce(
          (sum, e) => sum + e._count.attendees,
          0,
        ),
        votesLast30Days: ch.events.reduce((sum, e) => sum + e._count.votes, 0),
        feedbackLast30Days: ch.events.reduce(
          (sum, e) => sum + e._count.feedback,
          0,
        ),
      }));

      // Sort and find ranking
      chapterMetrics.sort((a, b) => b.attendeesLast30Days - a.attendeesLast30Days);
      const attendeeRank =
        chapterMetrics.findIndex((c) => c.id === chapterId) + 1;

      chapterMetrics.sort((a, b) => b.eventsLast30Days - a.eventsLast30Days);
      const eventRank = chapterMetrics.findIndex((c) => c.id === chapterId) + 1;

      return {
        chapter: {
          id: chapter.id,
          name: chapter.name,
          emoji: chapter.emoji,
          city: chapter.city,
        },
        stats: {
          allTime: {
            totalEvents,
            totalAttendees,
            totalDemos,
            totalVotes,
            totalFeedback,
          },
          last30Days: {
            eventsLast30Days,
            attendeesLast30Days,
            votesLast30Days,
            avgAttendeesPerEvent:
              eventsLast30Days > 0
                ? Math.round(attendeesLast30Days / eventsLast30Days)
                : 0,
          },
        },
        topDemos: demosWithAvgRating,
        rankings: {
          attendeeRank,
          eventRank,
          totalChapters: allChapters.length,
        },
      };
    }),
});

