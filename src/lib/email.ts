import { Resend } from "resend";
import { render } from "@react-email/render";
import { env } from "~/env";

import { SubmissionConfirmationEmail } from "~/emails/SubmissionConfirmationEmail";
import { SubmissionStatusUpdateEmail } from "~/emails/SubmissionStatusUpdateEmail";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface SubmissionEmailData {
  submissionName: string;
  submissionTagline: string;
  submitterEmail: string;
  submitterName: string;
  eventName: string;
  eventDate: Date;
  eventUrl: string;
}

export interface SubmissionStatusUpdateData extends SubmissionEmailData {
  status: "CONFIRMED" | "REJECTED";
  adminComment?: string | null;
}

/**
 * Sends a confirmation email when a submission is created
 */
export async function sendSubmissionConfirmationEmail(
  data: SubmissionEmailData,
): Promise<void> {
  if (!resend) {
    console.warn("⚠️  Resend API key not configured. Email not sent.");
    return;
  }

  try {
    const html = await render(SubmissionConfirmationEmail(data));

    await resend.emails.send({
      from: "Demo Night <noreply@aicollective.com>",
      to: data.submitterEmail,
      subject: `Submission Received: ${data.submissionName}`,
      html,
    });

    console.log(`✅ Confirmation email sent to ${data.submitterEmail}`);
  } catch (error) {
    console.error("❌ Failed to send submission confirmation email:", error);
    // Don't throw - we don't want email failures to break submission creation
  }
}

/**
 * Sends an email when submission status changes to CONFIRMED or REJECTED
 */
export async function sendSubmissionStatusUpdateEmail(
  data: SubmissionStatusUpdateData,
): Promise<void> {
  if (!resend) {
    console.warn("⚠️  Resend API key not configured. Email not sent.");
    return;
  }

  try {
    const html = await render(SubmissionStatusUpdateEmail(data));

    const subject =
      data.status === "CONFIRMED"
        ? `🎉 Your Demo Has Been Confirmed: ${data.submissionName}`
        : `Update on Your Demo Submission: ${data.submissionName}`;

    await resend.emails.send({
      from: "Demo Night <noreply@aicollective.com>",
      to: data.submitterEmail,
      subject,
      html,
    });

    console.log(
      `✅ Status update email sent to ${data.submitterEmail} (${data.status})`,
    );
  } catch (error) {
    console.error("❌ Failed to send submission status update email:", error);
    // Don't throw - we don't want email failures to break status updates
  }
}

