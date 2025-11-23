"use client";

import { type Chapter } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().min(1, "Emoji is required"),
  city: z.string().optional(),
  hidden: z.boolean().default(false),
});

interface UpsertChapterModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chapterToEdit?: Chapter;
  onSuccess: () => void;
}

export function UpsertChapterModal({
  open,
  setOpen,
  chapterToEdit,
  onSuccess,
}: UpsertChapterModalProps) {
  const utils = api.useUtils();
  const createChapter = api.chapter.create.useMutation({
    onSuccess: () => {
      toast.success("Chapter created successfully");
      setOpen(false);
      onSuccess();
      utils.chapter.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Error creating chapter: ${error.message}`);
    },
  });

  const updateChapter = api.chapter.update.useMutation({
    onSuccess: () => {
      toast.success("Chapter updated successfully");
      setOpen(false);
      onSuccess();
      utils.chapter.getAllAdmin.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating chapter: ${error.message}`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      emoji: "",
      city: "",
      hidden: false,
    },
  });

  useEffect(() => {
    if (chapterToEdit) {
      form.reset({
        name: chapterToEdit.name,
        emoji: chapterToEdit.emoji,
        city: chapterToEdit.city ?? "",
        hidden: chapterToEdit.hidden,
      });
    } else {
      form.reset({
        name: "",
        emoji: "",
        city: "",
        hidden: false,
      });
    }
  }, [chapterToEdit, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (chapterToEdit) {
      updateChapter.mutate({
        id: chapterToEdit.id,
        ...values,
      });
    } else {
      createChapter.mutate(values);
    }
  };

  const isLoading = createChapter.isPending || updateChapter.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {chapterToEdit ? "Edit Chapter" : "Create Chapter"}
          </DialogTitle>
          <DialogDescription>
            {chapterToEdit
              ? "Update chapter details below."
              : "Add a new chapter for your events."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Input placeholder="🌉" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="hidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Hidden</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

