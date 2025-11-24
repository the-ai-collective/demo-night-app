"use client";

import { useState } from "react";

// Import email rendering functions (we'll need to export them from email.ts)
// For now, we'll create a simple preview component

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<
    "confirmation" | "confirmed" | "rejected"
  >("confirmation");

  // Sample data
  const sampleSubmission = {
    name: "AI-Powered Code Assistant",
    email: "chappy@aicollective.com",
    tagline: "Revolutionizing developer productivity with AI",
  };

  const sampleEvent = {
    name: "Demo Night SF - November 2025",
    date: new Date("2025-11-24T19:00:00"),
    url: typeof window !== "undefined" 
      ? `${window.location.origin}/admin/sf-november-2025`
      : "/admin/sf-november-2025",
  };

  const renderEmailHTML = () => {
    if (selectedTemplate === "confirmation") {
      return renderSubmissionConfirmationEmail({
        submissionName: sampleSubmission.name,
        eventName: sampleEvent.name,
        eventDate: sampleEvent.date,
        eventUrl: sampleEvent.url,
        demoTagline: sampleSubmission.tagline,
      });
    } else if (selectedTemplate === "confirmed") {
      return renderSubmissionStatusUpdateEmail({
        submissionName: sampleSubmission.name,
        eventName: sampleEvent.name,
        eventDate: sampleEvent.date,
        eventUrl: sampleEvent.url,
        demoTagline: sampleSubmission.tagline,
        status: "CONFIRMED",
      });
    } else {
      return renderSubmissionStatusUpdateEmail({
        submissionName: sampleSubmission.name,
        eventName: sampleEvent.name,
        eventDate: sampleEvent.date,
        eventUrl: sampleEvent.url,
        demoTagline: sampleSubmission.tagline,
        status: "REJECTED",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Preview</h1>
          <p className="mt-2 text-sm text-gray-600">
            Preview email templates with sample data. This page is only
            available in development.
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setSelectedTemplate("confirmation")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedTemplate === "confirmation"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Submission Confirmation
          </button>
          <button
            onClick={() => setSelectedTemplate("confirmed")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedTemplate === "confirmed"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Status: Confirmed
          </button>
          <button
            onClick={() => setSelectedTemplate("rejected")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedTemplate === "rejected"
                ? "bg-gray-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Status: Rejected
          </button>
        </div>

        <div className="rounded-lg bg-white shadow-lg">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedTemplate === "confirmation" &&
                    "Submission Confirmation Email"}
                  {selectedTemplate === "confirmed" &&
                    "Status Update: Confirmed"}
                  {selectedTemplate === "rejected" && "Status Update: Rejected"}
                </h2>
                <p className="text-sm text-gray-500">
                  To: {sampleSubmission.email}
                </p>
              </div>
              <button
                onClick={() => {
                  const html = renderEmailHTML();
                  const blob = new Blob([html], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${selectedTemplate}-email.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Download HTML
              </button>
            </div>
          </div>
          <div className="p-8">
            <iframe
              srcDoc={renderEmailHTML()}
              className="h-[800px] w-full rounded border border-gray-200"
              title="Email Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Copy the email rendering functions here for client-side preview
// In a real app, you might want to create a shared utility or API route

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

function renderSubmissionStatusUpdateEmail({
  submissionName,
  eventName,
  eventDate,
  eventUrl,
  demoTagline: _demoTagline,
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
    
    ${
      isConfirmed
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
      `
    }
    
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
