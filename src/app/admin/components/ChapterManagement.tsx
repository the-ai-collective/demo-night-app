"use client";

import { type Chapter } from "@prisma/client";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

type ChapterWithCount = Chapter & { _count: { events: number } };

// Configuration: Set to true to prevent deletion of chapters with events
const PREVENT_DELETE_WITH_EVENTS = false;

export function ChapterManagement({
  open,
  onOpenChange,
  onChapterDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChapterDeleted?: (deletedChapterId: string) => void;
}) {
  const { data: chapters, refetch } = api.chapter.getAll.useQuery();
  const [editingChapter, setEditingChapter] = useState<ChapterWithCount | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteChapter, setDeleteChapter] = useState<ChapterWithCount | null>(
    null,
  );

  const handleEdit = (chapter: ChapterWithCount) => {
    setEditingChapter(chapter);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingChapter(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (chapter: ChapterWithCount) => {
    if (PREVENT_DELETE_WITH_EVENTS && chapter._count.events > 0) {
      toast.error(
        `Cannot delete "${chapter.name}" - has ${chapter._count.events} ${chapter._count.events === 1 ? "event" : "events"}`,
      );
      return;
    }
    setDeleteChapter(chapter);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Chapters</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {chapters?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No chapters yet. Create one to organize your events.
            </p>
          )}
          {chapters?.map((chapter) => (
            <div
              key={chapter.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-xl">{chapter.emoji}</span>
                  <span className="ml-2 font-medium">{chapter.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    • {chapter._count.events}{" "}
                    {chapter._count.events === 1 ? "event" : "events"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(chapter)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(chapter)}
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={handleCreate} className="mt-2">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </div>
      </DialogContent>

      <ChapterFormDialog
        chapter={editingChapter}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />

      <DeleteChapterDialog
        chapter={deleteChapter}
        open={!!deleteChapter}
        onOpenChange={(open) => !open && setDeleteChapter(null)}
        onSuccess={(deletedChapterId) => {
          refetch();
          setDeleteChapter(null);
          onChapterDeleted?.(deletedChapterId);
        }}
      />
    </Dialog>
  );
}

function ChapterFormDialog({
  chapter,
  open,
  onOpenChange,
  onSuccess,
}: {
  chapter: ChapterWithCount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const createMutation = api.chapter.create.useMutation();
  const updateMutation = api.chapter.update.useMutation();

  const { register, handleSubmit, reset } = useForm({
    values: {
      name: chapter?.name ?? "",
      emoji: chapter?.emoji ?? "",
    },
  });

  const extractErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      // Try to parse Zod validation errors from tRPC
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
          return parsed[0].message;
        }
      } catch {
        // Not JSON, use the error message as-is
        return error.message;
      }
    }
    return "An unexpected error occurred";
  };

  const onSubmit = handleSubmit((data) => {
    if (chapter) {
      updateMutation
        .mutateAsync({ id: chapter.id, ...data })
        .then(() => {
          toast.success(`${data.name} updated successfully!`);
          reset();
          onSuccess();
        })
        .catch((error) => {
          toast.error(extractErrorMessage(error));
        });
    } else {
      createMutation
        .mutateAsync(data)
        .then(() => {
          toast.success(`Chapter "${data.name}" created successfully`);
          reset();
          onSuccess();
        })
        .catch((error) => {
          toast.error(extractErrorMessage(error));
        });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter ? "Edit" : "Create"} Chapter</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Name</span>
            <input
              type="text"
              {...register("name", { required: true })}
              className="rounded-md border border-gray-200 p-2"
              placeholder="San Francisco"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Emoji</span>
            <input
              type="text"
              {...register("emoji", { required: true })}
              className="rounded-md border border-gray-200 p-2 text-xl"
              placeholder="🌉"
              autoComplete="off"
            />
            <span className="text-xs text-muted-foreground">
              Choose an emoji to represent this chapter (e.g., 🌉 for San Francisco)
            </span>
          </label>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {chapter ? "Update" : "Create"} Chapter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteChapterDialog({
  chapter,
  open,
  onOpenChange,
  onSuccess,
}: {
  chapter: ChapterWithCount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deletedChapterId: string) => void;
}) {
  const deleteMutation = api.chapter.delete.useMutation();
  const hasEvents = chapter && chapter._count.events > 0;

  const handleDelete = () => {
    if (!chapter) return;
    const chapterId = chapter.id;
    const chapterName = chapter.name;

    deleteMutation
      .mutateAsync(chapterId)
      .then(() => {
        // Close dialog first
        onOpenChange(false);

        // Show success toast
        toast.success(`Chapter "${chapterName}" deleted`);

        // Call success callback
        onSuccess(chapterId);
      })
      .catch((error) => {
        toast.error(`Failed to delete chapter: ${error.message}`);
      });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasEvents ? "⚠️ Delete Chapter?" : "Delete Chapter?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {chapter?.name}
              </span>
              ?
            </p>
            {hasEvents && (
              <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  Deleting this chapter will uncategorize{" "}
                  {chapter._count.events}{" "}
                  {chapter._count.events === 1 ? "event" : "events"}.
                  The {chapter._count.events === 1 ? "event" : "events"} won&apos;t be
                  deleted, just removed from this chapter.
                </p>
              </div>
            )}
            {!hasEvents && (
              <p className="text-sm text-gray-500">
                This chapter has no events. It can be safely deleted.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className={
              hasEvents
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-destructive hover:bg-destructive/90"
            }
          >
            {hasEvents ? "Delete Anyway" : "Delete Chapter"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
