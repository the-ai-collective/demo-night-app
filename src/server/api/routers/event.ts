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
  type EventConfig,
} from "~/lib/types/eventConfig";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

import { type AdminEvent } from "~/app/admin/[eventId]/contexts/DashboardContext";
import { env } from "~/env";

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
        chapterId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = {
        id: input.id,
        name: input.name,
        date: input.date,
        url: input.url,
        config: input.config,
        chapterId: input.chapterId,
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
        const awardsToCreate = isPitchNight
          ? PITCH_NIGHT_AWARDS
          : DEFAULT_AWARDS;

        const result = await db.event.create({
          data: {
            id: data.id!,
            name: data.name!,
            date: data.date!,
            url: data.url!,
            config: eventConfig,
            chapterId: data.chapterId,
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
  allAdmin: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          chapterIds: z.array(z.string()).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
          eventType: z.enum(["demo", "pitch", "all"]).optional(),
          eventStatus: z.enum(["upcoming", "past", "all"]).optional(),
          minDemos: z.number().optional(),
          maxDemos: z.number().optional(),
          minAttendees: z.number().optional(),
          maxAttendees: z.number().optional(),
          hasAttendees: z.boolean().optional(),
          hasDemos: z.boolean().optional(),
          hasFeedback: z.boolean().optional(),
          hasVotes: z.boolean().optional(),
          sortBy: z
            .enum(["date", "name", "demos", "attendees"])
            .optional()
            .default("date"),
          sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const {
        search,
        chapterIds,
        dateFrom,
        dateTo,
        eventType,
        eventStatus,
        minDemos,
        maxDemos,
        minAttendees,
        maxAttendees,
        hasAttendees,
        hasDemos,
        hasFeedback,
        hasVotes,
        sortBy = "date",
        sortOrder = "desc",
        limit,
        offset,
      } = input ?? {};

      // Build where clause
      const where: Prisma.EventWhereInput = {};

      // Search filter
      if (search && search.trim()) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { url: { contains: search, mode: "insensitive" } },
          { id: { contains: search, mode: "insensitive" } },
          {
            chapter: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        ];
      }

      // Chapter filter
      if (chapterIds && chapterIds.length > 0) {
        where.chapterId = { in: chapterIds };
      }

      // Date range filter
      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.gte = dateFrom;
        if (dateTo) dateFilter.lte = dateTo;
        where.date = dateFilter;
      }

      // Event status filter
      if (eventStatus && eventStatus !== "all") {
        const now = new Date();
        if (eventStatus === "upcoming") {
          const existingDateFilter = where.date as any;
          where.date = existingDateFilter ? { ...existingDateFilter, gt: now } : { gt: now };
        } else if (eventStatus === "past") {
          const existingDateFilter = where.date as any;
          where.date = existingDateFilter ? { ...existingDateFilter, lte: now } : { lte: now };
        }
      }

      // Event type filter (Demo Night vs Pitch Night)
      if (eventType && eventType !== "all") {
        // We'll need to filter this post-query since config is JSON
      }

      // Build orderBy
      const orderBy: Prisma.EventOrderByWithRelationInput[] = [];
      if (sortBy === "date") {
        orderBy.push({ date: sortOrder });
      } else if (sortBy === "name") {
        orderBy.push({ name: sortOrder });
      } else if (sortBy === "demos") {
        orderBy.push({ demos: { _count: sortOrder } });
      } else if (sortBy === "attendees") {
        orderBy.push({ attendees: { _count: sortOrder } });
      }

      // Execute query
      const [events, totalCount] = await Promise.all([
        db.event.findMany({
          where,
          orderBy,
          select: {
            id: true,
            name: true,
            date: true,
            url: true,
            config: true,
            secret: true,
            chapterId: true,
            chapter: {
              select: {
                id: true,
                name: true,
                emoji: true,
              },
            },
            _count: {
              select: {
                demos: true,
                attendees: true,
                feedback: true,
                votes: true,
              },
            },
          },
          take: limit,
          skip: offset,
        }),
        db.event.count({ where }),
      ]);

      // Post-query filtering
      let filteredEvents = events;

      // Filter by event type (isPitchNight in config)
      if (eventType && eventType !== "all") {
        filteredEvents = filteredEvents.filter((event) => {
          const config = event.config as EventConfig | null;
          const isPitchNight = config?.isPitchNight ?? false;
          return eventType === "pitch" ? isPitchNight : !isPitchNight;
        });
      }

      // Filter by demo count
      if (minDemos !== undefined || maxDemos !== undefined) {
        filteredEvents = filteredEvents.filter((event) => {
          const count = event._count.demos;
          if (minDemos !== undefined && count < minDemos) return false;
          if (maxDemos !== undefined && count > maxDemos) return false;
          return true;
        });
      }

      // Filter by attendee count
      if (minAttendees !== undefined || maxAttendees !== undefined) {
        filteredEvents = filteredEvents.filter((event) => {
          const count = event._count.attendees;
          if (minAttendees !== undefined && count < minAttendees) return false;
          if (maxAttendees !== undefined && count > maxAttendees) return false;
          return true;
        });
      }

      // Filter by has data
      if (hasAttendees !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) =>
            hasAttendees ? event._count.attendees > 0 : event._count.attendees === 0,
        );
      }
      if (hasDemos !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => (hasDemos ? event._count.demos > 0 : event._count.demos === 0),
        );
      }
      if (hasFeedback !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) =>
            hasFeedback ? event._count.feedback > 0 : event._count.feedback === 0,
        );
      }
      if (hasVotes !== undefined) {
        filteredEvents = filteredEvents.filter(
          (event) => (hasVotes ? event._count.votes > 0 : event._count.votes === 0),
        );
      }

      return {
        events: filteredEvents,
        totalCount,
        hasMore: limit ? offset! + filteredEvents.length < totalCount : false,
      };
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
  populateTestData: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        isPitchNight: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      // Only allow in development mode
      if (env.NODE_ENV !== "development") {
        throw new Error(
          "Test data population is only available in development mode",
        );
      }

      const { eventId, isPitchNight } = input;

      // Test demo data from seed.ts
      const demosInfo = [
        {
          name: "Cofactory",
          description: "The future of value creation in an AI-based economy.",
          url: "https://cofactory.ai/",
        },
        {
          name: "Revamp",
          description:
            "The future of email + SMS personalization for brands and customers is here.",
          url: "https://getrevamp.ai/",
        },
        {
          name: "Cognition",
          description:
            "We are an applied AI lab focused on reasoning, and code is just the beginning.",
          url: "https://cognition.ai/",
        },
        {
          name: "Cursor",
          description: "The AI-first Code Editor.",
          url: "https://cursor.sh/",
        },
        {
          name: "Paradigm.ai",
          description: "Perfectly human-in-the-loop agents that work for you.",
          url: "https://paradigm.ai/",
        },
        {
          name: "Marblism",
          description: "Launch your React and Node.js app in minutes.",
          url: "https://marblism.com/",
        },
        {
          name: "Mercor",
          description:
            "An AI-powered platform that sources, vets, and pays your next employees.",
          url: "https://mercor.com/",
        },
        {
          name: "LlamaIndex",
          description:
            "The central interface between LLMs and your external data.",
          url: "https://www.llamaindex.ai/",
        },
        {
          name: "Higgsfield AI",
          description:
            "Using video AI to democratize social media video creation for all.",
          url: "https://higgsfield.ai/",
        },
        {
          name: "Software Applications Inc.",
          description: "Rethinking the personal computing experience",
          url: "https://software.inc/",
        },
      ];

      // Test attendee data
      const attendeesInfo = [
        {
          name: "Chappy Asel",
          email: "chappy@aicollective.com",
          type: "Founder",
          linkedin: "https://linkedin.com/in/chappyasel",
        },
        { name: "Tim Cook", email: "tim@apple.com", type: "Founder" },
        { name: "Elon Musk", email: "elon@x.com", type: "Investor" },
        { name: "Sam Altman", email: "sam@openai.com", type: "Founder" },
        {
          name: "Satya Nadella",
          email: "satya@microsoft.com",
          type: "Founder",
        },
        { name: "Sundar Pichai", email: "sundar@google.com", type: "Founder" },
        { name: "Mark Zuckerberg", email: "mark@meta.com", type: "Founder" },
        { name: "Jeff Bezos", email: "jeff@amazon.com", type: "Investor" },
        { name: "Jensen Huang", email: "jensen@nvidia.com", type: "Founder" },
        { name: "Marc Andreessen", email: "marc@a16z.com", type: "Investor" },
      ];

      return db.$transaction(async (tx) => {
        // Create attendees
        const attendees = await Promise.all(
          attendeesInfo.map((attendee, index) =>
            tx.attendee.create({
              data: {
                id: `${eventId}-attendee-${index + 1}`,
                name: attendee.name,
                email: attendee.email,
                type: attendee.type,
                linkedin: attendee.linkedin,
                events: { connect: { id: eventId } },
              },
            }),
          ),
        );

        // Delete existing demos and create fresh ones
        await tx.demo.deleteMany({
          where: { eventId },
        });

        // Create all 10 test demos
        const demos = await Promise.all(
          demosInfo.map((demoInfo, index) =>
            tx.demo.create({
              data: {
                eventId,
                index,
                name: demoInfo.name,
                description: demoInfo.description,
                url: demoInfo.url,
                email: `${demoInfo.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
              },
            }),
          ),
        );

        // Create feedback entries (3-4 per demo)
        const feedbackPromises = demos.slice(0, 5).flatMap((demo, demoIndex) =>
          attendees
            .slice(0, 3 + (demoIndex % 2))
            .map((attendee, attendeeIndex) => {
              const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
              const claps = Math.floor(Math.random() * 8); // 0-7 claps
              const tellMeMore = Math.random() > 0.7; // 30% chance
              const comments = [
                "Great demo! Really impressive work.",
                "Love the idea, excited to see where this goes!",
                "Interesting concept, would like to learn more.",
                "Well presented and clear value proposition.",
                "",
              ];

              return tx.feedback.create({
                data: {
                  id: `${eventId}-feedback-${demoIndex}-${attendeeIndex}`,
                  eventId,
                  demoId: demo.id,
                  attendeeId: attendee.id,
                  rating,
                  claps,
                  tellMeMore,
                  comment:
                    comments[Math.floor(Math.random() * comments.length)]!,
                  quickActions: Math.random() > 0.7 ? ["invest"] : [],
                },
              });
            }),
        );

        await Promise.all(feedbackPromises);

        // Get awards for the event
        const awards = await tx.award.findMany({
          where: { eventId },
          orderBy: { index: "asc" },
        });

        if (isPitchNight) {
          // Pitch Night: Create votes with investment amounts ($100k budget per attendee)
          const crowdFavoriteAward = awards.find((a) => a.votable);
          if (crowdFavoriteAward) {
            await Promise.all(
              attendees.map((attendee) => {
                // Distribute $100k across 3-5 demos
                const numInvestments = Math.floor(Math.random() * 3) + 3; // 3-5 investments
                const selectedDemos = demos
                  .sort(() => Math.random() - 0.5)
                  .slice(0, numInvestments);

                // Generate random amounts that sum to $100k
                const amounts = Array.from({ length: numInvestments }, () =>
                  Math.random(),
                );
                const sum = amounts.reduce((a, b) => a + b, 0);
                const normalizedAmounts = amounts.map(
                  (amt) => Math.round(((amt / sum) * 100000) / 5000) * 5000, // Round to nearest $5k
                );

                // Adjust last amount to ensure total is exactly $100k
                const currentSum = normalizedAmounts.reduce((a, b) => a + b, 0);
                normalizedAmounts[normalizedAmounts.length - 1]! +=
                  100000 - currentSum;

                return Promise.all(
                  selectedDemos.map((demo, index) =>
                    tx.vote.create({
                      data: {
                        eventId,
                        attendeeId: attendee.id,
                        awardId: crowdFavoriteAward.id,
                        demoId: demo.id,
                        amount: normalizedAmounts[index]!,
                      },
                    }),
                  ),
                );
              }),
            );
          }
        } else {
          // Demo Night: Create simple votes (one per award per attendee)
          const votePromises = attendees.flatMap((attendee) =>
            awards
              .filter((award) => award.votable)
              .map((award) => {
                const randomDemo =
                  demos[Math.floor(Math.random() * demos.length)]!;
                return tx.vote.create({
                  data: {
                    eventId,
                    attendeeId: attendee.id,
                    awardId: award.id,
                    demoId: randomDemo.id,
                  },
                });
              }),
          );

          await Promise.all(votePromises);
        }

        // Create event feedback
        const eventFeedbackComments = [
          "Amazing event! The demos were incredibly inspiring. Looking forward to the next one!",
          "Great organization and fantastic lineup of demos. The voting system worked smoothly.",
          "Really enjoyed the variety of presentations. Well done!",
        ];

        await Promise.all(
          attendees.slice(0, 3).map((attendee, index) =>
            tx.eventFeedback.create({
              data: {
                eventId,
                attendeeId: attendee.id,
                comment: eventFeedbackComments[index]!,
                surveyOpened: false,
              },
            }),
          ),
        );

        return { success: true };
      });
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
  chapter: {
    select: {
      id: true,
      name: true,
      emoji: true,
    },
  },
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
