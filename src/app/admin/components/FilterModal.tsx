"use client";

import { useState } from "react";
import { type Chapter } from "@prisma/client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function FilterModal({
  currentValue,
  chapters,
  onUpdate,
  open,
  onOpenChange,
}: {
  currentValue: string | null,
  chapters: Chapter[],
  onUpdate: (chapter: string | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [filter, setFilter] = useState<string | null>(currentValue);

  const submit = () => {
    onUpdate(filter);
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter By Chapter</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Chapter</span>

            <select
              className="rounded-md block w-full px-2 border-spacing-x-4 py-2.5 bg-neutral-secondary-medium border
              border-default-medium text-sm focus:ring-brand focus:border-brand placeholder:text-body"
              onChange={(event) => {
                const targetChapter = event.target.value || null;

                setFilter(targetChapter);
              }}
              defaultValue={currentValue ?? "None"}
            >
              <option value={""}>None</option>
              {chapters.map((chapter) => (
                <option value={chapter.id} key={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <Button
              className={cn(
                "flex-1",
                "bg-orange-500/80 hover:bg-orange-600/80",
              )}
              onClick={submit}
            >
              Update Filter
            </Button>

            <Button className="bg-gray-400 hover:bg-gray-500" onClick={() => {
              setFilter(null);
              submit();
            }}>
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
