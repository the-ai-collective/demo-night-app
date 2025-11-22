import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { sendEmail } from "~/lib/email";
import { SubmissionConfirmationEmail } from "~/emails/SubmissionConfirmation";
import { SubmissionStatusUpdateEmail } from "~/emails/SubmissionStatusUpdate";

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
          try {
            await sendEmail({
              to: input.email,
              subject: `Submission confirmed: ${input.name}`,
              react: SubmissionConfirmationEmail({
                companyName: input.name,
                submitterName: input.pocName,
                eventName: event.name,
                eventDate: event.date.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              }),
            });
            console.log("Confirmation email sent to:", input.email);
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Don't throw error - submission was created successfully
          }
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
      const { id, status, ...data } = input;

      // Fetch current submission and event for email
      const submission = await db.submission.findUnique({
        where: { id },
        include: { event: true },
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      // Update submission
      const updatedSubmission = await db.submission.update({
        where: { id },
        data: {
          ...data,
          ...(status && { status }),
        },
      });

      // NOTE: Email sending is now handled manually via sendStatusEmail mutation
      // This allows admins to review and confirm before sending

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
      });
      if (event?.secret !== input.secret) {
        throw new Error("Unauthorized");
      }

      // Fetch current submission for email
      const submission = await db.submission.findUnique({
        where: { id: input.id },
      });

      if (!submission) {
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
      });

      // NOTE: Email sending is now handled manually via sendStatusEmail mutation
      // This allows admins to review and confirm before sending

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
  sendStatusEmail: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        status: submissionStatus,
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const submission = await db.submission.findUnique({
        where: { id: input.submissionId },
        include: { event: true },
      });

      if (!submission) {
        throw new Error("Submission not found");
      }

      try {
        await sendEmail({
          to: submission.email,
          subject: `${input.status === "CONFIRMED" ? "Approved" : input.status === "AWAITING_CONFIRMATION" ? "Shortlisted" : "Status Update"}: ${submission.name}`,
          react: SubmissionStatusUpdateEmail({
            companyName: submission.name,
            submitterName: submission.pocName,
            eventName: submission.event.name,
            status: input.status as "CONFIRMED" | "REJECTED" | "WAITLISTED" | "AWAITING_CONFIRMATION" | "CANCELLED",
            message: input.message,
            eventDate: submission.event.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          }),
        });
        console.log(`Status email sent to: ${submission.email}`);
        return { success: true, message: "Email sent successfully" };
      } catch (emailError) {
        console.error("Failed to send status email:", emailError);
        throw new Error("Failed to send email. Please try again.");
      }
    }),
});

