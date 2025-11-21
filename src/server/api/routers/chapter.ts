import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  }),

  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    return db.chapter.findUnique({
      where: { id: input },
      include: {
        events: {
          orderBy: { date: "desc" },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        emoji: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return db.chapter.create({
        data: {
          name: input.name,
          emoji: input.emoji,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        emoji: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      return db.chapter.update({
        where: { id: input.id },
        data: {
          name: input.name,
          emoji: input.emoji,
        },
      });
    }),

  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    // When a chapter is deleted, events will have their chapterId set to null
    // (due to onDelete: SetNull in schema)
    return db.chapter.delete({
      where: { id: input },
    });
  }),
});