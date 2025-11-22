"use client";

import { type Chapter } from "@prisma/client";
import { MapPin, PlusIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

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
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import ChapterSheet from "./ChapterSheet";

type ChapterWithCount = Chapter & { _count: { events: number } };

interface ChaptersSectionProps {
  onChapterClick?: (chapterId: string) => void;
  activeChapterId?: string;
}

export default function ChaptersSection({ onChapterClick, activeChapterId }: ChaptersSectionProps) {
  const { data: chapters, refetch } = api.chapter.all.useQuery();
  const deleteMutation = api.chapter.delete.useMutation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<ChapterWithCount | undefined>();
  const [chapterToDelete, setChapterToDelete] = useState<ChapterWithCount | undefined>();

  const handleEdit = (chapter: ChapterWithCount, e: React.MouseEvent) => {
    e.stopPropagation();
    setChapterToEdit(chapter);
    setSheetOpen(true);
  };

  const handleCreate = () => {
    setChapterToEdit(undefined);
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!chapterToDelete) return;
    try {
      await deleteMutation.mutateAsync(chapterToDelete.id);
      toast.success("Chapter deleted. Events have been unassigned from this chapter.");
      refetch();
    } catch (error) {
      toast.error(`Failed to delete chapter: ${(error as Error).message}`);
    }
    setChapterToDelete(undefined);
  };

  const handleCardClick = (chapterId: string) => {
    if (onChapterClick) {
      // Toggle: if clicking the active one, reset to "all"
      onChapterClick(activeChapterId === chapterId ? "all" : chapterId);
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Chapters</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {chapters?.length ?? 0}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {chapters?.map((chapter) => (
          <Card
            key={chapter.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md active:scale-[0.98]",
              activeChapterId === chapter.id && "ring-2 ring-primary ring-offset-2",
            )}
            onClick={() => handleCardClick(chapter.id)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <span className="text-3xl">{chapter.emoji}</span>
              <div className="flex flex-col">
                <div className="font-semibold">{chapter.name}</div>
                <div className="text-sm text-muted-foreground">
                  {chapter._count.events}{" "}
                  {chapter._count.events === 1 ? "event" : "events"}
                </div>
              </div>
              <div className="ml-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => handleEdit(chapter, e)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChapterToDelete(chapter);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card
          className="cursor-pointer border-dashed transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
          onClick={handleCreate}
        >
          <CardContent className="flex items-center gap-2 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <PlusIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="font-medium text-muted-foreground">Add Chapter</span>
          </CardContent>
        </Card>
      </div>

      <ChapterSheet
        chapter={chapterToEdit}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={() => refetch()}
      />

      <AlertDialog
        open={!!chapterToDelete}
        onOpenChange={(open) => !open && setChapterToDelete(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {chapterToDelete?.emoji} {chapterToDelete?.name}
              </span>
              ? This chapter has{" "}
              <span className="font-semibold">
                {chapterToDelete?._count.events}{" "}
                {chapterToDelete?._count.events === 1 ? "event" : "events"}
              </span>{" "}
              associated with it. Events will be kept but will no longer be
              assigned to this chapter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
