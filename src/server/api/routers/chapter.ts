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
        name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
        emoji: z
          .string()
          .min(1, "Emoji is required")
          .max(2, "Emoji must be 1-2 characters")
          .regex(/[\p{Emoji}]/u, "Must be a valid emoji"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.chapter.create({
          data: {
            name: input.name.trim(),
            emoji: input.emoji.trim(),
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
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: { name?: string; emoji?: string } = {};
      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.emoji !== undefined) {
        updateData.emoji = data.emoji.trim();
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

