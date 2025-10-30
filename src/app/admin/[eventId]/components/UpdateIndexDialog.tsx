import { type Award, type Demo } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type Item = Demo | Award;

export function UpdateIndexDialog<T extends Item>({
  item,
  open,
  onOpenChange,
  type,
}: {
  item: T;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "demo" | "award";
}) {
  const updateDemoIndexMutation = api.demo.updateIndex.useMutation();
  const updateAwardIndexMutation = api.award.updateIndex.useMutation();

  const { register, handleSubmit } = useForm({
    values: { order: item.index + 1 },
  });

  const handleUpdateIndex = async (data: { order: number }) => {
    const mutation =
      type === "demo" ? updateDemoIndexMutation : updateAwardIndexMutation;
    try {
      await mutation.mutateAsync({
        id: item.id,
        index: data.order - 1,
      });
      onOpenChange(false);
      toast.success(`Successfully updated index!`);
    } catch (error) {
      toast.error(`Failed to update index: ${(error as Error).message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleUpdateIndex)}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Order</span>
            <input
              type="number"
              placeholder="1"
              {...register("order", {
                valueAsNumber: true,
                min: 1,
              })}
              className="rounded-lg border border-gray-200 p-2"
              autoComplete="off"
              autoFocus
              required
            />
          </label>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                updateDemoIndexMutation.isPending ||
                updateAwardIndexMutation.isPending
              }
            >
              Update Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
