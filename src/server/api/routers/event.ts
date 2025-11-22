import {
  type Award,
  type Demo,
  type Event,
  type EventFeedback,
  type Prisma,
} from "@prisma/client";
import { z } from "zod";

import { sendPostEventDigestEmail } from "~/lib/email";
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
import { env } from "~/env";

export type CompleteEvent = Event & {
  demos: PublicDemo[];
  awards: Award[];
  eventFeedback: EventFeedback[];
  chapters: { id: string; name: string; emoji: string }[];
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
        chapterIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (input.originalId) {
          // Update existing event
          const updateData: Prisma.EventUpdateInput = {
            id: input.id,
            name: input.name,
            date: input.date,
            url: input.url,
            config: input.config,
          };

          // Handle chapter connections if provided
          if (input.chapterIds !== undefined) {
            updateData.chapters = {
              set: input.chapterIds.map((id) => ({ id })),
            };
          }

          return db.event
            .update({
              where: { id: input.originalId },
              data: updateData,
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

        // Create new event
        const eventConfig = input.config ?? DEFAULT_EVENT_CONFIG;
        const isPitchNight = eventConfig.isPitchNight ?? false;
        const awardsToCreate = isPitchNight
          ? PITCH_NIGHT_AWARDS
          : DEFAULT_AWARDS;

        const result = await db.event.create({
          data: {
            id: input.id!,
            name: input.name!,
            date: input.date!,
            url: input.url!,
            config: eventConfig,
            chapters: input.chapterIds?.length
              ? { connect: input.chapterIds.map((id) => ({ id })) }
              : undefined,
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
        chapters: {
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
          chapters: true,
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
  // Post-event analytics
  getAnalytics: protectedProcedure
    .input(z.string())
    .query(async ({ input: eventId }) => {
      const event = await db.event.findUnique({
        where: { id: eventId },
        include: {
          demos: {
            include: {
              feedback: {
                include: {
                  attendee: { select: { name: true } },
                },
              },
              awards: true,
            },
          },
          attendees: true,
          feedback: true,
          awards: { include: { winner: true } },
        },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Calculate overall event stats
      const totalAttendees = event.attendees.length;
      const totalFeedback = event.feedback.length;
      const attendeesWhoGaveFeedback = new Set(
        event.feedback.map((f) => f.attendeeId),
      ).size;
      const engagementRate =
        totalAttendees > 0
          ? Math.round((attendeesWhoGaveFeedback / totalAttendees) * 100)
          : 0;

      // Calculate overall ratings
      const allRatings = event.feedback
        .filter((f) => f.rating !== null)
        .map((f) => f.rating!);
      const averageRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
          : null;
      const totalClaps = event.feedback.reduce((sum, f) => sum + f.claps, 0);
      const totalTellMeMore = event.feedback.filter((f) => f.tellMeMore).length;

      // Quick action breakdown across all demos
      const quickActionCounts: Record<string, number> = {};
      event.feedback.forEach((f) => {
        f.quickActions.forEach((action) => {
          quickActionCounts[action] = (quickActionCounts[action] ?? 0) + 1;
        });
      });

      // Per-demo analytics
      const demoAnalytics = event.demos.map((demo) => {
        const demoFeedback = demo.feedback;
        const demoRatings = demoFeedback
          .filter((f) => f.rating !== null)
          .map((f) => f.rating!);
        const demoAvgRating =
          demoRatings.length > 0
            ? demoRatings.reduce((sum, r) => sum + r, 0) / demoRatings.length
            : null;
        const demoClaps = demoFeedback.reduce((sum, f) => sum + f.claps, 0);
        const demoTellMeMore = demoFeedback.filter((f) => f.tellMeMore).length;

        const demoQuickActions: Record<string, number> = {};
        demoFeedback.forEach((f) => {
          f.quickActions.forEach((action) => {
            demoQuickActions[action] = (demoQuickActions[action] ?? 0) + 1;
          });
        });

        const comments = demoFeedback
          .filter((f) => f.comment?.trim())
          .map((f) => ({
            text: f.comment!,
            attendeeName: f.attendee?.name ?? undefined,
          }));

        const awardsWon = demo.awards.map((a) => ({ name: a.name }));

        return {
          id: demo.id,
          name: demo.name,
          email: demo.email,
          digestSentAt: demo.digestSentAt,
          stats: {
            averageRating: demoAvgRating,
            totalClaps: demoClaps,
            feedbackCount: demoFeedback.length,
            tellMeMoreCount: demoTellMeMore,
            quickActionCounts: demoQuickActions,
          },
          comments,
          awardsWon,
        };
      });

      // Sort demos by average rating (highest first)
      const rankedDemos = [...demoAnalytics].sort((a, b) => {
        if (a.stats.averageRating === null) return 1;
        if (b.stats.averageRating === null) return -1;
        return b.stats.averageRating - a.stats.averageRating;
      });

      return {
        eventId,
        eventName: event.name,
        eventDate: event.date,
        overview: {
          totalAttendees,
          totalFeedback,
          engagementRate,
          averageRating,
          totalClaps,
          totalTellMeMore,
        },
        quickActionBreakdown: quickActionCounts,
        demoAnalytics,
        rankedDemos: rankedDemos.slice(0, 10),
        awards: event.awards.map((a) => ({
          id: a.id,
          name: a.name,
          winnerId: a.winnerId,
          winnerName: a.winner?.name ?? null,
        })),
      };
    }),
  // Send post-event digest emails to demoists
  sendDigestEmails: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        demoIds: z.array(z.string()).optional(), // If not provided, send to all demos with emails
      }),
    )
    .mutation(async ({ input }) => {
      const { eventId, demoIds } = input;

      const event = await db.event.findUnique({
        where: { id: eventId },
        include: {
          demos: {
            where: demoIds ? { id: { in: demoIds } } : undefined,
            include: {
              feedback: {
                include: {
                  attendee: { select: { name: true } },
                },
              },
              awards: true,
            },
          },
        },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      const results: { demoId: string; success: boolean; error?: string }[] = [];

      for (const demo of event.demos) {
        if (!demo.email) {
          results.push({
            demoId: demo.id,
            success: false,
            error: "No email address for demo",
          });
          continue;
        }

        // Calculate stats
        const demoFeedback = demo.feedback;
        const demoRatings = demoFeedback
          .filter((f) => f.rating !== null)
          .map((f) => f.rating!);
        const demoAvgRating =
          demoRatings.length > 0
            ? demoRatings.reduce((sum, r) => sum + r, 0) / demoRatings.length
            : null;
        const demoClaps = demoFeedback.reduce((sum, f) => sum + f.claps, 0);
        const demoTellMeMore = demoFeedback.filter((f) => f.tellMeMore).length;

        const demoQuickActions: Record<string, number> = {};
        demoFeedback.forEach((f) => {
          f.quickActions.forEach((action) => {
            demoQuickActions[action] = (demoQuickActions[action] ?? 0) + 1;
          });
        });

        const comments = demoFeedback
          .filter((f) => f.comment?.trim())
          .map((f) => ({
            text: f.comment!,
            attendeeName: f.attendee?.name ?? undefined,
          }));

        const awardsWon = demo.awards.map((a) => ({ name: a.name }));

        // Extract POC name from email (fallback to demo name)
        const pocName = demo.email.split("@")[0] ?? demo.name;

        const result = await sendPostEventDigestEmail({
          eventName: event.name,
          demoName: demo.name,
          pocName,
          email: demo.email,
          stats: {
            averageRating: demoAvgRating,
            totalClaps: demoClaps,
            feedbackCount: demoFeedback.length,
            tellMeMoreCount: demoTellMeMore,
            quickActionCounts: demoQuickActions,
          },
          comments,
          awardsWon,
        });

        if (result.success) {
          // Update digestSentAt timestamp
          await db.demo.update({
            where: { id: demo.id },
            data: { digestSentAt: new Date() },
          });
        }

        results.push({
          demoId: demo.id,
          success: result.success,
          error: result.error ? String(result.error) : undefined,
        });
      }

      const successCount = results.filter((r) => r.success).length;
      return {
        totalSent: successCount,
        totalFailed: results.length - successCount,
        results,
      };
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
  chapters: {
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
  eventFeedback: true,
};