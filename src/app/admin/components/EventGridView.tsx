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

interface EventGridViewProps {
  events: EventWithChapter[];
  currentEventId?: string;
  onEventClick: (eventId: string) => void;
  onEditClick: (event: EventWithChapter) => void;
}

export function EventGridView({
  events,
  currentEventId,
  onEventClick,
  onEditClick,
}: EventGridViewProps) {
  const getEventStatus = (event: EventWithChapter) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const isPast = eventDate < now;
    const isUpcoming = eventDate > now;
    const isLive = event.id === currentEventId;

    return { isPast, isUpcoming, isLive };
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event, index) => {
        const status = getEventStatus(event);

        return (
          <Card
            key={event.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className={cn(
              "group relative cursor-pointer overflow-hidden border-0 bg-white shadow-sm transition-all duration-200 hover:shadow-md animate-in fade-in",
              status.isLive && "ring-2 ring-emerald-500",
              status.isPast && "opacity-70 hover:opacity-85",
            )}
            onClick={() => onEventClick(event.id)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                {/* Header with Logo and Actions */}
                <div className="flex items-start justify-between gap-2">
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
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity hover:bg-slate-100 group-hover:opacity-100"
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
                      className="h-3.5 w-3.5 text-slate-600"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </Button>
                </div>

                {/* Title and Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <CardTitle className="text-base font-semibold leading-tight text-slate-900">
                    {event.name}
                  </CardTitle>
                  {event.chapter && (
                    <span
                      className="shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={getChapterColorStyle(event.chapter.name)}
                    >
                      {event.chapter.emoji} {event.chapter.name}
                    </span>
                  )}
                  {status.isLive && (
                    <span className="shrink-0 rounded bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      LIVE
                    </span>
                  )}
                  {status.isPast && (
                    <span className="shrink-0 rounded bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      Past
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs font-medium text-slate-900 first-letter:capitalize">
                      {getDaysAgo(event.date)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {event.date.toLocaleDateString("en-US", {
                        timeZone: "UTC",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  <div className={cn(
                    "flex flex-col items-center gap-1 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-2",
                    event._count.demos === 0 && "opacity-50"
                  )}>
                    <div className="rounded bg-white/60 p-1">
                      <Presentation className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {event._count.demos}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                      {event._count.demos === 1 ? "Demo" : "Demos"}
                    </span>
                  </div>

                  <div className={cn(
                    "flex flex-col items-center gap-1 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-2",
                    event._count.attendees === 0 && "opacity-50"
                  )}>
                    <div className="rounded bg-white/60 p-1">
                      <Users className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {event._count.attendees}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                      {event._count.attendees === 1 ? "Person" : "People"}
                    </span>
                  </div>

                  <div className={cn(
                    "flex flex-col items-center gap-1 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-2",
                    event._count.submissions === 0 && "opacity-50"
                  )}>
                    <div className="rounded bg-white/60 p-1">
                      <FileText className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {event._count.submissions}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                      {event._count.submissions === 1 ? "Sub" : "Subs"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function EventGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse border-0 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-slate-200" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-5 w-full rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-slate-200" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded bg-slate-200" />
                <div className="h-8 w-32 rounded bg-slate-200" />
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                <div className="h-16 rounded-lg bg-slate-200" />
                <div className="h-16 rounded-lg bg-slate-200" />
                <div className="h-16 rounded-lg bg-slate-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
