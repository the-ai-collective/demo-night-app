import { type Chapter, type Prisma, } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ input }): Promise<Chapter[]> => {
      return db.chapter.findMany({
        take: input?.limit,
        skip: input?.offset,
        select: chapterSelect,
      });
    }),
  get: publicProcedure
    .input(z.string())
    .query(async ({ input }): Promise<Chapter | null> => {
      return db.chapter.findUnique({
        where: { id: input },
      });
    }),
  upsert: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        emoji: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = {
        name: input.name,
        emoji: input.emoji,
      };

      try {
        if (input.id) {
          return db.chapter
            .update({
              where: { id: input.id },
              data,
            });
        }

        return await db.chapter.create({
          data: {
            name: data.name!,
            emoji: data.emoji!,
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("A chapter with this ID already exists");
        }
        throw error;
      }
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.chapter
      .delete({
        where: { id: input },
      });
  }),
});

const chapterSelect: Prisma.ChapterSelect = {
  id: true,
  name: true,
  emoji: true,
  _count: {
    select: {
      events: true,
    }
  }
};