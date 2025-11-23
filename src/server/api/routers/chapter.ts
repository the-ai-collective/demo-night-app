import { z } from "zod";

import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  }),

  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    return db.chapter.findUnique({
      where: { id: input },
      include: {
        events: {
          orderBy: { date: "desc" },
        },
      },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        emoji: z
          .string()
          .min(1, "Emoji is required")
          .max(10, "Emoji too long"),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.chapter.create({
        data: {
          name: input.name,
          emoji: input.emoji,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(1, "Name is required")
          .max(100, "Name too long")
          .optional(),
        emoji: z
          .string()
          .min(1, "Emoji is required")
          .max(10, "Emoji too long")
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.chapter.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure.input(z.string()).mutation(async ({ input }) => {
    // When deleting a chapter, events are automatically set to null (onDelete: SetNull)
    return db.chapter.delete({
      where: { id: input },
    });
  }),
});
