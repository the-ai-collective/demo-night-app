"use client";

import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function DeleteChapterButton({
  chapterId,
  onDeleted,
}: {
  chapterId: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        <span className="sr-only">Delete</span>
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
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </Button>
      <DeleteChapterDialog
        chapterId={chapterId}
        onDeleted={onDeleted}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

export function DeleteChapterDialog({
  chapterId,
  onDeleted,
  open,
  onOpenChange,
}: {
  chapterId: string;
  onDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteMutation = api.chapter.delete.useMutation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete Chapter</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <p className="w-[300px] text-wrap text-center">
            Are you sure you want to delete this chapter? Existing events will
            be disassociated from this chapter.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              deleteMutation
                .mutateAsync(chapterId)
                .then(() => {
                  onOpenChange(false);
                  toast.success("Chapter successfully deleted");
                  onDeleted();
                })
                .catch((error) => {
                  toast.error(`Failed to delete chapter: ${error.message}`);
                });
            }}
            disabled={deleteMutation.isPending}
          >
            Confirm Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
