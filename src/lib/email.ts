import { Resend } from "resend";
import { env } from "~/env";
import type { Submission, Event } from "@prisma/client";
import {
  getSubmissionConfirmationTemplate,
  getStatusUpdateTemplate,
} from "./email-templates";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Email configuration
// For development/testing, use Resend's testing domain: onboarding@resend.dev
// For production, use your verified domain: noreply@aicollective.com
const FROM_EMAIL =
  env.NODE_ENV === "development"
    ? "onboarding@resend.dev"
    : "noreply@aicollective.com";
const FROM_NAME = "AI Collective";

/**
 * Send submission confirmation email
 */
export async function sendSubmissionConfirmationEmail({
  submission,
  event,
}: {
  submission: Submission;
  event: Event;
}) {
  if (!resend) {
    console.warn(
      "[EMAIL] Resend API key not configured. Add RESEND_API_KEY to your .env file to enable email notifications.",
    );
    return;
  }

  try {
    const subject = `Demo Submission Received - ${submission.name}`;
    const html = getSubmissionConfirmationTemplate({
      submission,
      event,
    });

    console.log(
      `[EMAIL] 📧 Attempting to send confirmation email to ${submission.email} from ${FROM_EMAIL}...`,
    );

    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: submission.email,
      subject,
      html,
    });

    if (result.error) {
      console.error(
        `[EMAIL] ❌ Resend API error for ${submission.email}:`,
        result.error,
      );
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
    }

    if (!result.data?.id) {
      console.error(
        `[EMAIL] ❌ No email ID returned from Resend for ${submission.email}`,
      );
      throw new Error("No email ID returned from Resend");
    }

    console.log(
      `[EMAIL] ✅ Confirmation email queued for delivery to ${submission.email} for submission "${submission.name}"`,
    );
    console.log(`[EMAIL] 📬 Email ID: ${result.data.id}`);
    console.log(
      `[EMAIL] 🔍 View email status: https://resend.com/emails/${result.data.id}`,
    );
    console.log(
      `[EMAIL] 💡 TIP: Check spam folder and Resend dashboard for delivery status`,
    );
  } catch (error: any) {
    console.error(
      "[EMAIL] ❌ Failed to send submission confirmation email:",
      error?.message || error,
    );
    if (error?.response) {
      console.error("[EMAIL] Resend API response:", error.response);
    }
    // Don't throw - email failures shouldn't break the submission flow
  }
}

/**
 * Send status update email when submission is confirmed or rejected
 */
export async function sendStatusUpdateEmail({
  submission,
  event,
  previousStatus,
}: {
  submission: Submission;
  event: Event;
  previousStatus: string;
}) {
  if (!resend) {
    console.warn(
      "[EMAIL] Resend API key not configured. Add RESEND_API_KEY to your .env file to enable email notifications.",
    );
    return;
  }

  // Only send emails for CONFIRMED or REJECTED status changes
  if (
    submission.status !== "CONFIRMED" &&
    submission.status !== "REJECTED"
  ) {
    return;
  }

  // Don't send if status hasn't actually changed
  if (previousStatus === submission.status) {
    return;
  }

  try {
    const subject =
      submission.status === "CONFIRMED"
        ? `🎉 Your Demo Has Been Accepted - ${event.name}`
        : `Update on Your Demo Submission - ${event.name}`;

    const html = getStatusUpdateTemplate({
      submission,
      event,
      status: submission.status,
    });

    console.log(
      `[EMAIL] 📧 Attempting to send status update email to ${submission.email} (${submission.status}) from ${FROM_EMAIL}...`,
    );

    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: submission.email,
      subject,
      html,
    });

    if (result.error) {
      console.error(
        `[EMAIL] ❌ Resend API error for ${submission.email}:`,
        result.error,
      );
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
    }

    if (!result.data?.id) {
      console.error(
        `[EMAIL] ❌ No email ID returned from Resend for ${submission.email}`,
      );
      throw new Error("No email ID returned from Resend");
    }

    console.log(
      `[EMAIL] ✅ Status update email queued for delivery to ${submission.email} (${submission.status}) for submission "${submission.name}"`,
    );
    console.log(`[EMAIL] 📬 Email ID: ${result.data.id}`);
    console.log(
      `[EMAIL] 🔍 View email status: https://resend.com/emails/${result.data.id}`,
    );
    console.log(
      `[EMAIL] 💡 TIP: Check spam folder and Resend dashboard for delivery status`,
    );
  } catch (error: any) {
    console.error(
      "[EMAIL] ❌ Failed to send status update email:",
      error?.message || error,
    );
    if (error?.response) {
      console.error("[EMAIL] Resend API response:", error.response);
    }
    // Don't throw - email failures shouldn't break the update flow
  }
}


