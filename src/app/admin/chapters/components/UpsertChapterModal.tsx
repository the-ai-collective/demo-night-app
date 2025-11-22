"use client";

import { type Chapter } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const createMutation = api.chapter.create.useMutation();
  const updateMutation = api.chapter.update.useMutation();
  const deleteMutation = api.chapter.delete.useMutation();

  const { register, handleSubmit, reset } = useForm({
    values: {
      name: chapter?.name ?? "",
      emoji: chapter?.emoji ?? "",
    },
  });

  const handleFormSubmit = (data: { name: string; emoji: string }) => {
    if (chapter) {
      updateMutation
        .mutateAsync({
          id: chapter.id,
          name: data.name,
          emoji: data.emoji,
        })
        .then((result) => {
          toast.success("Chapter updated successfully!");
          onOpenChange(false);
          reset();
          onSubmit(result);
        })
        .catch((error) => {
          toast.error(`Failed to update chapter: ${error.message}`);
        });
    } else {
      createMutation
        .mutateAsync({
          name: data.name,
          emoji: data.emoji,
        })
        .then((result) => {
          toast.success("Chapter created successfully!");
          onOpenChange(false);
          reset();
          onSubmit(result);
        })
        .catch((error) => {
          toast.error(`Failed to create chapter: ${error.message}`);
        });
    }
  };

  const handleDelete = () => {
    if (!chapter) return;
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!chapter) return;
    deleteMutation
      .mutateAsync(chapter.id)
      .then(() => {
        toast.success("Chapter deleted successfully!");
        setDeleteDialogOpen(false);
        onOpenChange(false);
        onDeleted();
      })
      .catch((error) => {
        toast.error(`Failed to delete chapter: ${error.message}`);
      });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {chapter ? "Edit Chapter" : "Create New Chapter"}
            </DialogTitle>
            <DialogDescription>
              {chapter
                ? "Update the chapter name and emoji."
                : "Create a new chapter to organize events by location or group."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
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
              />
              <p className="text-sm text-gray-500">
                Enter an emoji or icon to represent this chapter
              </p>
            </label>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  deleteMutation.isPending
                }
                className="flex-1"
              >
                {chapter ? "Update Chapter" : "Create Chapter"}
              </Button>
              {chapter && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    deleteMutation.isPending
                  }
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {chapter && (
        <DeleteChapterDialog
          chapter={chapter}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </>
  );
}

function DeleteChapterDialog({
  chapter,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  chapter: Chapter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <p className="w-[300px] text-wrap text-center">
            Are you sure you want to delete <strong>&ldquo;{chapter.name}&rdquo;</strong>?
            Events assigned to this chapter will have their chapter removed.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

