import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  all: protectedProcedure.query(async () => {
    return db.chapter.findMany({
      orderBy: { name: "asc" },
    });
  }),
  get: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
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
        name: z.string().min(1, "Chapter name is required"),
        emoji: z.string().min(1, "Chapter emoji is required"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return db.chapter.create({
          data: {
            name: input.name,
            emoji: input.emoji,
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A chapter with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create chapter",
        });
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Chapter name is required").optional(),
        emoji: z.string().min(1, "Chapter emoji is required").optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      try {
        return db.chapter.update({
          where: { id },
          data,
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A chapter with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update chapter",
        });
      }
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        return db.chapter.delete({
          where: { id: input },
        });
      } catch (error: any) {
        if (error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chapter not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to delete chapter",
        });
      }
    }),
});

