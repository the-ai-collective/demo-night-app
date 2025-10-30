"use client";

import { type Event } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Switch } from "~/components/ui/switch";

import { DeleteEventButton } from "./DeleteEvent";

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 5).toUpperCase();
};

export function UpsertEventModal({
  event,
  onSubmit,
  onDeleted,
  open,
  onOpenChange,
}: {
  event?: Event;
  onSubmit: (event: Event) => void;
  onDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [defaultId] = useState(() => generateRandomId());
  const [isPitchNight, setIsPitchNight] = useState(
    (event?.config as EventConfig)?.isPitchNight ?? false,
  );
  const upsertMutation = api.event.upsert.useMutation();
  const { register, handleSubmit } = useForm({
    values: {
      name: event?.name ?? "",
      id: event?.id ?? defaultId,
      date: (event?.date ?? new Date()).toISOString().substring(0, 10),
      url: event?.url ?? "",
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
                config,
              })
              .then((result) => {
                onOpenChange(false);
                toast.success(
                  `Successfully ${event ? "updated" : "created"} event!`,
                );
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
