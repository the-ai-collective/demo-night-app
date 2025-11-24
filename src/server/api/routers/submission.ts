import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  sendSubmissionConfirmationEmail,
  sendStatusUpdateEmail,
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
          include: {
            event: true,
          },
        });

        // Send confirmation email (non-blocking)
        sendSubmissionConfirmationEmail({
          submission: result,
          event: result.event,
        }).catch((error) => {
          console.error("Failed to send confirmation email:", error);
        });

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

      // Fetch previous submission to check status change
      const previousSubmission = await db.submission.findUnique({
        where: { id },
        include: { event: true },
      });

      if (!previousSubmission) {
        throw new Error("Submission not found");
      }

      const previousStatus = previousSubmission.status;

      const updated = await db.submission.update({
        where: { id },
        data,
        include: { event: true },
      });

      // Send status update email if status changed to CONFIRMED or REJECTED
      if (data.status && data.status !== previousStatus) {
        sendStatusUpdateEmail({
          submission: updated,
          event: updated.event,
          previousStatus,
        }).catch((error) => {
          console.error("Failed to send status update email:", error);
        });
      }

      return updated;
    }),
  convertToDemo: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const submission = await db.submission.findUnique({
        where: { id: input },
        include: { event: true },
      });
      if (!submission) {
        throw new Error("Submission not found");
      }

      const previousStatus = submission.status;

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

      // Update submission status to CONFIRMED and send email
      const updated = await db.submission.update({
        where: { id: input },
        data: { status: "CONFIRMED" },
        include: { event: true },
      });

      // Send status update email if status changed to CONFIRMED
      if (previousStatus !== "CONFIRMED") {
        sendStatusUpdateEmail({
          submission: updated,
          event: updated.event,
          previousStatus,
        }).catch((error) => {
          console.error("Failed to send status update email:", error);
        });
      }

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

      // Fetch previous submission to check status change
      const previousSubmission = await db.submission.findUnique({
        where: { id: input.id },
      });

      if (!previousSubmission) {
        throw new Error("Submission not found");
      }

      const previousStatus = previousSubmission.status;

      const updated = await db.submission.update({
        where: { id: input.id },
        data: {
          status: input.status,
          flagged: input.flagged,
          rating: input.rating,
          comment: input.comment,
        },
        include: { event: true },
      });

      // Send status update email if status changed to CONFIRMED or REJECTED
      if (input.status && input.status !== previousStatus && updated.event) {
        sendStatusUpdateEmail({
          submission: updated,
          event: updated.event,
          previousStatus,
        }).catch((error) => {
          console.error("Failed to send status update email:", error);
        });
      }

      return updated;
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
