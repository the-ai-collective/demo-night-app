"use client";

import { ArrowUpDown, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmojiPicker } from "~/components/EmojiPicker";
import { api } from "~/trpc/react";

type Chapter = {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  order: number;
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
  const { data: statistics } = api.chapter.getStatistics.useQuery(
    chapter.id,
    {
      enabled: !!chapter.id,
    },
  );

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex flex-1 items-center gap-3">
        <span className="text-2xl">{chapter.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{chapter.name}</div>
            {chapter.order !== 0 && (
              <span className="text-xs text-muted-foreground">
                (Order: {chapter.order})
              </span>
            )}
          </div>
          {chapter.description && (
            <div className="mt-1 text-sm text-muted-foreground">
              {chapter.description}
            </div>
          )}
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {chapter._count.events}{" "}
              {chapter._count.events === 1 ? "event" : "events"} total
            </span>
            {statistics && (
              <>
                {statistics.upcomingEvents > 0 && (
                  <span className="text-green-600">
                    {statistics.upcomingEvents} upcoming
                  </span>
                )}
                {statistics.pastEvents > 0 && (
                  <span className="text-gray-500">
                    {statistics.pastEvents} past
                  </span>
                )}
              </>
            )}
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
  const [description, setDescription] = useState(
    chapter?.description ?? "",
  );
  const [order, setOrder] = useState(chapter?.order ?? 0);
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
          description: description.trim() || null,
          order: Number(order) || 0,
        });
        toast.success("Chapter updated successfully");
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          emoji: emoji.trim(),
          description: description.trim() || undefined,
          order: Number(order) || 0,
        });
        toast.success("Chapter created successfully");
      }
      onSuccess();
      onOpenChange(false);
      setName("");
      setEmoji("");
      setDescription("");
      setOrder(0);
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
            <EmojiPicker
              value={emoji}
              onEmojiSelect={setEmoji}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Select an emoji to represent this chapter, or type one manually
            </p>
            {emoji && (
              <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 p-2">
                <span className="text-2xl">{emoji}</span>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="flex-1 rounded-md border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
                  placeholder="Or type emoji manually"
                  autoComplete="off"
                  maxLength={2}
                />
              </div>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Description (Optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-md border border-gray-200 p-2"
              placeholder="Notes about this chapter..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Display Order</span>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value) || 0)}
              className="rounded-md border border-gray-200 p-2"
              placeholder="0"
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first. Default is 0 (alphabetical).
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
  const { data: affectedEvents, isLoading: loadingEvents } =
    api.chapter.getAffectedEvents.useQuery(chapter.id, {
      enabled: open && !!chapter.id,
    });

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

  const canDelete = !affectedEvents?.hasUpcoming;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              Are you sure you want to delete "{chapter.name}"? This will remove
              the chapter association from all events, but the events themselves
              will not be deleted.
            </div>
            {loadingEvents ? (
              <div className="text-sm text-muted-foreground">
                Loading affected events...
              </div>
            ) : affectedEvents && affectedEvents.all.length > 0 ? (
              <div className="space-y-2">
                <div className="font-semibold">
                  This will affect {affectedEvents.all.length} event(s):
                </div>
                {affectedEvents.hasUpcoming && (
                  <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                    <div className="font-semibold text-yellow-800 mb-2">
                      ⚠️ Cannot delete: {affectedEvents.upcoming.length}{" "}
                      upcoming event(s) found
                    </div>
                    <div className="text-sm text-yellow-700 space-y-1">
                      {affectedEvents.upcoming.map((event) => (
                        <div key={event.id}>
                          • {event.name} (
                          {new Date(event.date).toLocaleDateString()})
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-yellow-700">
                      Please reassign or remove these events before deleting the
                      chapter.
                    </div>
                  </div>
                )}
                {affectedEvents.past.length > 0 && (
                  <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
                    <div className="font-semibold text-gray-800 mb-2">
                      Past events ({affectedEvents.past.length}):
                    </div>
                    <div className="text-sm text-gray-700 space-y-1 max-h-32 overflow-y-auto">
                      {affectedEvents.past.map((event) => (
                        <div key={event.id}>
                          • {event.name} (
                          {new Date(event.date).toLocaleDateString()})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No events are associated with this chapter.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending || !canDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
