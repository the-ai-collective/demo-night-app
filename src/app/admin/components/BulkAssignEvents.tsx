"use client";

import { type Event } from "@prisma/client";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";

export function BulkAssignEvents({
  open,
  onOpenChange,
  events,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: Array<
    Event & {
      chapter?: { id: string; name: string; emoji: string } | null;
    }
  >;
  onSuccess: () => void;
}) {
  const { data: chapters } = api.chapter.getAll.useQuery();
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null,
  );
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
    new Set(),
  );
  const bulkAssignMutation = api.chapter.bulkAssignEvents.useMutation();

  const handleToggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedEventIds);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEventIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEventIds.size === events.length) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(events.map((e) => e.id)));
    }
  };

  const handleSubmit = async () => {
    if (!selectedChapterId && selectedEventIds.size > 0) {
      toast.error("Please select a chapter");
      return;
    }
    if (selectedEventIds.size === 0) {
      toast.error("Please select at least one event");
      return;
    }

    try {
      await bulkAssignMutation.mutateAsync({
        chapterId: selectedChapterId,
        eventIds: Array.from(selectedEventIds),
      });
      toast.success(
        `Successfully assigned ${selectedEventIds.size} event(s) to ${
          selectedChapterId
            ? chapters?.find((c) => c.id === selectedChapterId)?.name ??
              "chapter"
            : "no chapter"
        }`,
      );
      setSelectedEventIds(new Set());
      setSelectedChapterId(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        `Failed to assign events: ${(error as Error).message}`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Assign Events to Chapter</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Select Chapter</label>
            <Select
              value={selectedChapterId ?? "none"}
              onValueChange={(value) =>
                setSelectedChapterId(value === "none" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a chapter (or 'No Chapter')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Chapter</SelectItem>
                {chapters?.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    <span className="flex items-center gap-2">
                      <span>{chapter.emoji}</span>
                      <span>{chapter.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-semibold">
              Select Events ({selectedEventIds.size} selected)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedEventIds.size === events.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <div className="divide-y">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedEventIds.has(event.id)}
                    onCheckedChange={() => handleToggleEvent(event.id)}
                  />
                  <div className="flex flex-1 items-center gap-3">
                    {event.chapter && (
                      <span className="text-lg" title={event.chapter.name}>
                        {event.chapter.emoji}
                      </span>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString("en-US", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {event.chapter && (
                          <span className="ml-2">
                            • Currently: {event.chapter.emoji}{" "}
                            {event.chapter.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                bulkAssignMutation.isPending ||
                selectedEventIds.size === 0 ||
                !selectedChapterId
              }
              className="flex-1"
            >
              {bulkAssignMutation.isPending
                ? "Assigning..."
                : `Assign ${selectedEventIds.size} Event(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

