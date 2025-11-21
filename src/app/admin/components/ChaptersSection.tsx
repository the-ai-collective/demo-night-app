"use client";

import { type Chapter } from "@prisma/client";
import { ChevronDown, ChevronRight, MapPin, PlusIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

export default function ChaptersSection() {
  const { data: chapters, refetch } = api.chapter.all.useQuery();
  const deleteMutation = api.chapter.delete.useMutation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<ChapterWithCount | undefined>();
  const [chapterToDelete, setChapterToDelete] = useState<ChapterWithCount | undefined>();

  const handleEdit = (chapter: ChapterWithCount) => {
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

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Chapters</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {chapters?.length ?? 0}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 pl-7">
          <div className="flex flex-wrap gap-2">
            {chapters?.map((chapter) => (
              <Card
                key={chapter.id}
                className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() => handleEdit(chapter)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="text-2xl">{chapter.emoji}</span>
                  <div>
                    <div className="font-medium">{chapter.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {chapter._count.events}{" "}
                      {chapter._count.events === 1 ? "event" : "events"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChapterToDelete(chapter);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              className="h-auto py-3"
              onClick={handleCreate}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>
          </div>
        </div>
      )}

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
              assigned to a chapter.
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
