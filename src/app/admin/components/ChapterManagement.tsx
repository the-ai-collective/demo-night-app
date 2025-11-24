"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

type Chapter = {
  id: string;
  name: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    events: number;
  };
};

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

export function ChapterManagement({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: chapters, refetch } = api.chapter.getAll.useQuery(undefined, {
    enabled: open,
  });
  const [editingChapter, setEditingChapter] = useState<
    Chapter | "new" | null
  >(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(
    null,
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Chapters</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Organize events by chapter (SF, NYC, Boston, etc.)
              </p>
              <Button
                onClick={() => setEditingChapter("new")}
                size="sm"
                variant="outline"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Chapter
              </Button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {chapters?.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No chapters yet. Create one to get started!
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {chapters?.map((chapter: Chapter) => (
                    <ChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      onEdit={() => setEditingChapter(chapter)}
                      onDelete={() => setDeletingChapter(chapter)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {editingChapter && (
        <ChapterEditDialog
          chapter={editingChapter === "new" ? null : editingChapter}
          open={!!editingChapter}
          onOpenChange={(open) => {
            if (!open) setEditingChapter(null);
          }}
          onSuccess={() => {
            setEditingChapter(null);
            void refetch();
          }}
        />
      )}

      {deletingChapter && (
        <DeleteChapterDialog
          chapter={deletingChapter}
          open={!!deletingChapter}
          onOpenChange={(open) => {
            if (!open) setDeletingChapter(null);
          }}
          onSuccess={() => {
            setDeletingChapter(null);
            void refetch();
          }}
        />
      )}
    </>
  );
}

function ChapterItem({
  chapter,
  onEdit,
  onDelete,
}: {
  chapter: Chapter;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{chapter.emoji}</span>
        <div>
          <div className="font-semibold">{chapter.name}</div>
          <div className="text-sm text-muted-foreground">
            {chapter._count.events}{" "}
            {chapter._count.events === 1 ? "event" : "events"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ChapterEditDialog({
  chapter,
  open,
  onOpenChange,
  onSuccess,
}: {
  chapter: Chapter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(chapter?.name ?? "");
  const [emoji, setEmoji] = useState(chapter?.emoji ?? "");
  const createMutation = api.chapter.create.useMutation();
  const updateMutation = api.chapter.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !emoji.trim()) {
      toast.error("Name and emoji are required");
      return;
    }

    try {
      if (chapter) {
        await updateMutation.mutateAsync({
          id: chapter.id,
          name: name.trim(),
          emoji: emoji.trim(),
        });
        toast.success("Chapter updated successfully");
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          emoji: emoji.trim(),
        });
        toast.success("Chapter created successfully");
      }
      onSuccess();
      onOpenChange(false);
      setName("");
      setEmoji("");
    } catch (error) {
      toast.error(
        `Failed to ${chapter ? "update" : "create"} chapter: ${
          (error as Error).message
        }`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {chapter ? "Edit Chapter" : "Create Chapter"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-gray-200 p-2"
              placeholder="San Francisco"
              autoComplete="off"
              autoFocus
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Emoji</span>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="rounded-md border border-gray-200 p-2 text-2xl"
              placeholder="🌉"
              autoComplete="off"
              maxLength={2}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter an emoji to represent this chapter (e.g., 🌉, 🗽, 🏛️)
            </p>
          </label>
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
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {chapter ? "Update" : "Create"}
            </Button>
          </div>
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
  chapter: Chapter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const deleteMutation = api.chapter.delete.useMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(chapter.id);
      toast.success("Chapter deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        `Failed to delete chapter: ${(error as Error).message}`,
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{chapter.name}"? This will remove
            the chapter association from all events, but the events themselves
            will not be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
