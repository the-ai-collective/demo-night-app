import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  // Get all chapters
  getAll: publicProcedure.query(async () => {
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

  // Get a single chapter by ID
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

  // Create a new chapter
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        emoji: z.string().min(1, "Emoji is required"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.chapter.create({
          data: {
            name: input.name,
            emoji: input.emoji,
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("A chapter with this name already exists");
        }
        throw error;
      }
    }),

  // Update an existing chapter
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        emoji: z.string().min(1, "Emoji is required").optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return await db.chapter.update({
          where: { id },
          data,
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("A chapter with this name already exists");
        }
        if (error.code === "P2025") {
          throw new Error("Chapter not found");
        }
        throw error;
      }
    }),

  // Delete a chapter
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        // Check if chapter has events
        const chapter = await db.chapter.findUnique({
          where: { id: input },
          include: {
            _count: {
              select: {
                events: true,
              },
            },
          },
        });

        if (!chapter) {
          throw new Error("Chapter not found");
        }

        // Delete the chapter - events will have their chapterId set to null due to onDelete: SetNull
        return await db.chapter.delete({
          where: { id: input },
        });
      } catch (error: any) {
        if (error.code === "P2025") {
          throw new Error("Chapter not found");
        }
        throw error;
      }
    }),
});


