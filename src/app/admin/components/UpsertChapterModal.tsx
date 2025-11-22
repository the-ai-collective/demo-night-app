"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { type Chapter } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";



import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";



import Emoji from "~/components/Emoji";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";



import { DeleteChapterButton } from "~/app/admin/components/DeleteChapter";


export function UpsertChapterModal({
  chapter,
  onSubmit,
  onDeleted,
  open,
  onOpenChange,
}: {
  chapter?: Chapter;
  onSubmit: (chapter: Chapter) => void;
  onDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [displayEmoji, setDisplayEmoji] = useState(chapter?.emoji ?? "1f680"); // Rocket emoji as default
  console.log(displayEmoji);

  const upsertMutation = api.chapter.upsert.useMutation();

  const { setValue, register, handleSubmit } = useForm({
    values: {
      name: chapter?.name ?? "",
      id: chapter?.id ?? null,
      emoji: chapter?.emoji ?? "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter ? "Edit" : "Create New"} Chapter</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            upsertMutation
              .mutateAsync({
                id: chapter?.id,
                name: data.name,
                emoji: data.emoji,
              })
              .then(async (result) => {
                toast.success(
                  `Successfully ${chapter ? "updated" : "created"} chapter!`,
                );
                onOpenChange(false);
                onSubmit(result);
              })
              .catch((error) => {
                toast.error(
                  `Failed to ${chapter ? "update" : "create"} chapter: ${error.message}`,
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
              placeholder="San Francisco Chapter"
              autoComplete="off"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1">
            <div className="font-semibold flex">
              Emoji - <span className="ml-1 text-xl"><Emoji>{displayEmoji}</Emoji></span>
            </div>

            <div className="-ml-2">
              <Picker
                data={data}
                theme={"light"}
                previewPosition="none"
                maxFrequentRows={0}
                onEmojiSelect={(emoji: any) => {
                  setValue("emoji", emoji.unified);
                  setDisplayEmoji(emoji.unified);
                }
              } />
            </div>
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={upsertMutation.isPending}
              className={cn(
                "flex-1",
                "bg-orange-500/80 hover:bg-orange-600/80",
              )}
            >
              {chapter ? "Update Chapter" : "Create Chapter"}
            </Button>
            {chapter && (
              <DeleteChapterButton chapterId={chapter.id} onDeleted={onDeleted} />
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
