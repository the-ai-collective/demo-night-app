import { z } from "zod";

import {
  sendStatusUpdateEmail,
  sendSubmissionConfirmationEmail,
} from "~/lib/email";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

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
        const event = await db.event.findUnique({
          where: { id: input.eventId },
          select: { name: true },
        });

        const result = await db.submission.create({
          data: input,
        });

        // Send confirmation email
        console.log("Attempting to send confirmation email to:", input.email);
        const emailResult = await sendSubmissionConfirmationEmail({
          eventName: event?.name ?? "Demo Night",
          demoName: input.name,
          pocName: input.pocName,
          email: input.email,
        });
        console.log("Email result:", emailResult);

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

      // Get current submission to check for status change
      const currentSubmission = await db.submission.findUnique({
        where: { id },
        include: { event: { select: { name: true } } },
      });

      const result = await db.submission.update({
        where: { id },
        data,
      });

      // Send email if status changed to CONFIRMED or REJECTED
      if (
        input.status &&
        (input.status === "CONFIRMED" || input.status === "REJECTED") &&
        currentSubmission?.status !== input.status
      ) {
        sendStatusUpdateEmail({
          eventName: currentSubmission?.event.name ?? "Demo Night",
          demoName: currentSubmission?.name ?? result.name,
          pocName: currentSubmission?.pocName ?? result.pocName,
          email: currentSubmission?.email ?? result.email,
          status: input.status,
        }).catch((err) => {
          console.error("Failed to send status update email:", err);
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

      // Get current submission to check for status change
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
        input.status &&
        (input.status === "CONFIRMED" || input.status === "REJECTED") &&
        currentSubmission?.status !== input.status
      ) {
        sendStatusUpdateEmail({
          eventName: event?.name ?? "Demo Night",
          demoName: result.name,
          pocName: result.pocName,
          email: result.email,
          status: input.status,
        }).catch((err) => {
          console.error("Failed to send status update email:", err);
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
  sendTestEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const result = await sendSubmissionConfirmationEmail({
        eventName: "Test Event",
        demoName: "Test Demo",
        pocName: "Test User",
        email: input.email,
      });
      return result;
    }),
});
