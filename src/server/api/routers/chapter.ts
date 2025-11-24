import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
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
        name: z.string().min(1).optional(),
        emoji: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.chapter.update({
        where: { id },
        data,
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
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

