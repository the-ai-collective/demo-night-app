"use client";

import { type Chapter } from "@prisma/client";
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

interface DeleteChapterDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapterToDelete?: Chapter;
  onSuccess: () => void;
}

export function DeleteChapterDialog({
  open,
  setOpen,
  chapterToDelete,
  onSuccess,
}: DeleteChapterDialogProps) {
  const utils = api.useUtils();
  const deleteChapter = api.chapter.delete.useMutation({
    onSuccess: () => {
      toast.success("Chapter deleted successfully");
      setOpen(false);
      onSuccess();
      utils.chapter.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!chapterToDelete) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            chapter &quot;{chapterToDelete.name}&quot;.
            <br />
            <br />
            <span className="font-bold text-red-500">
              Note: You cannot delete a chapter that has associated events.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => deleteChapter.mutate(chapterToDelete.id)}
            disabled={deleteChapter.isPending}
          >
            {deleteChapter.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

