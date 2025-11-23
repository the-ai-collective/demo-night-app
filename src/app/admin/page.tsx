"use client";

import { type Event } from "@prisma/client";
import {
  FolderIcon,
  PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getBrandingClient } from "~/lib/branding";
import { api } from "~/trpc/react";
import { useEffect } from "react";

export const dynamic = 'force-dynamic';

import { ChapterManagement } from "./components/ChapterManagement";
import { UpsertEventModal } from "./components/UpsertEventModal";
import { EventListView, EventListSkeleton } from "./components/EventListView";
import { EventGridView, EventGridSkeleton } from "./components/EventGridView";
import Logos from "~/components/Logos";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { LayoutToggle } from "~/components/layout-toggle";
import { useLayoutPreference } from "~/hooks/use-layout-preference";

type EventWithChapter = Event & {
  chapterId: string | null;
  chapter: { id: string; name: string; emoji: string } | null;
  _count: {
    demos: number;
    attendees: number;
    submissions: number;
  };
};

export default function AdminHomePage() {
  const [mounted, setMounted] = useState(false);
  const branding = getBrandingClient();
  const utils = api.useUtils();
  const { data: currentEvent } = api.event.getCurrent.useQuery();
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<
    string | null
  >(null);
  const {
    data: events,
    isLoading,
  } = api.event.allAdmin.useQuery(
    selectedChapterFilter ? { chapterId: selectedChapterFilter } : undefined,
  );
  const { data: chapters } = api.chapter.getAll.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventWithChapter | undefined>(
    undefined,
  );
  const [layout, setLayout] = useLayoutPreference();

  const refetch = async () => {
    await utils.event.getCurrent.invalidate();
    await utils.event.allAdmin.invalidate();
    await utils.chapter.getAll.invalidate();
  };

  const showUpsertEventModal = (event?: EventWithChapter) => {
    setEventToEdit(event);
    setModalOpen(true);
  };

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR/prerendering flash
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Compact header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-2xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-4 sm:px-10 sm:py-5">
          <div className="shrink-0">
            <Logos size={40} logoPath={branding.logoPath} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5">
            <h1 className="line-clamp-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text font-marker text-xl font-bold leading-tight tracking-tight text-transparent sm:text-2xl">
              {branding.appName} App
            </h1>
            <span className="font-marker text-xs font-semibold tracking-wide text-slate-500 sm:text-sm">
              Admin Dashboard
            </span>
          </div>
          <div className="w-10 shrink-0 sm:w-[100px]" />
        </div>
      </header>

      {/* Compact main content */}
      <div className="container mx-auto max-w-[1400px] px-6 py-6 sm:px-10 sm:py-10">
        {/* Compact page header */}
        <div className="mb-6 flex flex-col gap-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl sm:leading-tight">
                Events
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Manage your demo night events and chapters
              </p>
            </div>

            {/* Compact action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setChapterModalOpen(true)}
                className="group relative flex-1 overflow-hidden border-slate-300 bg-white px-4 py-2 text-slate-700 shadow-md transition-all duration-300 hover:scale-105 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg sm:flex-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-100/0 via-slate-100/50 to-slate-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <FolderIcon className="relative mr-2 h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <span className="relative hidden text-sm font-semibold sm:inline">Manage Chapters</span>
                <span className="relative text-sm font-semibold sm:hidden">Chapters</span>
              </Button>
              <Button
                onClick={() => showUpsertEventModal()}
                className="group relative flex-1 overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl sm:flex-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <PlusIcon className="relative mr-2 h-4 w-4 transition-all duration-500 group-hover:rotate-180" />
                <span className="relative hidden text-sm font-bold sm:inline">Create Event</span>
                <span className="relative text-sm font-bold sm:hidden">Create</span>
              </Button>
            </div>
          </div>

          {/* Compact filter section */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-md bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-indigo-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-800">
                Filter by chapter
              </span>
            </div>
            <Select
              value={selectedChapterFilter ?? "all"}
              onValueChange={(value) =>
                setSelectedChapterFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-full border-slate-300 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition-all hover:border-indigo-400 hover:shadow-md sm:w-[220px]">
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="font-semibold">All Chapters</span>
                </SelectItem>
                {chapters?.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    <span className="font-medium">{chapter.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events display */}
        {isLoading ? (
          layout === "grid" ? <EventGridSkeleton /> : <EventListSkeleton />
        ) : layout === "grid" ? (
          <EventGridView
            events={events ?? []}
            currentEventId={currentEvent?.id}
            onEventClick={(eventId) => router.push(`/admin/${eventId}`)}
            onEditClick={showUpsertEventModal}
          />
        ) : (
          <EventListView
            events={events ?? []}
            currentEventId={currentEvent?.id}
            onEventClick={(eventId) => router.push(`/admin/${eventId}`)}
            onEditClick={showUpsertEventModal}
          />
        )}

        <UpsertEventModal
          event={eventToEdit}
          onSubmit={async () => {
            await refetch();
          }}
          onDeleted={async () => {
            await refetch();
          }}
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setEventToEdit(undefined);
            }
          }}
        />
        <ChapterManagement
          open={chapterModalOpen}
          onOpenChange={(open) => {
            setChapterModalOpen(open);
            if (!open) refetch();
          }}
          onChapterDeleted={(deletedChapterId) => {
            // Close the manage chapters dialog
            setChapterModalOpen(false);
            // Reset filter if the deleted chapter was the current filter
            if (selectedChapterFilter === deletedChapterId) {
              setSelectedChapterFilter(null);
            }
            refetch();
          }}
        />
      </div>

      <LayoutToggle
        layout={layout}
        onToggle={() => setLayout(layout === "grid" ? "list" : "grid")}
      />
    </main>
  );
}
