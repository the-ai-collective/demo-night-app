import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const chapterRouter = createTRPCRouter({
  all: publicProcedure.query(() => {
    return db.chapter.findMany({ orderBy: { name: "asc" } });
  }),
  allAdmin: protectedProcedure.query(() => {
    return db.chapter.findMany({ orderBy: { name: "asc" } });
  }),
  withEvents: protectedProcedure.query(() => {
    return db.chapter.findMany({
      where: {
        events: {
          some: {}, // Only chapters that have at least one event
        },
      },
      orderBy: { name: "asc" },
    });
  }),
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    return db.chapter.findUnique({ where: { id: input } });
  }),
  upsert: protectedProcedure
    .input(
      z.object({
        originalId: z.string().optional(),
        id: z.string().optional(),
        name: z.string(),
        emoji: z.string().optional().default("🏷️"),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.originalId) {
        return db.chapter.update({ where: { id: input.originalId }, data: { id: input.id ?? input.originalId, name: input.name, emoji: input.emoji } });
      }
      try {
        const res = await db.chapter.create({ data: { id: input.id, name: input.name, emoji: input.emoji } });
        return res;
      } catch (err: unknown) {
        const isPrismaErr = (e: unknown): e is { code?: string } =>
          typeof e === "object" && e !== null && "code" in e;
        if (isPrismaErr(err) && err.code === "P2002") {
          throw new Error("A chapter with this ID already exists");
        }
        if (err instanceof Error) throw err;
        throw new Error("Unknown error creating chapter");
      }
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    // Deleting the chapter will set the events' chapterId to null because of the
    // Prisma relation `onDelete: SetNull` on Event.chapter. So we can safely
    // delete the chapter directly.
    return db.chapter.delete({ where: { id: input } });
  }),
});

export type ChapterRouter = typeof chapterRouter;
