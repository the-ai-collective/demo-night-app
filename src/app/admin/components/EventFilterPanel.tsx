"use client";

import { type Chapter } from "@prisma/client";
import { ChevronDown, Filter, X } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

export interface EventFilters {
  chapterIds: string[];
  dateFrom?: Date;
  dateTo?: Date;
  eventType: "all" | "demo" | "pitch";
  eventStatus: "all" | "upcoming" | "past";
  minDemos?: number;
  maxDemos?: number;
  minAttendees?: number;
  maxAttendees?: number;
  hasAttendees?: boolean;
  hasDemos?: boolean;
  hasFeedback?: boolean;
  hasVotes?: boolean;
}

interface EventFilterPanelProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  chapters: Chapter[];
}

export function EventFilterPanel({
  filters,
  onChange,
  chapters,
}: EventFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState("");

  const activeFilterCount = getActiveFilterCount(filters);

  // Filter chapters based on search query
  const filteredChapters = chapters.filter((chapter) =>
    chapter.name.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const handleReset = () => {
    onChange({
      chapterIds: [],
      eventType: "all",
      eventStatus: "all",
    });
  };

  const toggleChapter = (chapterId: string) => {
    const newChapterIds = filters.chapterIds.includes(chapterId)
      ? filters.chapterIds.filter((id) => id !== chapterId)
      : [...filters.chapterIds, chapterId];
    onChange({ ...filters, chapterIds: newChapterIds });
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const parseDateFromInput = (value: string): Date | undefined => {
    if (!value) return undefined;
    return new Date(value + "T00:00:00.000Z");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="mr-1 h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {isOpen && (
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Chapters</Label>
                <div className="relative">
                  <Input
                    placeholder="Search chapters..."
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    className="h-9 pr-8"
                  />
                  {chapterSearch && (
                    <button
                      type="button"
                      onClick={() => setChapterSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto rounded-md border p-3">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {filteredChapters.length > 0 ? (
                      filteredChapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`chapter-${chapter.id}`}
                            checked={filters.chapterIds.includes(chapter.id)}
                            onCheckedChange={() => toggleChapter(chapter.id)}
                          />
                          <Label
                            htmlFor={`chapter-${chapter.id}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {chapter.emoji} {chapter.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-4 text-center text-sm text-muted-foreground md:col-span-3">
                        No chapters found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Date Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={formatDateForInput(filters.dateFrom)}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        dateFrom: parseDateFromInput(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={formatDateForInput(filters.dateTo)}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        dateTo: parseDateFromInput(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const from = new Date();
                    from.setDate(from.getDate() - 7);
                    onChange({ ...filters, dateFrom: from, dateTo: new Date() });
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const from = new Date();
                    from.setDate(from.getDate() - 30);
                    onChange({ ...filters, dateFrom: from, dateTo: new Date() });
                  }}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const from = new Date();
                    from.setMonth(from.getMonth() - 3);
                    onChange({ ...filters, dateFrom: from, dateTo: new Date() });
                  }}
                >
                  Last 3 months
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const from = new Date(new Date().getFullYear(), 0, 1);
                    onChange({ ...filters, dateFrom: from, dateTo: new Date() });
                  }}
                >
                  This year
                </Button>
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Event Type</Label>
              <Select
                value={filters.eventType}
                onValueChange={(value: "all" | "demo" | "pitch") =>
                  onChange({ ...filters, eventType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="demo">Demo Night</SelectItem>
                  <SelectItem value="pitch">Pitch Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Event Status</Label>
              <Select
                value={filters.eventStatus}
                onValueChange={(value: "all" | "upcoming" | "past") =>
                  onChange({ ...filters, eventStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Demo Count */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Demo Count</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minDemos" className="text-xs text-muted-foreground">
                    Min
                  </Label>
                  <Input
                    id="minDemos"
                    type="number"
                    min={0}
                    placeholder="No min"
                    value={filters.minDemos ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        minDemos: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDemos" className="text-xs text-muted-foreground">
                    Max
                  </Label>
                  <Input
                    id="maxDemos"
                    type="number"
                    min={0}
                    placeholder="No max"
                    value={filters.maxDemos ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        maxDemos: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Attendee Count */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Attendee Count</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minAttendees" className="text-xs text-muted-foreground">
                    Min
                  </Label>
                  <Input
                    id="minAttendees"
                    type="number"
                    min={0}
                    placeholder="No min"
                    value={filters.minAttendees ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        minAttendees: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees" className="text-xs text-muted-foreground">
                    Max
                  </Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min={0}
                    placeholder="No max"
                    value={filters.maxAttendees ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        maxAttendees: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Has Data Checkboxes */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Has Data</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAttendees"
                    checked={filters.hasAttendees ?? false}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...filters,
                        hasAttendees: checked ? true : undefined,
                      })
                    }
                  />
                  <Label htmlFor="hasAttendees" className="cursor-pointer text-sm font-normal">
                    Has Attendees
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDemos"
                    checked={filters.hasDemos ?? false}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...filters,
                        hasDemos: checked ? true : undefined,
                      })
                    }
                  />
                  <Label htmlFor="hasDemos" className="cursor-pointer text-sm font-normal">
                    Has Demos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasFeedback"
                    checked={filters.hasFeedback ?? false}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...filters,
                        hasFeedback: checked ? true : undefined,
                      })
                    }
                  />
                  <Label htmlFor="hasFeedback" className="cursor-pointer text-sm font-normal">
                    Has Feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasVotes"
                    checked={filters.hasVotes ?? false}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...filters,
                        hasVotes: checked ? true : undefined,
                      })
                    }
                  />
                  <Label htmlFor="hasVotes" className="cursor-pointer text-sm font-normal">
                    Has Votes
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getActiveFilterCount(filters: EventFilters): number {
  let count = 0;
  if (filters.chapterIds.length > 0) count++;
  if (filters.dateFrom ?? filters.dateTo) count++;
  if (filters.eventType !== "all") count++;
  if (filters.eventStatus !== "all") count++;
  if (filters.minDemos !== undefined || filters.maxDemos !== undefined) count++;
  if (filters.minAttendees !== undefined || filters.maxAttendees !== undefined)
    count++;
  if (filters.hasAttendees) count++;
  if (filters.hasDemos) count++;
  if (filters.hasFeedback) count++;
  if (filters.hasVotes) count++;
  return count;
}
