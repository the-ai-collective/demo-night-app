import { render } from "@react-email/render";
import { Resend } from "resend";

import { env } from "~/env";
import SubmissionApprovedEmail from "~/emails/SubmissionApproved";
import SubmissionConfirmationEmail from "~/emails/SubmissionConfirmation";
import SubmissionRejectedEmail from "~/emails/SubmissionRejected";

// Initialize Resend client
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Default sender email
const FROM_EMAIL = "Demo Night <onboarding@resend.dev>"; // Update this with your verified domain

interface SubmissionConfirmationData {
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
  pocName: string;
  email: string;
}

interface SubmissionStatusData {
  demoName: string;
  eventName: string;
  eventDate: string;
  eventUrl: string;
  pocName: string;
  email: string;
  status: "CONFIRMED" | "REJECTED";
}

/**
 * Send a confirmation email when a demo submission is created
 */
export async function sendSubmissionConfirmation(
  data: SubmissionConfirmationData,
) {
  if (!resend) {
    console.warn(
      "Resend API key not configured. Skipping email send. To enable emails, set RESEND_API_KEY in your environment.",
    );
    return { success: false, reason: "no_api_key" };
  }

  try {
    const emailHtml = await render(
      SubmissionConfirmationEmail({
        demoName: data.demoName,
        eventName: data.eventName,
        eventDate: data.eventDate,
        eventUrl: data.eventUrl,
        pocName: data.pocName,
      }),
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Demo Submission Received - ${data.eventName}`,
      html: emailHtml,
    });

    console.log(`✅ Confirmation email sent to ${data.email}`, result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send an email when a submission status changes to CONFIRMED or REJECTED
 */
export async function sendSubmissionStatusUpdate(data: SubmissionStatusData) {
  if (!resend) {
    console.warn(
      "Resend API key not configured. Skipping email send. To enable emails, set RESEND_API_KEY in your environment.",
    );
    return { success: false, reason: "no_api_key" };
  }

  try {
    let emailHtml: string;
    let subject: string;

    if (data.status === "CONFIRMED") {
      emailHtml = await render(
        SubmissionApprovedEmail({
          demoName: data.demoName,
          eventName: data.eventName,
          eventDate: data.eventDate,
          eventUrl: data.eventUrl,
          pocName: data.pocName,
        }),
      );
      subject = `🎉 Demo Confirmed - ${data.eventName}`;
    } else {
      emailHtml = await render(
        SubmissionRejectedEmail({
          demoName: data.demoName,
          eventName: data.eventName,
          eventUrl: data.eventUrl,
          pocName: data.pocName,
        }),
      );
      subject = `Demo Submission Update - ${data.eventName}`;
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html: emailHtml,
    });

    console.log(`✅ Status update email sent to ${data.email}`, result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Failed to send status update email:", error);
    return { success: false, error };
  }
}


