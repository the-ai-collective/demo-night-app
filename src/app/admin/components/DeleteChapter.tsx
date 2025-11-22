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
        variant="destructive"
        className="w-20"
        type="button"
        onClick={() => setOpen(true)}
      >
        Delete
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
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <p className="w-[300px] text-wrap text-center">
            Are you sure you want to delete this chapter?
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
