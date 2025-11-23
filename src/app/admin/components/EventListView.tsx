import { type Event } from "@prisma/client";
import {
  CalendarIcon,
  FileText,
  Presentation,
  Users,
} from "lucide-react";
import Image from "next/image";
import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { getChapterColorStyle } from "~/lib/chapter-colors";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

type EventWithChapter = Event & {
  chapterId: string | null;
  chapter: { id: string; name: string; emoji: string } | null;
  _count: {
    demos: number;
    attendees: number;
    submissions: number;
  };
};

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

interface EventListViewProps {
  events: EventWithChapter[];
  currentEventId?: string;
  onEventClick: (eventId: string) => void;
  onEditClick: (event: EventWithChapter) => void;
}

export function EventListView({
  events,
  currentEventId,
  onEventClick,
  onEditClick,
}: EventListViewProps) {
  return (
    <div className="flex flex-col gap-5">
      {events.map((event) => (
        <Card
          key={event.id}
          className={cn(
            "group cursor-pointer border-0 bg-white shadow-sm transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
            event.id === currentEventId && "ring-2 ring-indigo-500/50 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
          )}
          onClick={() => onEventClick(event.id)}
        >
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
              <div className="relative shrink-0">
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
                  width={72}
                  height={72}
                  className="h-14 w-14 rounded-2xl object-contain transition-all duration-300 group-hover:scale-110 sm:h-[72px] sm:w-[72px]"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                        {event.name}
                      </CardTitle>
                      {event.chapter && (
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
                          style={getChapterColorStyle(event.chapter.name)}
                        >
                          {event.chapter.emoji} {event.chapter.name}
                        </span>
                      )}
                      {event.id === currentEventId && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-medium first-letter:capitalize">
                        {getDaysAgo(event.date)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-500">
                        {event.date.toLocaleDateString("en-US", {
                          timeZone: "UTC",
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 shrink-0 rounded-full bg-slate-50/0 p-0 opacity-0 transition-all duration-200 hover:bg-slate-100 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(event);
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
                      className="h-4 w-4 text-slate-600"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/70 px-3.5 py-2 transition-colors hover:bg-slate-100">
                    <Presentation className="h-[18px] w-[18px] text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">
                      {event._count.demos}
                    </span>
                    <span className="text-sm text-slate-600">
                      {event._count.demos === 1 ? "demo" : "demos"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/70 px-3.5 py-2 transition-colors hover:bg-slate-100">
                    <Users className="h-[18px] w-[18px] text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">
                      {event._count.attendees}
                    </span>
                    <span className="text-sm text-slate-600">
                      {event._count.attendees === 1 ? "attendee" : "attendees"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/70 px-3.5 py-2 transition-colors hover:bg-slate-100">
                    <FileText className="h-[18px] w-[18px] text-slate-500" />
                    <span className="text-sm font-semibold text-slate-900">
                      {event._count.submissions}
                    </span>
                    <span className="text-sm text-slate-600">
                      {event._count.submissions === 1
                        ? "submission"
                        : "submissions"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse border-0 bg-white shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
              <div className="h-14 w-14 rounded-2xl bg-slate-200 sm:h-[72px] sm:w-[72px]" />
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="h-7 w-56 rounded-lg bg-slate-200 sm:h-8 sm:w-72" />
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-slate-200" />
                      <div className="h-4 w-36 rounded bg-slate-200 sm:w-44" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-9 w-24 rounded-xl bg-slate-200 sm:w-28" />
                  <div className="h-9 w-28 rounded-xl bg-slate-200 sm:w-32" />
                  <div className="h-9 w-28 rounded-xl bg-slate-200 sm:w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
