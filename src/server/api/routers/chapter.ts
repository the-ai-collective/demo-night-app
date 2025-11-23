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
});

