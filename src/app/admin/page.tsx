"use client";

import { type Event } from "@prisma/client";
import { ArrowRight, CalendarIcon, PlusIcon, Presentation, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import type { Chapter } from "~/lib/types/chapter";
import type { EventAdmin } from "~/lib/types/eventAdmin";

import { UpsertEventModal } from "./components/UpsertEventModal";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { AdminHeader } from "./components/AdminHeader";

function getDaysAgo(date: Date): string {
  const now = new Date();
  const eventDate = new Date(date);
  const diffTime = now.getTime() - eventDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays === -1) return "in 1 day";
  if (diffDays < 0) return `in ${Math.abs(diffDays)} days`;
  return `${diffDays} days ago`;
}

export default function AdminHomePage() {
  const { data: currentEvent, refetch: refetchCurrentEvent } =
    api.event.getCurrent.useQuery();
  const [selectedChapterId, setSelectedChapterId] = useState<string | undefined>(undefined);
  const { data: chapters } = api.chapter.withEvents.useQuery();
  const {
    data: events,
    refetch: refetchEvents,
    isLoading,
  } = api.event.allAdmin.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | undefined>(undefined);

  const refetch = () => {
    refetchCurrentEvent();
    refetchEvents();
  };

  const showUpsertEventModal = (event?: Event) => {
    setEventToEdit(event);
    setModalOpen(true);
  };

  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="container mx-auto flex gap-6 p-8">
        <div className="flex-[2]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Events</h2>
            <Button onClick={() => showUpsertEventModal()}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <EventSkeleton />
                <EventSkeleton />
                <EventSkeleton />
              </>
            ) : (
              <>
                {(events as EventAdmin[])
                  ?.filter((ev) => (selectedChapterId ? ev.chapterId === selectedChapterId : true))
                  .length === 0 ? (
                  <Card className="p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-2 text-4xl">📭</div>
                      <h3 className="mb-1 text-lg font-semibold">No events found</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedChapterId
                          ? `No events exist for ${chapters?.find((c: Chapter) => c.id === selectedChapterId)?.name ?? "this chapter"} yet.`
                          : "Create your first event to get started."}
                      </p>
                    </div>
                  </Card>
                ) : (
                  (events as EventAdmin[])
                    ?.filter((ev) => (selectedChapterId ? ev.chapterId === selectedChapterId : true))
                    .map((event) => (
                      <Card
                        key={event.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          "border-border",
                          "active:scale-[0.99]",
                        )}
                        onClick={() => {
                          router.push(`/admin/${event.id}`);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <Image
                              src={
                                (event.config as EventConfig | null)?.isPitchNight
                                  ? "/images/pitch.png"
                                  : "/images/logo.png"
                              }
                              alt={
                                (event.config as EventConfig | null)?.isPitchNight
                                  ? "Pitch Night"
                                  : "Demo Night"
                              }
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-contain"
                            />
                            <div className="flex min-w-0 flex-1 items-center gap-4">
                              <div className="min-w-0 flex-1">
                                <CardTitle className="flex items-center gap-2">
                                  {event.chapterId && (
                                    <span className="text-lg">{chapters?.find((c: Chapter) => c.id === event.chapterId)?.emoji}</span>
                                  )}
                                  <span className="line-clamp-1 text-xl">
                                    {event.name}
                                  </span>
                                  {event.id === currentEvent?.id && (
                                    <div className="flex items-center gap-2 rounded-full bg-green-100 px-2 py-1">
                                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                                      <span className="text-xs font-semibold text-green-600">
                                        LIVE
                                      </span>
                                    </div>
                                  )}
                                </CardTitle>
                                <div className="mt-1 flex items-center gap-1 text-sm font-medium">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span className="first-letter:capitalize">
                                    {getDaysAgo(event.date)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    (
                                    {event.date.toLocaleDateString("en-US", {
                                      timeZone: "UTC",
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                    )
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm">
                                  <Presentation className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {event._count.demos}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {event._count.demos === 1 ? "demo" : "demos"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {event._count.attendees}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {event._count.attendees === 1
                                      ? "attendee"
                                      : "attendees"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                showUpsertEventModal(event);
                              }}
                            >
                              <span className="sr-only">Edit</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="m15 5 4 4" />
                              </svg>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="sticky top-20">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Chapters</h2>
              <div className="flex gap-2">
                {selectedChapterId && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedChapterId(undefined)}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  onClick={() => router.push('/admin/chapters')}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {chapters?.map((chapter: Chapter) => {
                const chapterEventCount = (events as EventAdmin[])?.filter(
                  (e) => e.chapterId === chapter.id
                ).length ?? 0;
                const isSelected = selectedChapterId === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapterId(isSelected ? undefined : chapter.id)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all hover:bg-gray-50",
                      isSelected
                        ? "border-gray-400 bg-gray-50"
                        : "border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-all",
                        isSelected
                          ? "border-gray-900 bg-gray-900"
                          : "border-gray-300"
                      )}>
                        {isSelected && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-base">{chapter.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {chapter.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chapterEventCount} {chapterEventCount === 1 ? "event" : "events"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <UpsertEventModal
        event={eventToEdit}
        onSubmit={() => refetch()}
        onDeleted={() => {
          setModalOpen(false);
          refetch();
        }}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </main>
  );
}

function EventSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-12 w-12 rounded-lg bg-gray-200" />
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-7 w-48 rounded bg-gray-200" />
              <div className="mt-2 flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="h-8 w-8 rounded bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
}
