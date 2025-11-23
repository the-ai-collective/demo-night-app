import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createChapterSchema } from "~/lib/types/chapter";
import { TRPCError } from "@trpc/server";

export const chapterRouter = createTRPCRouter({
  // Get all active chapters
  all: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.chapter.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  }),

  // Get chapter by ID
  get: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.id },
        include: {
          events: {
            orderBy: { date: "desc" },
            include: {
              _count: {
                select: { demos: true, attendees: true },
              },
            },
          },
        },
      });

      if (!chapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      return chapter;
    }),

  // Create or update chapter
  upsert: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid().optional(),
        data: createChapterSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Normalize slug to lowercase to prevent case-sensitive collisions
      const normalizedSlug = input.data.slug.toLowerCase();
      
      // Check if slug already exists (for other chapters)
      if (input.id) {
        const existingSlug = await ctx.db.chapter.findFirst({
          where: {
            slug: normalizedSlug,
            NOT: { id: input.id },
          },
        });

        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug already exists",
          });
        }
      } else {
        const existingSlug = await ctx.db.chapter.findUnique({
          where: { slug: normalizedSlug },
        });

        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug already exists",
          });
        }
      }

      if (input.id) {
        return await ctx.db.chapter.update({
          where: { id: input.id },
          data: {
            ...input.data,
            slug: normalizedSlug,
          },
        });
      }

      return await ctx.db.chapter.create({
        data: {
          ...input.data,
          slug: normalizedSlug,
        },
      });
    }),

  // Soft delete chapter (deactivate)
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.id },
      });

      if (!chapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      return await ctx.db.chapter.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  // Hard delete (admin only - use with caution)
  // This will set chapterId to null on all associated events
  hardDelete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.id },
      });

      if (!chapter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      return await ctx.db.chapter.delete({
        where: { id: input.id },
      });
    }),
});