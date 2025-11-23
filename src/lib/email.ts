import { Resend } from "resend";
import { env } from "~/env";
import { render } from "@react-email/render";
import SubmissionConfirmationEmail from "~/emails/SubmissionConfirmation";
import SubmissionStatusUpdateEmail from "~/emails/SubmissionStatusUpdate";

const resend = new Resend(env.RESEND_API_KEY);

interface SendSubmissionConfirmationEmailParams {
  to: string;
  submitterName: string;
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
}

interface SendSubmissionStatusUpdateEmailParams {
  to: string;
  submitterName: string;
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
  status: "CONFIRMED" | "REJECTED";
}

/**
 * Send a confirmation email when a demo submission is created
 */
export async function sendSubmissionConfirmationEmail({
  to,
  submitterName,
  demoName,
  eventName,
  eventDate,
  eventUrl,
}: SendSubmissionConfirmationEmailParams) {
  try {
    const emailHtml = await render(
      SubmissionConfirmationEmail({
        submitterName,
        demoName,
        eventName,
        eventDate,
        eventUrl,
      }),
    );

    const { data, error } = await resend.emails.send({
      from: `Demo Night <${env.RESEND_EMAIL_FROM}>`,
      to: [to],
      subject: `Demo Submission Received - ${eventName}`,
      html: emailHtml,
    });

    if (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return data;
  } catch (_) {
    return null;
  }
}

/**
 * Send a status update email when a submission is confirmed or rejected
 */
export async function sendSubmissionStatusUpdateEmail({
  to,
  submitterName,
  demoName,
  eventName,
  eventDate,
  eventUrl,
  status,
}: SendSubmissionStatusUpdateEmailParams) {
  try {
    const emailHtml = await render(
      SubmissionStatusUpdateEmail({
        submitterName,
        demoName,
        eventName,
        eventDate,
        eventUrl,
        status,
      }),
    );

    const isConfirmed = status === "CONFIRMED";
    const subject = isConfirmed
      ? `Demo Confirmed! - ${eventName}`
      : `Demo Submission Update - ${eventName}`;

    const { data, error } = await resend.emails.send({
      from: `Demo Night <${env.RESEND_EMAIL_FROM}>`,
      to: [to],
      subject,
      html: emailHtml,
    });

    if (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return data;
  } catch (_) {
    return null;
  }
}
