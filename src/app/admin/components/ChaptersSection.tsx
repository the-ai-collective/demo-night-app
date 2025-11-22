"use client";

import { type Chapter } from "@prisma/client";
import { MapPin, MoreHorizontal, Pencil, PlusIcon, Search, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  const activeChapter = chapters?.find((c) => c.id === activeChapterId);

  const filteredChapters = chapters?.filter((chapter) =>
    chapter.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[280px] justify-between">
            {activeChapter ? (
              <span className="flex items-center gap-2">
                <span>{activeChapter.emoji}</span>
                <span>{activeChapter.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({activeChapter._count.events} events)
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">All Chapters</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[320px]">
          {/* Search Input */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onChapterClick?.("all")}
            className="font-medium"
          >
            All Chapters
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {filteredChapters?.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No chapters found
              </div>
            ) : (
              filteredChapters?.map((chapter) => (
                <div key={chapter.id} className="flex items-center">
                  <DropdownMenuItem
                    onClick={() => onChapterClick?.(chapter.id)}
                    className="flex-1"
                  >
                    <span className="mr-2 text-lg">{chapter.emoji}</span>
                    <span className="flex-1 font-medium">{chapter.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {chapter._count.events} events
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(chapter)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setChapterToDelete(chapter)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Chapter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
