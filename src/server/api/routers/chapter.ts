import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });
  }),
  get: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return db.chapter.findUnique({
      where: { id: input },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
        emoji: z
          .string()
          .min(1, "Emoji is required")
          .max(2, "Emoji must be 1-2 characters")
          .regex(/[\p{Emoji}]/u, "Must be a valid emoji"),
        description: z.string().max(500, "Description must be 500 characters or less").optional(),
        order: z.number().int().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.chapter.create({
          data: {
            name: input.name.trim(),
            emoji: input.emoji.trim(),
            description: input.description?.trim() || null,
            order: input.order ?? 0,
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("A chapter with this name already exists");
        }
        throw error;
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(1, "Name is required")
          .max(50, "Name must be 50 characters or less")
          .optional(),
        emoji: z
          .string()
          .min(1, "Emoji is required")
          .max(2, "Emoji must be 1-2 characters")
          .regex(/[\p{Emoji}]/u, "Must be a valid emoji")
          .optional(),
        description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
        order: z.number().int().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: {
        name?: string;
        emoji?: string;
        description?: string | null;
        order?: number;
      } = {};
      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.emoji !== undefined) {
        updateData.emoji = data.emoji.trim();
      }
      if (data.description !== undefined) {
        updateData.description = data.description?.trim() || null;
      }
      if (data.order !== undefined) {
        updateData.order = data.order;
      }
      try {
        return await db.chapter.update({
          where: { id },
          data: updateData,
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("A chapter with this name already exists");
        }
        throw error;
      }
    }),
  getStatistics: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const now = new Date();
      const [totalEvents, upcomingEvents, pastEvents] = await Promise.all([
        db.event.count({
          where: { chapterId: input },
        }),
        db.event.count({
          where: {
            chapterId: input,
            date: { gte: now },
          },
        }),
        db.event.count({
          where: {
            chapterId: input,
            date: { lt: now },
          },
        }),
      ]);

      return {
        totalEvents,
        upcomingEvents,
        pastEvents,
      };
    }),
  getAffectedEvents: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const now = new Date();
      const events = await db.event.findMany({
        where: { chapterId: input },
        select: {
          id: true,
          name: true,
          date: true,
        },
        orderBy: { date: "desc" },
      });

      const upcomingEvents = events.filter((e) => e.date >= now);
      const pastEvents = events.filter((e) => e.date < now);

      return {
        all: events,
        upcoming: upcomingEvents,
        past: pastEvents,
        hasUpcoming: upcomingEvents.length > 0,
      };
    }),
  bulkAssignEvents: protectedProcedure
    .input(
      z.object({
        chapterId: z.string().nullable(),
        eventIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      return db.event.updateMany({
        where: {
          id: { in: input.eventIds },
        },
        data: {
          chapterId: input.chapterId,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const now = new Date();
      // Check for upcoming events
      const upcomingEvents = await db.event.count({
        where: {
          chapterId: input,
          date: { gte: now },
        },
      });

      if (upcomingEvents > 0) {
        throw new Error(
          `Cannot delete chapter: It has ${upcomingEvents} upcoming event(s). Please reassign or remove these events first.`,
        );
      }

      // When deleting a chapter, set all associated events' chapterId to null
      return db.$transaction(async (prisma) => {
        await prisma.event.updateMany({
          where: { chapterId: input },
          data: { chapterId: null },
        });
        return prisma.chapter.delete({
          where: { id: input },
        });
      });
    }),
});

