import { Resend } from "resend";
import { env } from "~/env";

// Initialize Resend client
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Send an email using Resend
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content of the email
 * @returns Promise that resolves to the email ID or null if email is disabled
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<string | null> {
  // In development, if API key is missing, log and return null
  if (!resend) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️  Email sending disabled: RESEND_API_KEY not set. Email would be sent to:",
        to,
        "Subject:",
        subject,
      );
      console.log("Email HTML:", html);
    } else {
      // In production, throw error if API key is missing
      throw new Error("RESEND_API_KEY is required in production");
    }
    return null;
  }

  if (!env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is required");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Failed to send email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data?.id ?? null;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    // Don't throw - email failures shouldn't break the app
    // Just log the error
    throw error;
  }
}

/**
 * Send submission confirmation email
 */
export async function sendSubmissionConfirmationEmail({
  submission,
  event,
}: {
  submission: {
    name: string;
    email: string;
    tagline: string;
  };
  event: {
    name: string;
    date: Date;
    url: string;
  };
}): Promise<void> {
  const html = renderSubmissionConfirmationEmail({
    submissionName: submission.name,
    eventName: event.name,
    eventDate: event.date,
    eventUrl: event.url,
    demoTagline: submission.tagline,
  });

  try {
    await sendEmail({
      to: submission.email,
      subject: `Your ${event.name} submission has been received!`,
      html,
    });
  } catch (error) {
    // Log but don't throw - email failures shouldn't break submission creation
    console.error("Failed to send submission confirmation email:", error);
  }
}

/**
 * Send submission status update email (CONFIRMED or REJECTED)
 */
export async function sendSubmissionStatusUpdateEmail({
  submission,
  event,
  previousStatus,
  newStatus,
}: {
  submission: {
    name: string;
    email: string;
    tagline: string;
  };
  event: {
    name: string;
    date: Date;
    url: string;
  };
  previousStatus: string;
  newStatus: "CONFIRMED" | "REJECTED";
}): Promise<void> {
  // Only send emails for CONFIRMED or REJECTED status changes
  if (newStatus !== "CONFIRMED" && newStatus !== "REJECTED") {
    return;
  }

  // Don't send if status hasn't actually changed
  if (previousStatus === newStatus) {
    return;
  }

  const html = renderSubmissionStatusUpdateEmail({
    submissionName: submission.name,
    eventName: event.name,
    eventDate: event.date,
    eventUrl: event.url,
    demoTagline: submission.tagline,
    status: newStatus,
  });

  try {
    const subject =
      newStatus === "CONFIRMED"
        ? `🎉 Your ${event.name} submission has been confirmed!`
        : `Update on your ${event.name} submission`;

    await sendEmail({
      to: submission.email,
      subject,
      html,
    });
  } catch (error) {
    // Log but don't throw - email failures shouldn't break status updates
    console.error("Failed to send status update email:", error);
  }
}

/**
 * Render submission confirmation email HTML
 */
function renderSubmissionConfirmationEmail({
  submissionName,
  eventName,
  eventDate,
  eventUrl,
  demoTagline,
}: {
  submissionName: string;
  eventName: string;
  eventDate: Date;
  eventUrl: string;
  demoTagline: string;
}): string {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submission Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Submission Received!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi there,</p>
    
    <p style="font-size: 16px;">
      Thank you for submitting <strong>${escapeHtml(submissionName)}</strong> to ${escapeHtml(eventName)}!
    </p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Your Submission</p>
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${escapeHtml(demoTagline)}</p>
    </div>
    
    <p style="font-size: 16px;">
      We've received your submission and our team will review it shortly. You'll hear back from us soon!
    </p>
    
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>Event Details:</strong><br>
        📅 ${escapeHtml(formattedDate)}<br>
        🔗 <a href="${escapeHtml(eventUrl)}" style="color: #3b82f6; text-decoration: none;">View Event Page</a>
      </p>
    </div>
    
    <p style="font-size: 16px;">
      If you have any questions, feel free to reach out. We're excited to see what you've built!
    </p>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Best,<br>
      <strong>The AI Collective Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Render submission status update email HTML
 */
function renderSubmissionStatusUpdateEmail({
  submissionName,
  eventName,
  eventDate,
  eventUrl,
  demoTagline,
  status,
}: {
  submissionName: string;
  eventName: string;
  eventDate: Date;
  eventUrl: string;
  demoTagline: string;
  status: "CONFIRMED" | "REJECTED";
}): string {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isConfirmed = status === "CONFIRMED";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submission Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${isConfirmed ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">
      ${isConfirmed ? "🎉 You're In!" : "Update on Your Submission"}
    </h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi there,</p>
    
    ${isConfirmed
      ? `
    <p style="font-size: 16px;">
      Great news! Your submission <strong>${escapeHtml(submissionName)}</strong> has been <strong style="color: #059669;">confirmed</strong> for ${escapeHtml(eventName)}!
    </p>
    
    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 16px; color: #065f46;">
        <strong>🎊 Congratulations!</strong><br>
        We're excited to have you present at ${escapeHtml(eventName)}.
      </p>
    </div>
    
    <p style="font-size: 16px;">
      <strong>What's Next?</strong>
    </p>
    <ul style="font-size: 16px; padding-left: 20px;">
      <li>Mark your calendar for <strong>${escapeHtml(formattedDate)}</strong></li>
      <li>Prepare your demo/pitch (you'll have time to present)</li>
      <li>Join us at the event and share what you've built!</li>
    </ul>
      `
      : `
    <p style="font-size: 16px;">
      Thank you for your interest in ${escapeHtml(eventName)}. After careful review, we're unable to include <strong>${escapeHtml(submissionName)}</strong> in this event.
    </p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>💡 Keep Building!</strong><br>
        This decision was difficult given the number of excellent submissions we received. We encourage you to keep building and submit again for future events.
      </p>
    </div>
    
    <p style="font-size: 16px;">
      We appreciate you being part of our community and hope to see you at future AI Collective events!
    </p>
      `}
    
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>Event Details:</strong><br>
        📅 ${escapeHtml(formattedDate)}<br>
        🔗 <a href="${escapeHtml(eventUrl)}" style="color: #3b82f6; text-decoration: none;">View Event Page</a>
      </p>
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Best,<br>
      <strong>The AI Collective Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">This is an automated email. Please do not reply.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m] ?? m);
}

