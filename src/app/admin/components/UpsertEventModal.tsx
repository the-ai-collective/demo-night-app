"use client";

import { type Chapter, type Event } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";



import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";



import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Switch } from "~/components/ui/switch";



import { DeleteEventButton } from "./DeleteEvent";
import { env } from "~/env";


const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 5).toUpperCase();
};

export function UpsertEventModal({
  event,
  chapters,
  onSubmit,
  onDeleted,
  open,
  onOpenChange,
}: {
  event?: Event;
  chapters: Chapter[],
  onSubmit: (event: Event) => void;
  onDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [defaultId] = useState(() => generateRandomId());
  const [isPitchNight, setIsPitchNight] = useState(
    (event?.config as EventConfig)?.isPitchNight ?? false,
  );
  const [useTestData, setUseTestData] = useState(false);
  const upsertMutation = api.event.upsert.useMutation();
  const populateTestDataMutation = api.event.populateTestData.useMutation();

  const isDevMode = env.NEXT_PUBLIC_NODE_ENV === "development";

  const { setValue, register, handleSubmit } = useForm({
    values: {
      name: event?.name ?? "",
      id: event?.id ?? defaultId,
      date: (event?.date ?? new Date()).toISOString().substring(0, 10),
      url: event?.url ?? "",
      chapterId: event?.chapterId ?? null,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
                chapterId: data.chapterId,
                config,
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
              placeholder="SF Demo Night 🚀"
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

          <label className="flex flex-col gap-1">
            <span className="font-semibold">Chapter</span>

            <select
              className="rounded-md block w-full px-2 border-spacing-x-4 py-2.5 bg-neutral-secondary-medium border
              border-default-medium text-sm focus:ring-brand focus:border-brand placeholder:text-body"
              onChange={(event) => {
                const targetChapter = event.target.value;

                if (targetChapter) {
                  setValue("chapterId", targetChapter);
                } else {
                  setValue("chapterId", null);
                }
              }}
              defaultValue={event?.chapterId ?? "None"}
            >
              <option value={""}>None</option>
              {chapters.map((chapter) => (
                <option value={chapter.id} key={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </label>

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
