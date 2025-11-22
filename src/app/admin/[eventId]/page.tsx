"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { api } from "~/trpc/react";

import { ClientEventDashboard } from "./ClientEventDashboard";

export default function AdminEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const router = useRouter();

  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = api.event.getAdmin.useQuery(params.eventId);

  const { data: currentEvent } = api.event.getCurrent.useQuery();

  useEffect(() => {
    if (!eventLoading && !event && !eventError) {
      router.replace("/admin");
    }
  }, [event, eventLoading, eventError, router]);

  if (eventError) {
    if (eventError.data?.code === "UNAUTHORIZED") {
      router.replace("/api/auth/signin?callbackUrl=/admin/" + params.eventId);
      return null;
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">Error: {eventError.message}</div>
      </div>
    );
  }

  if (eventLoading || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full">
      <ClientEventDashboard event={event} currentEvent={currentEvent ?? null} />
    </main>
  );
}
