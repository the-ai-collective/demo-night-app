"use client";

import { type Chapter, type Event } from "@prisma/client";
import { CalendarIcon, PlusIcon, Presentation, Users, ChevronDown, Download } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getBrandingClient } from "~/lib/branding";
import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import { UpsertEventModal } from "./components/UpsertEventModal";
import { UpsertChapterModal } from "./components/UpsertChapterModal";
import { EventSearchBar } from "./components/EventSearchBar";
import { EventFilterPanel, type EventFilters } from "./components/EventFilterPanel";
import { EventGroupBySelector, type GroupByOption } from "./components/EventGroupBySelector";
import { EventSortControls, type SortByOption, type SortOrderOption } from "./components/EventSortControls";
import { EventViewSelector, type ViewMode } from "./components/EventViewSelector";
import Logos from "~/components/Logos";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

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
  const branding = getBrandingClient();
  const router = useRouter();

  // State
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | undefined>(undefined);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | undefined>(undefined);
  const [showChapters, setShowChapters] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<EventFilters>({
    chapterIds: [],
    eventType: "all",
    eventStatus: "all",
  });
  const [groupBy, setGroupBy] = useState<GroupByOption>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("eventGroupBy") as GroupByOption) ?? "none";
    }
    return "none";
  });
  const [sortBy, setSortBy] = useState<SortByOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrderOption>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("eventViewMode") as ViewMode) ?? "list";
    }
    return "list";
  });
  const [page, setPage] = useState(1);
  const eventsPerPage = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change or when switching grouping mode
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, sortBy, sortOrder, groupBy]);

  // Save groupBy preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("eventGroupBy", groupBy);
    }
  }, [groupBy]);

  // Save viewMode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("eventViewMode", viewMode);
    }
  }, [viewMode]);

  // API queries
  const { data: currentEvent, refetch: refetchCurrentEvent } =
    api.event.getCurrent.useQuery();

  // When grouping is enabled, fetch all events to ensure complete groups
  // Otherwise, use pagination for performance
  const shouldFetchAll = groupBy !== "none";

  const {
    data: eventsData,
    refetch: refetchEvents,
    isLoading,
  } = api.event.allAdmin.useQuery({
    search: debouncedSearch || undefined,
    chapterIds: filters.chapterIds.length > 0 ? filters.chapterIds : undefined,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    eventType: filters.eventType !== "all" ? filters.eventType : undefined,
    eventStatus: filters.eventStatus !== "all" ? filters.eventStatus : undefined,
    minDemos: filters.minDemos,
    maxDemos: filters.maxDemos,
    minAttendees: filters.minAttendees,
    maxAttendees: filters.maxAttendees,
    hasAttendees: filters.hasAttendees,
    hasDemos: filters.hasDemos,
    hasFeedback: filters.hasFeedback,
    hasVotes: filters.hasVotes,
    sortBy,
    sortOrder,
    limit: shouldFetchAll ? undefined : eventsPerPage,
    offset: shouldFetchAll ? undefined : (page - 1) * eventsPerPage,
  });
  const {
    data: chapters,
    refetch: refetchChapters,
    isLoading: isLoadingChapters,
  } = api.chapter.allWithCounts.useQuery();

  // Random data creation mutations
  const createRandomChapters = api.chapter.createRandomBulk.useMutation();
  const createRandomEvents = api.event.createRandomBulk.useMutation();

  const allEvents = eventsData?.events ?? [];
  const totalCount = eventsData?.totalCount ?? 0;

  // When grouping, show all events; otherwise use pagination
  const events = shouldFetchAll ? allEvents : allEvents;
  const displayTotalCount = shouldFetchAll ? allEvents.length : totalCount;

  const refetch = () => {
    refetchCurrentEvent();
    refetchEvents();
    refetchChapters();
  };

  const showUpsertEventModal = (event?: Event) => {
    setEventToEdit(event);
    setModalOpen(true);
  };

  const showUpsertChapterModal = (chapter?: Chapter) => {
    setChapterToEdit(chapter);
    setChapterModalOpen(true);
  };

  const handleCreateRandomChapters = async () => {
    const count = prompt("How many random chapters do you want to create?");
    if (!count) return;
    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount < 1 || numCount > 100) {
      alert("Please enter a valid number between 1 and 100");
      return;
    }
    try {
      await createRandomChapters.mutateAsync({ count: numCount });
      refetch();
      alert(`Successfully created ${numCount} random chapters!`);
    } catch (error) {
      alert("Failed to create random chapters: " + (error as Error).message);
    }
  };

  const handleCreateRandomEvents = async () => {
    const count = prompt("How many random events do you want to create?");
    if (!count) return;
    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount < 1 || numCount > 500) {
      alert("Please enter a valid number between 1 and 500");
      return;
    }
    try {
      await createRandomEvents.mutateAsync({ count: numCount });
      refetch();
      alert(`Successfully created ${numCount} random events!`);
    } catch (error) {
      alert("Failed to create random events: " + (error as Error).message);
    }
  };

  // Group events
  const groupedEvents = useMemo(() => {
    return groupEventsByOption(events, groupBy);
  }, [events, groupBy]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Event Name",
      "Chapter",
      "Date",
      "Event Type",
      "Demos",
      "Attendees",
      "Feedback",
      "Votes",
      "URL",
      "ID",
    ];

    const rows = events.map((event) => [
      event.name,
      event.chapter ? `${event.chapter.emoji} ${event.chapter.name}` : "",
      new Date(event.date).toLocaleDateString("en-US"),
      (event.config as EventConfig | null)?.isPitchNight ? "Pitch Night" : "Demo Night",
      event._count.demos.toString(),
      event._count.attendees.toString(),
      event._count.feedback.toString(),
      event._count.votes.toString(),
      event.url,
      event.id,
    ]);

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.map(escapeCSV).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `events-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={handleCreateRandomChapters}
              disabled={createRandomChapters.isPending}
              className="bg-gradient-to-r from-fuchsia-500 via-purple-600 to-pink-500 hover:from-fuchsia-600 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg"
              size="sm"
            >
              Random Chapters
            </Button>
            <Button
              onClick={handleCreateRandomEvents}
              disabled={createRandomEvents.isPending}
              className="bg-gradient-to-br from-lime-400 via-cyan-500 to-blue-600 hover:from-lime-500 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg"
              size="sm"
            >
              Random Events
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto p-8">
        {/* Chapters Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setShowChapters(!showChapters)}
              className="flex items-center gap-2 text-2xl font-bold hover:text-gray-600"
            >
              Chapters
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  showChapters && "rotate-180"
                )}
              />
            </button>
            <Button onClick={() => showUpsertChapterModal()} variant="outline">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Chapter
            </Button>
          </div>
          {showChapters && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {isLoadingChapters ? (
                <>
                  <ChapterSkeleton />
                  <ChapterSkeleton />
                  <ChapterSkeleton />
                  <ChapterSkeleton />
                </>
              ) : chapters && chapters.length > 0 ? (
                chapters.map((chapter) => (
                  <Card
                    key={chapter.id}
                    className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
                    onClick={(e) => {
                      e.stopPropagation();
                      showUpsertChapterModal(chapter);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{chapter.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold line-clamp-1">
                            {chapter.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {chapter._count.events}{" "}
                            {chapter._count.events === 1 ? "event" : "events"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                  No chapters yet. Create one to organize your events!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Events</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={events.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={() => showUpsertEventModal()}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <EventSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={events.length}
            totalCount={totalCount}
          />

          {/* Filters and Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <EventFilterPanel
              filters={filters}
              onChange={setFilters}
              chapters={chapters ?? []}
            />
            <div className="flex flex-wrap items-center gap-4">
              <EventViewSelector value={viewMode} onChange={setViewMode} />
              <EventGroupBySelector value={groupBy} onChange={setGroupBy} />
              <EventSortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
              />
            </div>
          </div>

          {/* Events List */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <EventSkeleton />
                <EventSkeleton />
                <EventSkeleton />
              </>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg font-medium text-muted-foreground">
                    No events found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || filters.chapterIds.length > 0
                      ? "Try adjusting your search or filters"
                      : "Create your first event to get started"}
                  </p>
                </CardContent>
              </Card>
            ) : viewMode === "table" ? (
              <EventTableView
                events={events}
                currentEvent={currentEvent}
                onEdit={showUpsertEventModal}
                onRowClick={(event) => router.push(`/admin/${event.id}`)}
              />
            ) : groupBy === "none" ? (
              viewMode === "compact" ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <EventCompactCard
                      key={event.id}
                      event={event}
                      currentEvent={currentEvent}
                      onEdit={showUpsertEventModal}
                      onClick={() => router.push(`/admin/${event.id}`)}
                    />
                  ))}
                </div>
              ) : (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    currentEvent={currentEvent}
                    onEdit={showUpsertEventModal}
                    onClick={() => router.push(`/admin/${event.id}`)}
                  />
                ))
              )
            ) : (
              Object.entries(groupedEvents)
                .sort(([groupNameA], [groupNameB]) => {
                  // Sort alphabetically, but keep "No Chapter" at the end
                  if (groupBy === "chapter") {
                    if (groupNameA === "No Chapter") return 1;
                    if (groupNameB === "No Chapter") return -1;
                    // Remove emoji prefix for comparison (emoji + space)
                    const nameA = groupNameA.replace(/^[^\s]+\s/, "");
                    const nameB = groupNameB.replace(/^[^\s]+\s/, "");
                    return nameA.localeCompare(nameB);
                  }
                  return groupNameA.localeCompare(groupNameB);
                })
                .map(([groupName, groupEvents]) => (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <h3 className="text-lg font-semibold">{groupName}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({groupEvents.length} {groupEvents.length === 1 ? "event" : "events"})
                    </span>
                  </div>
                  {viewMode === "compact" ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {groupEvents.map((event) => (
                        <EventCompactCard
                          key={event.id}
                          event={event}
                          currentEvent={currentEvent}
                          onEdit={showUpsertEventModal}
                          onClick={() => router.push(`/admin/${event.id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {groupEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          currentEvent={currentEvent}
                          onEdit={showUpsertEventModal}
                          onClick={() => router.push(`/admin/${event.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && events.length > 0 && !shouldFetchAll && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * eventsPerPage + 1} to{" "}
                {Math.min(page * eventsPerPage, totalCount)} of {totalCount} events
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {Math.ceil(totalCount / eventsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!eventsData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          {/* Show count when grouping */}
          {!isLoading && events.length > 0 && shouldFetchAll && (
            <div className="flex items-center justify-center border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing all {displayTotalCount} {displayTotalCount === 1 ? "event" : "events"}
              </p>
            </div>
          )}
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
      <UpsertChapterModal
        chapter={chapterToEdit}
        onSubmit={() => {
          setChapterModalOpen(false);
          refetch();
        }}
        onDeleted={() => {
          setChapterModalOpen(false);
          refetch();
        }}
        open={chapterModalOpen}
        onOpenChange={setChapterModalOpen}
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

function ChapterSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-gray-200" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-24 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-16 rounded bg-gray-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EventCardProps {
  event: any;
  currentEvent: any;
  onEdit: (event: Event) => void;
  onClick: () => void;
}

function EventCard({ event, currentEvent, onEdit, onClick }: EventCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        "border-border",
        "active:scale-[0.99]",
      )}
      onClick={onClick}
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
                <span className="line-clamp-1 text-xl">
                  {event.chapter && (
                    <span className="mr-1">{event.chapter.emoji}</span>
                  )}
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
                <span className="font-medium">{event._count.demos}</span>
                <span className="text-muted-foreground">
                  {event._count.demos === 1 ? "demo" : "demos"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event._count.attendees}</span>
                <span className="text-muted-foreground">
                  {event._count.attendees === 1 ? "attendee" : "attendees"}
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
              onEdit(event);
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
  );
}

function EventCompactCard({ event, currentEvent, onEdit, onClick }: EventCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        "active:scale-[0.98]",
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {event.chapter && (
                <span className="text-lg">{event.chapter.emoji}</span>
              )}
              <h3 className="line-clamp-1 text-sm font-semibold">
                {event.name}
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span>{event._count.demos} demos</span>
              <span>{event._count.attendees} attendees</span>
            </div>
            {event.id === currentEvent?.id && (
              <div className="mt-2 inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-green-600">LIVE</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
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
              className="h-3 w-3"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface EventTableViewProps {
  events: any[];
  currentEvent: any;
  onEdit: (event: Event) => void;
  onRowClick: (event: any) => void;
}

function EventTableView({
  events,
  currentEvent,
  onEdit,
  onRowClick,
}: EventTableViewProps) {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Event</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Chapter</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
            <th className="px-4 py-3 text-center text-sm font-medium">Demos</th>
            <th className="px-4 py-3 text-center text-sm font-medium">Attendees</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="cursor-pointer border-b transition-colors hover:bg-muted/50"
              onClick={() => onRowClick(event)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image
                    src={
                      (event.config as EventConfig | null)?.isPitchNight
                        ? "/images/pitch.png"
                        : "/images/logo.png"
                    }
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded"
                  />
                  <span className="font-medium">{event.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {event.chapter ? (
                  <span>
                    {event.chapter.emoji} {event.chapter.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-center">{event._count.demos}</td>
              <td className="px-4 py-3 text-center">{event._count.attendees}</td>
              <td className="px-4 py-3">
                {event.id === currentEvent?.id ? (
                  <div className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-green-600">LIVE</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function groupEventsByOption(
  events: any[],
  groupBy: GroupByOption,
): Record<string, any[]> {
  if (groupBy === "none") {
    return {};
  }

  const groups: Record<string, any[]> = {};

  events.forEach((event) => {
    let groupKey: string;

    switch (groupBy) {
      case "chapter":
        groupKey = event.chapter
          ? `${event.chapter.emoji} ${event.chapter.name}`
          : "No Chapter";
        break;
      case "year":
        groupKey = new Date(event.date).getFullYear().toString();
        break;
      case "quarter":
        const date = new Date(event.date);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        groupKey = `Q${quarter} ${date.getFullYear()}`;
        break;
      case "month":
        groupKey = new Date(event.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
        break;
      case "type":
        const isPitchNight = (event.config as EventConfig | null)?.isPitchNight ?? false;
        groupKey = isPitchNight ? "Pitch Night" : "Demo Night";
        break;
      default:
        groupKey = "Other";
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey]!.push(event);
  });

  return groups;
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
