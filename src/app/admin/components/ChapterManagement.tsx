"use client";

import { type Chapter } from "@prisma/client";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

type ChapterWithCount = Chapter & {
  _count: {
    events: number;
  };
};

export function ChapterManagement() {
  const { data: chapters, refetch } = api.chapter.getAll.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | undefined>(
    undefined,
  );

  const showUpsertModal = (chapter?: Chapter) => {
    setChapterToEdit(chapter);
    setModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chapters</CardTitle>
          <Button size="sm" onClick={() => showUpsertModal()}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!chapters || chapters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No chapters yet. Create one to organize events by location.
          </p>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                onEdit={() => showUpsertModal(chapter)}
                onDeleted={() => refetch()}
              />
            ))}
          </div>
        )}
      </CardContent>
      <UpsertChapterModal
        chapter={chapterToEdit}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          setModalOpen(false);
          refetch();
        }}
      />
    </Card>
  );
}

function ChapterItem({
  chapter,
  onEdit,
  onDeleted,
}: {
  chapter: ChapterWithCount;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const deleteMutation = api.chapter.delete.useMutation();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }

    deleteMutation
      .mutate(chapter.id, {
        onSuccess: () => {
          toast.success("Chapter deleted successfully");
          onDeleted();
        },
        onError: (error) => {
          toast.error(`Failed to delete chapter: ${error.message}`);
        },
      });
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{chapter.emoji}</span>
        <div>
          <p className="font-medium">{chapter.name}</p>
          <p className="text-sm text-muted-foreground">
            {chapter._count.events}{" "}
            {chapter._count.events === 1 ? "event" : "events"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className={deleteConfirm ? "text-destructive" : ""}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function UpsertChapterModal({
  chapter,
  open,
  onOpenChange,
  onSuccess,
}: {
  chapter?: Chapter;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const createMutation = api.chapter.create.useMutation();
  const updateMutation = api.chapter.update.useMutation();

  const { register, handleSubmit, reset } = useForm({
    values: {
      name: chapter?.name ?? "",
      emoji: chapter?.emoji ?? "📍",
    },
  });

  const onSubmit = (data: { name: string; emoji: string }) => {
    if (chapter) {
      updateMutation.mutate(
        {
          id: chapter.id,
          name: data.name,
          emoji: data.emoji,
        },
        {
          onSuccess: () => {
            toast.success("Chapter updated successfully");
            reset();
            onSuccess();
          },
          onError: (error) => {
            toast.error(`Failed to update chapter: ${error.message}`);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Chapter created successfully");
          reset();
          onSuccess();
        },
        onError: (error) => {
          toast.error(`Failed to create chapter: ${error.message}`);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {chapter ? "Edit" : "Create"} Chapter
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              maxLength={4}
            />
            <span className="text-xs text-muted-foreground">
              Choose an emoji to represent this chapter
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


