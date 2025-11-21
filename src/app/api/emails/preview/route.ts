import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

import { SubmissionConfirmationEmail } from "~/emails/SubmissionConfirmationEmail";
import { SubmissionStatusUpdateEmail } from "~/emails/SubmissionStatusUpdateEmail";

export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get("template") || "confirmation";
  const status = searchParams.get("status") || "CONFIRMED";

  // Sample data for preview
  const sampleData = {
    submissionName: "AI-Powered Demo Tool",
    submissionTagline: "Revolutionizing the way teams collaborate",
    submitterEmail: "demo@example.com",
    submitterName: "Jane Doe",
    eventName: "AI Collective Demo Night - January 2025",
    eventDate: new Date("2025-02-15T19:00:00Z"),
    eventUrl: "https://aicollective.com/demo-night",
  };

  let html: string;

  if (template === "status-update") {
    html = await render(
      SubmissionStatusUpdateEmail({
        ...sampleData,
        status: status === "CONFIRMED" ? "CONFIRMED" : "REJECTED",
        adminComment:
          status === "CONFIRMED"
            ? "We're excited to have you present! Please arrive 15 minutes early for setup."
            : "Thank you for your interest. We encourage you to apply for future events.",
      }),
    );
  } else {
    html = await render(SubmissionConfirmationEmail(sampleData));
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

