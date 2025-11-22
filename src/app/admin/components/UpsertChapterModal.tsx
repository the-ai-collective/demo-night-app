"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { api } from "~/trpc/react";
import type { Chapter } from "~/lib/types/chapter";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

// Helper function to check if a string contains only emoji
const isValidEmoji = (str: string): boolean => {
  if (!str || str.trim().length === 0) return false;
  // Regex to match emoji characters
  const emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]+$/u;
  return emojiRegex.test(str.trim());
};

export function UpsertChapterModal({
  chapter,
  open,
  onOpenChange,
  onUpsert,
}: {
  chapter?: Chapter | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpsert: () => void;
}) {
  const upsert = api.chapter.upsert.useMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: "", emoji: "🏳️" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: chapter?.name ?? "",
        emoji: chapter?.emoji ?? "🏳️",
      });
    }
  }, [open, chapter, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter ? "Edit" : "Create"} Chapter</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            upsert
              .mutateAsync({
                originalId: chapter?.id,
                id: chapter?.id ?? undefined,
                name: data.name,
                emoji: data.emoji,
              })
              .then(() => {
                toast.success("Chapter saved");
                onOpenChange(false);
                onUpsert();
              })
              .catch((err) => {
                toast.error(`Failed to save chapter: ${err.message}`);
              });
          })}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Name</span>
            <input
              {...register("name", { required: true })}
              className="rounded-md border border-gray-200 p-2"
              placeholder="San Francisco"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Emoji</span>
            <input
              {...register("emoji", {
                required: true,
                validate: (value) => isValidEmoji(value) || "Please enter a valid emoji"
              })}
              type="text"
              className="rounded-md border border-gray-200 p-2 text-center text-3xl"
              placeholder="🏳️"
              maxLength={4}
            />
            {errors.emoji && (
              <span className="text-xs text-red-500">{errors.emoji.message}</span>
            )}
          </label>
          <div className="flex gap-2">
            <Button type="submit">{chapter ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
