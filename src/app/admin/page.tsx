"use client";

import { type Chapter, type Event } from "@prisma/client";
import { CalendarIcon, Filter, PlusIcon, Presentation, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getBrandingClient } from "~/lib/branding";
import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import ChaptersSection from "./components/ChaptersSection";
import { UpsertEventModal } from "./components/UpsertEventModal";
import Logos from "~/components/Logos";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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

type EventWithChapter = Event & {
  chapter: { id: string; name: string; emoji: string } | null;
};

export default function AdminHomePage() {
  const branding = getBrandingClient();
  const { data: currentEvent, refetch: refetchCurrentEvent } =
    api.event.getCurrent.useQuery();
  const {
    data: events,
    refetch: refetchEvents,
    isLoading,
  } = api.event.allAdmin.useQuery();
  const { data: chapters, refetch: refetchChapters } = api.chapter.all.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventWithChapter | undefined>(undefined);
  const [chapterFilter, setChapterFilter] = useState<string>("all");

  const refetch = () => {
    refetchCurrentEvent();
    refetchEvents();
    refetchChapters();
  };

  const showUpsertEventModal = (event?: EventWithChapter) => {
    setEventToEdit(event);
    setModalOpen(true);
  };

  const router = useRouter();

  const filteredEvents = events?.filter((event) => {
    if (chapterFilter === "all") return true;
    if (chapterFilter === "none") return !event.chapterId;
    return event.chapterId === chapterFilter;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/60 shadow-sm backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-1 px-8 py-2">
          <Logos size={36} logoPath={branding.logoPath} />
          <div className="flex flex-col items-center justify-center">
            <h1 className="line-clamp-1 font-marker text-xl font-bold leading-6 tracking-tight">
              {branding.appName} App
            </h1>
            <span className="font-marker text-sm font-bold text-muted-foreground">
              Admin Dashboard
            </span>
          </div>
          <div className="flex w-[108px] items-center justify-end" />
        </div>
      </header>
      <div className="container mx-auto p-8">
        <ChaptersSection />
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Events</h2>
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                <SelectItem value="none">No Chapter</SelectItem>
                {chapters?.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    {chapter.emoji} {chapter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            filteredEvents?.map((event) => (
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
                          {event.chapter && (
                            <span
                              className="text-lg"
                              title={event.chapter.name}
                            >
                              {event.chapter.emoji}
                            </span>
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
        </div>
      </div>
      <UpsertEventModal
        event={eventToEdit}
        chapters={chapters ?? []}
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