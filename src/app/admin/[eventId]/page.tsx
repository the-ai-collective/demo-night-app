import { redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";

import { api } from "~/trpc/server";

import { ClientEventDashboard } from "./ClientEventDashboard";

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
    return true;
  }
  // Check for wrapped tRPC errors
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: string }).code === "UNAUTHORIZED";
  }
  // Check error message as fallback
  if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
    return true;
  }
  return false;
}

export default async function AdminEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  let event;
  let currentEvent;

  try {
    [event, currentEvent] = await Promise.all([
      api.event.getAdmin(params.eventId),
      api.event.getCurrent(),
    ]);
  } catch (error) {
    console.error("[AdminEventPage] Error loading event:", error);
    if (isUnauthorizedError(error)) {
      redirect("/api/auth/signin?callbackUrl=/admin/" + params.eventId);
    }
    throw error;
  }

  if (!event) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen w-full">
      <ClientEventDashboard event={event} currentEvent={currentEvent} />
    </main>
  );
}
