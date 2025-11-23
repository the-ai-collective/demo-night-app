import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { sendEmailSafely } from "~/lib/email";
import { SubmissionConfirmationEmail } from "~/emails/submission-confirmation";
import { SubmissionStatusUpdateEmail } from "~/emails/submission-status-update";

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
            event: {
              select: {
                name: true,
                url: true,
              },
            },
          },
        });

        // Send confirmation email (non-blocking)
        sendEmailSafely({
          to: input.email,
          subject: `Submission Received: ${result.event.name}`,
          react: SubmissionConfirmationEmail({
            submitterName: input.pocName,
            demoTitle: input.name,
            eventName: result.event.name,
            submissionDate: new Date(),
          }),
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

      // Fetch current submission to check for status changes
      const currentSubmission = await db.submission.findUnique({
        where: { id },
        include: {
          event: {
            select: {
              name: true,
              url: true,
            },
          },
        },
      });

      if (!currentSubmission) {
        throw new Error("Submission not found");
      }

      const updatedSubmission = await db.submission.update({
        where: { id },
        data,
        include: {
          event: {
            select: {
              name: true,
              url: true,
            },
          },
        },
      });

      // Send status update email if status changed to CONFIRMED or REJECTED
      const statusChanged =
        data.status &&
        data.status !== currentSubmission.status &&
        (data.status === "CONFIRMED" || data.status === "REJECTED");

      if (statusChanged) {
        // Use non-blocking email sending to avoid delaying the response
        sendEmailSafely({
          to: updatedSubmission.email,
          subject: `Update on your submission: ${updatedSubmission.event.name}`,
          react: SubmissionStatusUpdateEmail({
            submitterName: updatedSubmission.pocName,
            demoTitle: updatedSubmission.name,
            eventName: updatedSubmission.event.name,
            status: data.status as "CONFIRMED" | "REJECTED",
            message: data.comment ?? undefined,
          }),
        }).catch((error) => {
          console.error("Failed to send status update email:", error);
        });
      }

      return updatedSubmission;
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
        select: {
          secret: true,
          name: true,
          url: true,
        },
      });
      if (event?.secret !== input.secret) {
        throw new Error("Unauthorized");
      }

      // Fetch current submission to check for status changes
      const currentSubmission = await db.submission.findUnique({
        where: { id: input.id },
        select: {
          status: true,
          email: true,
          pocName: true,
          name: true,
        },
      });

      if (!currentSubmission) {
        throw new Error("Submission not found");
      }

      const updatedSubmission = await db.submission.update({
        where: { id: input.id },
        data: {
          status: input.status,
          flagged: input.flagged,
          rating: input.rating,
          comment: input.comment,
        },
        select: {
          status: true,
          email: true,
          pocName: true,
          name: true,
          comment: true,
        },
      });

      // Send status update email if status changed to CONFIRMED or REJECTED
      const statusChanged =
        input.status &&
        input.status !== currentSubmission.status &&
        (input.status === "CONFIRMED" || input.status === "REJECTED");

      if (statusChanged && event) {
        sendEmailSafely({
          to: updatedSubmission.email,
          subject: `Update on your submission: ${event.name}`,
          react: SubmissionStatusUpdateEmail({
            submitterName: updatedSubmission.pocName,
            demoTitle: updatedSubmission.name,
            eventName: event.name,
            status: input.status as "CONFIRMED" | "REJECTED",
            message: updatedSubmission.comment ?? undefined,
          }),
        }).catch((error) => {
          console.error("Failed to send status update email:", error);
        });
      }

      return updatedSubmission;
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
