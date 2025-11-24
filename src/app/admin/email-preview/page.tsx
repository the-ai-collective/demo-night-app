"use client";

import { useEffect, useState } from "react";
import {
  getSubmissionConfirmationTemplate,
  getStatusUpdateTemplate,
} from "~/lib/email-templates";
import type { Submission, Event } from "@prisma/client";

// Mock data for preview
const mockEvent: Event = {
  id: "preview-event",
  name: "SF Demo Night 🚀",
  date: new Date(Date.now() + 14 * 86_400_000),
  url: "https://lu.ma/demo-night",
  config: {},
  secret: "preview-secret",
  chapterId: null,
};

const mockSubmission: Submission = {
  id: "preview-submission",
  eventId: "preview-event",
  name: "Awesome AI Demo",
  tagline: "Revolutionizing the future with AI",
  description: "This is a demo that showcases amazing AI capabilities.",
  email: "demo@example.com",
  url: "https://example.com",
  pocName: "Jane Doe",
  demoUrl: "https://example.com/demo",
  status: "PENDING",
  flagged: false,
  rating: null,
  comment: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function EmailPreviewPage() {
  const [isDev, setIsDev] = useState(false);
  const [confirmationHtml, setConfirmationHtml] = useState<string>("");
  const [confirmedHtml, setConfirmedHtml] = useState<string>("");
  const [rejectedHtml, setRejectedHtml] = useState<string>("");

  useEffect(() => {
    // Check if we're in development
    const isDevelopment =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost";

    setIsDev(isDevelopment);

    if (isDevelopment) {
      try {
        setConfirmationHtml(
          getSubmissionConfirmationTemplate({
            submission: mockSubmission,
            event: mockEvent,
          }),
        );

        setConfirmedHtml(
          getStatusUpdateTemplate({
            submission: { ...mockSubmission, status: "CONFIRMED" },
            event: mockEvent,
            status: "CONFIRMED",
          }),
        );

        setRejectedHtml(
          getStatusUpdateTemplate({
            submission: { ...mockSubmission, status: "REJECTED" },
            event: mockEvent,
            status: "REJECTED",
          }),
        );
      } catch (error) {
        console.error("Error generating email templates:", error);
      }
    }
  }, []);

  if (!isDev) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Email preview is only available in development mode.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Email Preview</h1>
      <p className="mb-6 text-gray-600">
        Preview email templates used for demo submissions.
      </p>

      <div className="space-y-12">
        {/* Confirmation Email */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Submission Confirmation Email
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <iframe
              srcDoc={confirmationHtml}
              className="h-[800px] w-full rounded border"
              title="Confirmation Email Preview"
            />
          </div>
        </section>

        {/* Confirmed Status Email */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Status Update: Confirmed
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <iframe
              srcDoc={confirmedHtml}
              className="h-[800px] w-full rounded border"
              title="Confirmed Email Preview"
            />
          </div>
        </section>

        {/* Rejected Status Email */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Status Update: Rejected
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <iframe
              srcDoc={rejectedHtml}
              className="h-[800px] w-full rounded border"
              title="Rejected Email Preview"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

