import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export const chapterRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
        emoji: z.string().min(1, "Emoji is required").max(8, "Emoji must be 8 characters or less"),
        slug: z
          .string()
          .min(1, "Slug is required")
          .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
          .max(100, "Slug must be less than 100 characters")
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Auto-generate slug from name if not provided
      const slug = input.slug ?? generateSlug(input.name);
      
      try {
        return await db.chapter.create({
          data: {
            name: input.name,
            emoji: input.emoji,
            slug,
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A chapter with this slug already exists",
          });
        }
        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional(),
        emoji: z.string().min(1, "Emoji is required").max(8, "Emoji must be 8 characters or less").optional(),
        slug: z
          .string()
          .min(1, "Slug is required")
          .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
          .max(100, "Slug must be less than 100 characters")
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Remove undefined values to avoid Prisma issues
      const data: Record<string, unknown> = {};
      if (updateData.name !== undefined) data.name = updateData.name;
      if (updateData.emoji !== undefined) data.emoji = updateData.emoji;
      if (updateData.slug !== undefined) data.slug = updateData.slug;
      
      // If name is updated but slug isn't, keep slug stable (don't auto-regenerate)
      // This preserves URLs. If slug needs to change, it must be explicitly provided.
      
      try {
        return await db.chapter.update({
          where: { id },
          data,
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A chapter with this slug already exists",
          });
        }
        if (error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chapter not found",
          });
        }
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        // Use transaction to ensure atomicity
        // Prisma's onDelete: SetNull handles the event updates, but wrapping in transaction
        // ensures consistency if anything else needs to happen
        return await db.$transaction(async (tx) => {
          // Verify chapter exists before deleting
          const chapter = await tx.chapter.findUnique({
            where: { id: input },
            select: { id: true },
          });
          
          if (!chapter) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Chapter not found",
            });
          }
          
          // Delete chapter - events.chapterId will be set to null via onDelete: SetNull
          return await tx.chapter.delete({
            where: { id: input },
          });
        });
      } catch (error: any) {
        // Re-throw TRPCErrors as-is
        if (error instanceof TRPCError) {
          throw error;
        }
        // Handle unexpected errors
        throw error;
      }
    }),
});

