import { type Chapter } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  // Get all chapters
  all: publicProcedure.query(async (): Promise<Chapter[]> => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Get all chapters with event counts (for admin)
  allWithCounts: protectedProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });
  }),

  // Get a single chapter
  get: publicProcedure
    .input(z.string())
    .query(async ({ input }): Promise<Chapter | null> => {
      return db.chapter.findUnique({
        where: { id: input },
      });
    }),

  // Create a new chapter
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        emoji: z.string().min(1, "Emoji is required"),
      }),
    )
    .mutation(async ({ input }): Promise<Chapter> => {
      return db.chapter.create({
        data: {
          name: input.name,
          emoji: input.emoji,
        },
      });
    }),

  // Update a chapter
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        emoji: z.string().min(1, "Emoji is required").optional(),
      }),
    )
    .mutation(async ({ input }): Promise<Chapter> => {
      const { id, ...data } = input;
      return db.chapter.update({
        where: { id },
        data,
      });
    }),

  // Delete a chapter
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }): Promise<void> => {
      // When a chapter is deleted, events will have their chapterId set to null
      // due to the onDelete: SetNull in the schema
      await db.chapter.delete({
        where: { id: input },
      });
    }),
});
