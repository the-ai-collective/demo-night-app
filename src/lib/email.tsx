"use server";

import { Resend } from "resend";
import { render } from "@react-email/render";
import { env } from "~/env";
import { sanitizeEmailText, sanitizeEmail, sanitizeURL, sanitizeName } from "~/lib/sanitize";

// Initialize Resend only if API key is available
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface SendSubmissionConfirmationParams {
  to: string;
  demoTitle: string;
  eventName: string;
  submitterName: string;
}

export interface SendSubmissionStatusParams {
  to: string;
  demoTitle: string;
  eventName: string;
  submitterName: string;
  eventUrl: string;
  eventDate: string;
}

/**
 * Send a submission confirmation email
 */
export async function sendSubmissionConfirmation({
  to,
  demoTitle,
  eventName,
  submitterName,
}: SendSubmissionConfirmationParams) {
  if (!resend) {
    console.warn("[Email] Resend not configured - skipping confirmation email");
    return null;
  }

  try {
    // Sanitize all inputs
    const sanitizedTo = sanitizeEmail(to);
    const sanitizedDemoTitle = sanitizeName(demoTitle);
    const sanitizedEventName = sanitizeName(eventName);
    const sanitizedSubmitterName = sanitizeName(submitterName);

    const { default: SubmissionConfirmationEmail } = await import("~/emails/SubmissionConfirmation");
    const emailHtml = await render(
      <SubmissionConfirmationEmail
        demoTitle={sanitizedDemoTitle}
        eventName={sanitizedEventName}
        submitterName={sanitizedSubmitterName}
      />,
    );

    const { data, error } = await resend.emails.send({
      from: "Demo Night <onboarding@resend.dev>",
      to: sanitizedTo,
      subject: `Demo Submission Received - ${sanitizedEventName}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Email] Failed to send submission confirmation:", error);
      return null;
    }

    console.log("[Email] Submission confirmation sent:", data?.id);
    return data;
  } catch (error) {
    console.error("[Email] Error sending submission confirmation:", error);
    return null;
  }
}

/**
 * Send a submission approved email
 */
export async function sendSubmissionApproved({
  to,
  demoTitle,
  eventName,
  submitterName,
  eventUrl,
  eventDate,
}: SendSubmissionStatusParams) {
  if (!resend) {
    console.warn("[Email] Resend not configured - skipping approval email");
    return null;
  }

  try {
    // Sanitize all inputs
    const sanitizedTo = sanitizeEmail(to);
    const sanitizedDemoTitle = sanitizeName(demoTitle);
    const sanitizedEventName = sanitizeName(eventName);
    const sanitizedSubmitterName = sanitizeName(submitterName);
    const sanitizedEventUrl = sanitizeURL(eventUrl);
    const sanitizedEventDate = sanitizeEmailText(eventDate, 100);

    const { default: SubmissionApprovedEmail } = await import("~/emails/SubmissionApproved");
    const emailHtml = await render(
      <SubmissionApprovedEmail
        demoTitle={sanitizedDemoTitle}
        eventName={sanitizedEventName}
        submitterName={sanitizedSubmitterName}
        eventUrl={sanitizedEventUrl}
        eventDate={sanitizedEventDate}
      />,
    );

    const { data, error } = await resend.emails.send({
      from: "Demo Night <onboarding@resend.dev>",
      to: sanitizedTo,
      subject: `🎉 Demo Approved - ${sanitizedEventName}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Email] Failed to send approval notification:", error);
      return null;
    }

    console.log("[Email] Approval notification sent:", data?.id);
    return data;
  } catch (error) {
    console.error("[Email] Error sending approval notification:", error);
    return null;
  }
}

/**
 * Send a submission rejected email
 */
export async function sendSubmissionRejected({
  to,
  demoTitle,
  eventName,
  submitterName,
}: Omit<SendSubmissionConfirmationParams, "to"> & { to: string }) {
  if (!resend) {
    console.warn("[Email] Resend not configured - skipping rejection email");
    return null;
  }

  try {
    // Sanitize all inputs
    const sanitizedTo = sanitizeEmail(to);
    const sanitizedDemoTitle = sanitizeName(demoTitle);
    const sanitizedEventName = sanitizeName(eventName);
    const sanitizedSubmitterName = sanitizeName(submitterName);

    const { default: SubmissionRejectedEmail } = await import("~/emails/SubmissionRejected");
    const emailHtml = await render(
      <SubmissionRejectedEmail
        demoTitle={sanitizedDemoTitle}
        eventName={sanitizedEventName}
        submitterName={sanitizedSubmitterName}
      />,
    );

    const { data, error } = await resend.emails.send({
      from: "Demo Night <onboarding@resend.dev>",
      to: sanitizedTo,
      subject: `Demo Submission Update - ${sanitizedEventName}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Email] Failed to send rejection notification:", error);
      return null;
    }

    console.log("[Email] Rejection notification sent:", data?.id);
    return data;
  } catch (error) {
    console.error("[Email] Error sending rejection notification:", error);
    return null;
  }
}
