"use client";

import { MatchModeTab } from "../[eventId]/components/MatchMode/MatchModeTab";

// Test page to view Match Mode UI
// Visit: http://localhost:3000/admin/test-match
export default function TestMatchPage() {
  // Replace with an actual eventId from your database
  const eventId = "sf-demo"; // TODO: Get from your DB or URL

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Match Mode Test Page</h1>
      <p className="mb-4 text-sm text-gray-600">
        Note: Replace 'test-event-id' with a real event ID from your database
      </p>
      <MatchModeTab eventId={eventId} />
    </div>
  );
}
