import type { Submission, Event } from "@prisma/client";

/**
 * Email template for submission confirmation
 * Pure function - no server dependencies
 */
export function getSubmissionConfirmationTemplate({
  submission,
  event,
}: {
  submission: Submission;
  event: Event;
}): string {
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
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
  <title>Demo Submission Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Demo Submission Received! 🚀</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${submission.pocName},</p>
    
    <p style="font-size: 16px;">Thank you for submitting <strong>${submission.name}</strong> to <strong>${event.name}</strong>!</p>
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Submission Details</h2>
      <p style="margin: 8px 0;"><strong>Demo Name:</strong> ${submission.name}</p>
      <p style="margin: 8px 0;"><strong>Tagline:</strong> ${submission.tagline}</p>
      <p style="margin: 8px 0;"><strong>Event:</strong> ${event.name}</p>
      <p style="margin: 8px 0;"><strong>Event Date:</strong> ${eventDate}</p>
      ${submission.url ? `<p style="margin: 8px 0;"><strong>URL:</strong> <a href="${submission.url}" style="color: #667eea;">${submission.url}</a></p>` : ""}
    </div>
    
    <p style="font-size: 16px;">Our team will review your submission and get back to you soon. You'll receive an email notification once your submission has been reviewed.</p>
    
    <p style="font-size: 16px;">If you have any questions, please don't hesitate to reach out.</p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      Best regards,<br>
      <strong>The AI Collective Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template for status updates (CONFIRMED or REJECTED)
 * Pure function - no server dependencies
 */
export function getStatusUpdateTemplate({
  submission,
  event,
  status,
}: {
  submission: Submission;
  event: Event;
  status: "CONFIRMED" | "REJECTED";
}): string {
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
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
  <title>${isConfirmed ? "Demo Accepted" : "Demo Submission Update"}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${isConfirmed ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">
      ${isConfirmed ? "🎉 Your Demo Has Been Accepted!" : "Update on Your Demo Submission"}
    </h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${submission.pocName},</p>
    
    ${isConfirmed ? `
      <p style="font-size: 16px;">Great news! Your demo submission <strong>${submission.name}</strong> has been accepted for <strong>${event.name}</strong>!</p>
      
      <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
        <h2 style="margin-top: 0; color: #10b981; font-size: 20px;">Next Steps</h2>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Mark your calendar for <strong>${eventDate}</strong></li>
          <li style="margin: 8px 0;">Prepare your demo presentation</li>
          <li style="margin: 8px 0;">Review the event details and logistics</li>
          ${event.url ? `<li style="margin: 8px 0;">Check the event page: <a href="${event.url}" style="color: #10b981;">${event.url}</a></li>` : ""}
        </ul>
      </div>
      
      <p style="font-size: 16px;">We're excited to have you showcase <strong>${submission.name}</strong> at our event. If you have any questions or need assistance preparing, please don't hesitate to reach out.</p>
    ` : `
      <p style="font-size: 16px;">Thank you for your interest in submitting <strong>${submission.name}</strong> to <strong>${event.name}</strong>.</p>
      
      <p style="font-size: 16px;">After careful review, we're unable to include your demo in this event. We received many excellent submissions and had to make difficult decisions.</p>
      
      <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6b7280;">
        <h2 style="margin-top: 0; color: #6b7280; font-size: 20px;">What's Next?</h2>
        <p style="margin: 8px 0;">We encourage you to:</p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Submit to future AI Collective events</li>
          <li style="margin: 8px 0;">Continue building and refining your demo</li>
          <li style="margin: 8px 0;">Stay connected with our community</li>
        </ul>
      </div>
      
      <p style="font-size: 16px;">We appreciate your interest and hope to see you at future events!</p>
    `}
    
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Submission Details</h2>
      <p style="margin: 8px 0;"><strong>Demo Name:</strong> ${submission.name}</p>
      <p style="margin: 8px 0;"><strong>Tagline:</strong> ${submission.tagline}</p>
      <p style="margin: 8px 0;"><strong>Event:</strong> ${event.name}</p>
      <p style="margin: 8px 0;"><strong>Event Date:</strong> ${eventDate}</p>
      ${submission.url ? `<p style="margin: 8px 0;"><strong>URL:</strong> <a href="${submission.url}" style="color: #667eea;">${submission.url}</a></p>` : ""}
    </div>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      Best regards,<br>
      <strong>The AI Collective Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
  `.trim();
}

