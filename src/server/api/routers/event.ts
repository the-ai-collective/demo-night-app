import {
  type Award,
  type Demo,
  type Event,
  type EventFeedback,
  type Prisma,
} from "@prisma/client";
import { z } from "zod";

import { DEFAULT_AWARDS, PITCH_NIGHT_AWARDS } from "~/lib/types/award";
import * as kv from "~/lib/types/currentEvent";
import { DEFAULT_DEMOS } from "~/lib/types/demo";
import {
  DEFAULT_EVENT_CONFIG,
  eventConfigSchema,
} from "~/lib/types/eventConfig";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

import { type AdminEvent } from "~/app/admin/[eventId]/contexts/DashboardContext";

export type CompleteEvent = Event & {
  demos: PublicDemo[];
  awards: Award[];
  eventFeedback: EventFeedback[];
};

export type PublicDemo = Omit<
  Demo,
  "eventId" | "secret" | "createdAt" | "updatedAt"
>;

export const eventRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ input }): Promise<CompleteEvent[]> => {
      return db.event.findMany({
        where: { date: { lte: new Date() } },
        select: completeEventSelect,
        orderBy: { date: "desc" },
        take: input?.limit,
        skip: input?.offset,
      });
    }),
  getCurrent: publicProcedure
    .meta({ openapi: { method: "GET", path: "/event/current" } })
    .input(z.undefined())
    .output(
      z
        .object({
          id: z.string(),
          name: z.string(),
          phase: z.nativeEnum(kv.EventPhase),
          currentDemoId: z.string().nullable(),
          currentAwardId: z.string().nullable(),
          isPitchNight: z.boolean().optional().default(false),
        })
        .nullable(),
    )
    .query(async () => {
      const currentEvent = await kv.getCurrentEvent();
      // Handle migration: add isPitchNight if missing from old data
      if (currentEvent && !("isPitchNight" in currentEvent)) {
        const oldEvent = currentEvent as Omit<kv.CurrentEvent, "isPitchNight">;
        const migratedEvent: kv.CurrentEvent = {
          id: oldEvent.id,
          name: oldEvent.name,
          phase: oldEvent.phase,
          currentDemoId: oldEvent.currentDemoId,
          currentAwardId: oldEvent.currentAwardId,
          isPitchNight: false,
        };
        return migratedEvent;
      }
      return currentEvent;
    }),
  get: publicProcedure
    .input(z.string())
    .query(async ({ input }): Promise<CompleteEvent | null> => {
      return db.event.findUnique({
        where: { id: input },
        select: completeEventSelect,
      });
    }),
  upsert: protectedProcedure
    .input(
      z.object({
        originalId: z.string().optional(),
        id: z.string().optional(),
        name: z.string().optional(),
        date: z.date().optional(),
        url: z.string().url().optional(),
        config: eventConfigSchema.optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = {
        id: input.id,
        name: input.name,
        date: input.date,
        url: input.url,
        config: input.config,
      };

      try {
        if (input.originalId) {
          return db.event
            .update({
              where: { id: input.originalId },
              data,
            })
            .then(async (res: Event) => {
              const currentEvent = await kv.getCurrentEvent();
              if (currentEvent?.id === input.originalId) {
                kv.updateCurrentEvent({
                  id: res.id,
                  name: res.name,
                  config: res.config,
                });
              }
              return res;
            });
        }
        const eventConfig = data.config ?? DEFAULT_EVENT_CONFIG;
        const isPitchNight = eventConfig.isPitchNight ?? false;
        const awardsToCreate = isPitchNight ? PITCH_NIGHT_AWARDS : DEFAULT_AWARDS;

        const result = await db.event.create({
          data: {
            id: data.id!,
            name: data.name!,
            date: data.date!,
            url: data.url!,
            config: eventConfig,
            demos: {
              create: DEFAULT_DEMOS,
            },
            awards: {
              create: awardsToCreate,
            },
          },
        });
        return result;
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("An event with this ID already exists");
        }
        throw error;
      }
    }),
  allAdmin: protectedProcedure.query(() => {
    return db.event.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        name: true,
        date: true,
        url: true,
        config: true,
        secret: true,
        _count: {
          select: {
            demos: true,
            attendees: true,
          },
        },
      },
    });
  }),
  getAdmin: protectedProcedure
    .input(z.string())
    .query(async ({ input }): Promise<AdminEvent | null> => {
      return db.event.findUnique({
        where: { id: input },
        include: {
          demos: { orderBy: { index: "asc" } },
          attendees: { orderBy: { name: "asc" } },
          awards: { orderBy: { index: "asc" } },
          eventFeedback: { orderBy: { createdAt: "desc" } },
        },
      });
    }),
  updateCurrent: protectedProcedure
    .input(z.string().nullable())
    .mutation(async ({ input }) => {
      if (!input) {
        return kv.updateCurrentEvent(null);
      }
      const event = await db.event.findUnique({
        where: { id: input },
        select: { id: true, name: true, config: true },
      });
      if (!event) {
        throw new Error("Event not found");
      }
      return kv.updateCurrentEvent(event);
    }),
  updateCurrentState: protectedProcedure
    .input(
      z.object({
        phase: z.nativeEnum(kv.EventPhase).optional(),
        currentDemoId: z.string().optional().nullable(),
        currentAwardId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      return kv.updateCurrentEventState(input);
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.event
      .delete({
        where: { id: input },
      })
      .then(async () => {
        const currentEvent = await kv.getCurrentEvent();
        if (input === currentEvent?.id) {
          return kv.updateCurrentEvent(null);
        }
      });
  }),
});

const completeEventSelect: Prisma.EventSelect = {
  id: true,
  name: true,
  date: true,
  url: true,
  config: true,
  demos: {
    orderBy: { index: "asc" },
    select: {
      id: true,
      index: true,
      name: true,
      description: true,
      email: true,
      url: true,
      votable: true,
    },
  },
  awards: { orderBy: { index: "asc" } },
};
