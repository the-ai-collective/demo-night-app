"use client";

import { type Chapter } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { DeleteChapterButton } from "./DeleteChapter";

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
  const utils = api.useUtils();
  const createMutation = api.chapter.create.useMutation();
  const updateMutation = api.chapter.update.useMutation();

  const { register, handleSubmit } = useForm({
    values: {
      name: chapter?.name ?? "",
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
            const mutation = chapter
              ? updateMutation.mutateAsync({
                  id: chapter.id,
                  name: data.name,
                  emoji: data.emoji,
                })
              : createMutation.mutateAsync({
                  name: data.name,
                  emoji: data.emoji,
                });

            mutation
              .then((result) => {
                toast.success(
                  `Successfully ${chapter ? "updated" : "created"} chapter!`,
                );

                // Invalidate the chapter.all query cache so all components refetch
                void utils.chapter.all.invalidate();

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
              placeholder="San Francisco"
              autoComplete="off"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Emoji</span>
            <input
              type="text"
              {...register("emoji", { required: true })}
              className="rounded-md border border-gray-200 p-2"
              placeholder="🌉"
              autoComplete="off"
              maxLength={10}
            />
            <p className="text-xs text-gray-500">
              Used as an icon to represent this chapter
            </p>
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {chapter ? "Update Chapter" : "Create Chapter"}
            </Button>
            {chapter && (
              <DeleteChapterButton
                chapterId={chapter.id}
                onDeleted={onDeleted}
              />
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
