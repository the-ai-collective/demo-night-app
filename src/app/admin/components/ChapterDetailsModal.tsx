"use client";

import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card } from "~/components/ui/card";
import type { Chapter } from "~/lib/types/chapter";
import { CalendarIcon, Mail } from "lucide-react";

interface ChapterDetailsModalProps {
  chapter: Chapter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChapterDetailsModal({
  chapter,
  open,
  onOpenChange,
}: ChapterDetailsModalProps) {
  const { data: chapterWithEvents, isLoading } = api.chapter.get.useQuery(
    { id: chapter.id },
    { enabled: open }
  );

  const events = chapterWithEvents?.events ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{chapter.emoji}</span>
            <div>
              <DialogTitle className="text-2xl">{chapter.name}</DialogTitle>
              <DialogDescription>
                {chapter.city}, {chapter.country}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chapter Details */}
          <div className="grid grid-cols-2 gap-4">
            {chapter.timezone && (
              <div>
                <p className="text-sm font-medium text-gray-600">Timezone</p>
                <p className="text-sm">{chapter.timezone}</p>
              </div>
            )}
            {chapter.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <a href={`mailto:${chapter.email}`} className="text-sm text-blue-600 hover:underline">
                    {chapter.email}
                  </a>
                </div>
              </div>
            )}
            {chapter.leadName && (
              <div>
                <p className="text-sm font-medium text-gray-600">Lead</p>
                <p className="text-sm">{chapter.leadName}</p>
              </div>
            )}
            {chapter.leadEmail && (
              <div>
                <p className="text-sm font-medium text-gray-600">Lead Email</p>
                <a href={`mailto:${chapter.leadEmail}`} className="text-sm text-blue-600 hover:underline">
                  {chapter.leadEmail}
                </a>
              </div>
            )}
          </div>

          {chapter.description && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
              <p className="text-sm text-gray-700">{chapter.description}</p>
            </div>
          )}

          {/* Associated Events */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Associated Events ({events.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading events...</div>
            ) : events.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <Card key={event.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.name}</p>
                        <p className="text-xs text-gray-600">
                          {event.date.toLocaleDateString("en-US", {
                            timeZone: "UTC",
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>Demos: {event._count?.demos ?? 0}</span>
                        <span>Attendees: {event._count?.attendees ?? 0}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                No events associated with this chapter yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
