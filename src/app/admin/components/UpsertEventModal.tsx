"use client";

import { type Event } from "@prisma/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Switch } from "~/components/ui/switch";

import { DeleteEventButton } from "./DeleteEvent";
import { env } from "~/env";

type ChapterOption = { id: string; name: string; emoji: string };

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 5).toUpperCase();
};

type EventWithChapters = Event & {
  chapters?: ChapterOption[];
};

export function UpsertEventModal({
  event,
  chapters,
  onSubmit,
  onDeleted,
  open,
  onOpenChange,
}: {
  event?: EventWithChapters;
  chapters: ChapterOption[];
  onSubmit: (event: Event) => void;
  onDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [defaultId] = useState(() => generateRandomId());
  const [isPitchNight, setIsPitchNight] = useState(
    (event?.config as EventConfig)?.isPitchNight ?? false,
  );
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(
    event?.chapters?.map((c) => c.id) ?? [],
  );
  const [chapterPopoverOpen, setChapterPopoverOpen] = useState(false);
  const [useTestData, setUseTestData] = useState(false);
  const upsertMutation = api.event.upsert.useMutation();
  const populateTestDataMutation = api.event.populateTestData.useMutation();

  const isDevMode = env.NEXT_PUBLIC_NODE_ENV === "development";

  // Reset state when event changes
  useEffect(() => {
    setIsPitchNight((event?.config as EventConfig)?.isPitchNight ?? false);
    setSelectedChapterIds(event?.chapters?.map((c) => c.id) ?? []);
    setUseTestData(false);
  }, [event]);

  const { register, handleSubmit } = useForm({
    values: {
      name: event?.name ?? "",
      id: event?.id ?? defaultId,
      date: (event?.date ?? new Date()).toISOString().substring(0, 10),
      url: event?.url ?? "",
    },
  });

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const selectedChapters = chapters.filter((c) =>
    selectedChapterIds.includes(c.id),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit" : "Create New"} Event</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            const config: EventConfig = {
              ...(event?.config as EventConfig),
              isPitchNight,
            };
            upsertMutation
              .mutateAsync({
                originalId: event?.id,
                id: data.id,
                name: data.name,
                date: new Date(data.date),
                url: data.url,
                config,
                chapterIds: selectedChapterIds,
              })
              .then(async (result) => {
                // If creating new event and test data checkbox is checked, populate test data
                if (!event && useTestData && isDevMode) {
                  try {
                    await populateTestDataMutation.mutateAsync({
                      eventId: result.id,
                      isPitchNight,
                    });
                    toast.success("Successfully created event with test data!");
                  } catch (testDataError) {
                    // Event was created successfully, but test data failed
                    toast.warning(
                      `Event created, but test data population failed: ${(testDataError as Error).message}`,
                    );
                  }
                } else {
                  toast.success(
                    `Successfully ${event ? "updated" : "created"} event!`,
                  );
                }
                onOpenChange(false);
                onSubmit(result);
              })
              .catch((error) => {
                toast.error(
                  `Failed to ${event ? "update" : "create"} event: ${error.message}`,
                );
              });
          })}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Name</span>
            <input
              type="text"
              {...register("name", { required: true })}
              className="rounded-md border border-gray-200 p-2"
              placeholder="SF Demo Night"
              autoComplete="off"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">ID</span>
            <input
              type="text"
              {...register("id")}
              className="rounded-md border border-gray-200 p-2 font-mono"
              autoComplete="off"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Date</span>
            <input
              type="date"
              {...register("date", { valueAsDate: true })}
              className="rounded-md border border-gray-200 p-2"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">URL</span>
            <input
              type="url"
              {...register("url")}
              className="rounded-md border border-gray-200 p-2"
              autoComplete="off"
              placeholder="https://lu.ma/demo-night"
              required
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Chapters</span>
            <Popover open={chapterPopoverOpen} onOpenChange={setChapterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={chapterPopoverOpen}
                  className="h-auto min-h-[40px] w-full justify-between"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedChapters.length > 0 ? (
                      selectedChapters.map((chapter) => (
                        <Badge
                          key={chapter.id}
                          variant="secondary"
                          className="mr-1"
                        >
                          {chapter.emoji} {chapter.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        Select chapters...
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search chapters..." />
                  <CommandList>
                    <CommandEmpty>No chapters found.</CommandEmpty>
                    <CommandGroup>
                      {chapters.map((chapter) => (
                        <CommandItem
                          key={chapter.id}
                          value={chapter.name}
                          onSelect={() => toggleChapter(chapter.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedChapterIds.includes(chapter.id)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="mr-2 text-lg">{chapter.emoji}</span>
                          {chapter.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              Events can belong to multiple chapters
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-gray-200 p-3">
            <Switch
              id="isPitchNight"
              checked={isPitchNight}
              onCheckedChange={setIsPitchNight}
              className="select-none data-[state=checked]:border-green-700 data-[state=checked]:bg-green-700"
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="isPitchNight"
                className="cursor-pointer font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pitch Night Mode
              </label>
              <p className="text-sm text-gray-500">
                Enable investing mode where attendees allocate $100k across
                companies. Awards will be &quot;Crowd Favorite&quot; and
                &quot;Judges&apos; Favorite&quot;.
              </p>
            </div>
          </div>
          {!event && isDevMode && (
            <div className="flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
              <Switch
                id="useTestData"
                checked={useTestData}
                onCheckedChange={(checked) => setUseTestData(checked === true)}
                className="mt-0.5 select-none data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-500"
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="useTestData"
                  className="cursor-pointer font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use Test Data (Dev Only)
                </label>
                <p className="text-sm text-gray-600">
                  Populate the event with 10 demo companies, 10 attendees,
                  feedback entries, and{" "}
                  {isPitchNight ? "$100k investment allocations" : "votes"}.
                  Great for testing!
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={upsertMutation.isPending}
              className={cn(
                "flex-1",
                isPitchNight
                  ? "bg-green-700/80 hover:bg-green-800/80"
                  : "bg-orange-500/80 hover:bg-orange-600/80",
              )}
            >
              {event ? "Update Event" : "Create Event"}
            </Button>
            {event && (
              <DeleteEventButton eventId={event.id} onDeleted={onDeleted} />
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
