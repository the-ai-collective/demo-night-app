import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  sendSubmissionConfirmationEmail,
  sendSubmissionStatusUpdateEmail,
} from "~/lib/email";

const submissionStatus = z.enum([
  "PENDING",
  "WAITLISTED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "CANCELLED",
  "REJECTED",
]);

export const submissionRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        name: z.string(),
        tagline: z.string(),
        description: z.string(),
        email: z.string().email(),
        url: z.string().url(),
        pocName: z.string(),
        demoUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.submission.create({
          data: input,
        });

        // Fetch event details for email
        const event = await db.event.findUnique({
          where: { id: input.eventId },
        });

        // Send confirmation email
        if (event) {
          await sendSubmissionConfirmationEmail({
            to: input.email,
            submitterName: input.pocName,
            demoName: input.name,
            eventName: event.name,
            eventDate: new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            eventUrl: event.url,
          });
        }

        return result;
      } catch (error: any) {
        if (error.code === "P2002") {
          throw new Error("A submission with this email already exists.");
        }
        throw new Error("Failed to create submission.");
      }
    }),
  count: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      return db.submission.count({ where: { eventId: input.eventId } });
    }),
  all: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        secret: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const event = await db.event.findUnique({
        where: { id: input.eventId },
      });
      if (event?.secret !== input.secret) {
        throw new Error("Unauthorized");
      }
      return db.submission.findMany({
        where: { eventId: input.eventId },
      });
    }),
  adminUpdate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        tagline: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email().optional(),
        url: z.string().url().optional(),
        pocName: z.string().optional(),
        demoUrl: z.string().nullable().optional(),
        status: submissionStatus.optional(),
        flagged: z.boolean().optional(),
        rating: z.number().nullable().optional(),
        comment: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // Get the current submission before update to check status change
      const currentSubmission = await db.submission.findUnique({
        where: { id },
        include: { event: true },
      });

      const result = await db.submission.update({
        where: { id },
        data,
      });

      // Send email if status changed to CONFIRMED or REJECTED
      if (
        currentSubmission &&
        data.status &&
        data.status !== currentSubmission.status &&
        (data.status === "CONFIRMED" || data.status === "REJECTED")
      ) {
        await sendSubmissionStatusUpdateEmail({
          to: result.email,
          submitterName: result.pocName,
          demoName: result.name,
          eventName: currentSubmission.event.name,
          eventDate: new Date(currentSubmission.event.date).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          ),
          eventUrl: currentSubmission.event.url,
          status: data.status,
        });
      }

      return result;
    }),
  convertToDemo: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const submission = await db.submission.findUnique({
        where: { id: input },
      });
      if (!submission) {
        throw new Error("Submission not found");
      }
      const index = await db.demo.count({
        where: { eventId: submission.eventId },
      });
      const demo = await db.demo.create({
        data: {
          eventId: submission.eventId,
          index,
          name: submission.name,
          description: submission.tagline,
          email: submission.email,
          url: submission.url,
        },
      });
      return demo;
    }),
  update: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        secret: z.string(),
        id: z.string(),
        status: submissionStatus.optional(),
        flagged: z.boolean().optional(),
        rating: z.number().nullable().optional(),
        comment: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const event = await db.event.findUnique({
        where: { id: input.eventId },
      });
      if (event?.secret !== input.secret) {
        throw new Error("Unauthorized");
      }

      // Get the current submission before update to check status change
      const currentSubmission = await db.submission.findUnique({
        where: { id: input.id },
      });

      const result = await db.submission.update({
        where: { id: input.id },
        data: {
          status: input.status,
          flagged: input.flagged,
          rating: input.rating,
          comment: input.comment,
        },
      });

      // Send email if status changed to CONFIRMED or REJECTED
      if (
        currentSubmission &&
        input.status &&
        input.status !== currentSubmission.status &&
        (input.status === "CONFIRMED" || input.status === "REJECTED")
      ) {
        await sendSubmissionStatusUpdateEmail({
          to: result.email,
          submitterName: result.pocName,
          demoName: result.name,
          eventName: event.name,
          eventDate: new Date(event.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          eventUrl: event.url,
          status: input.status,
        });
      }

      return result;
    }),
  setSubmissions: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        submissions: z.array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            tagline: z.string(),
            description: z.string(),
            email: z.string().email(),
            url: z.string().url(),
            pocName: z.string(),
            demoUrl: z.string().nullable(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return db.$transaction(async (prisma) => {
        await prisma.submission.deleteMany({
          where: { eventId: input.eventId },
        });
        await prisma.submission.createMany({
          data: input.submissions.map((submission) => ({
            ...submission,
            eventId: input.eventId,
          })),
        });
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.submission.delete({
      where: { id: input },
    });
  }),
});
