import { z } from "zod";
import { Prisma } from "@prisma/client";

import {
  createTRPCRouter,
  eventTokenProcedure,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  sendSubmissionConfirmation,
  sendSubmissionApproved,
  sendSubmissionRejected,
} from "~/lib/email";
import { emailRateLimiter, getClientIdentifier } from "~/lib/rate-limit";
import { sanitizeName, sanitizeEmailText, sanitizeEmail, sanitizeURL } from "~/lib/sanitize";

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
    .mutation(async ({ input, ctx }) => {
      try {
        // Sanitize all inputs before storing
        const sanitizedData = {
          eventId: input.eventId,
          name: sanitizeName(input.name),
          tagline: sanitizeEmailText(input.tagline, 200),
          description: sanitizeEmailText(input.description, 1000),
          email: sanitizeEmail(input.email),
          url: sanitizeURL(input.url),
          pocName: sanitizeName(input.pocName),
          demoUrl: input.demoUrl ? sanitizeURL(input.demoUrl) : undefined,
        };

        const result = await db.submission.create({
          data: sanitizedData,
        });

        // Get event details for the email
        const event = await db.event.findUnique({
          where: { id: input.eventId },
          select: { name: true },
        });

        // Send confirmation email (don't block on email sending)
        if (event) {
          // Check email rate limit before sending
          const identifier = getClientIdentifier(ctx.headers);
          const { success } = await emailRateLimiter.limit(identifier);

          if (success) {
            sendSubmissionConfirmation({
              to: input.email,
              demoTitle: input.name,
              eventName: event.name,
              submitterName: input.pocName,
            }).catch((error) => {
              console.error("[Submission] Failed to send confirmation email:", error);
              // TODO: Add to monitoring/alerting system (e.g., Sentry, DataDog)
              // TODO: Consider implementing a retry queue for failed emails
              // Don't throw - we don't want to fail the submission if email fails
            });
          } else {
            console.warn("[Submission] Email rate limit exceeded for:", identifier);
          }
        }

        return result;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new Error("A submission with this email already exists.");
          }
        }
        throw new Error("Failed to create submission.");
      }
    }),
  count: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      return db.submission.count({ where: { eventId: input.eventId } });
    }),
  all: eventTokenProcedure
    .input(
      z.object({
        eventId: z.string(),
        token: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Verify the token's eventId matches the requested eventId
      if (ctx.tokenPayload.id !== input.eventId) {
        throw new Error("Token does not grant access to this event");
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

      // Get current submission to check status change
      const currentSubmission = await db.submission.findUnique({
        where: { id },
        include: { event: { select: { name: true, url: true, date: true } } },
      });

      const result = await db.submission.update({
        where: { id },
        data,
      });

      // Send status update emails if status changed to CONFIRMED or REJECTED
      if (currentSubmission && input.status && input.status !== currentSubmission.status) {
        const emailData = {
          to: currentSubmission.email,
          demoTitle: currentSubmission.name,
          eventName: currentSubmission.event.name,
          submitterName: currentSubmission.pocName,
        };

        if (input.status === "CONFIRMED") {
          sendSubmissionApproved({
            ...emailData,
            eventUrl: currentSubmission.event.url,
            eventDate: currentSubmission.event.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          }).catch((error) => {
            console.error("[Submission] Failed to send approval email:", error);
            // TODO: Add to monitoring/alerting system (e.g., Sentry, DataDog)
            // TODO: Consider implementing a retry queue for failed emails
          });
        } else if (input.status === "REJECTED") {
          sendSubmissionRejected(emailData).catch((error) => {
            console.error("[Submission] Failed to send rejection email:", error);
            // TODO: Add to monitoring/alerting system (e.g., Sentry, DataDog)
            // TODO: Consider implementing a retry queue for failed emails
          });
        }
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
      return db.submission.update({
        where: { id: input.id },
        data: {
          status: input.status,
          flagged: input.flagged,
          rating: input.rating,
          comment: input.comment,
        },
      });
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
