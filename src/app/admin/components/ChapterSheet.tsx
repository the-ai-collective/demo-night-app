"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Chapter } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  emoji: z.string().min(1, "Emoji is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChapterSheet({
  chapter,
  onSubmit,
  open,
  onOpenChange,
}: {
  chapter?: Chapter;
  onSubmit: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = api.chapter.create.useMutation();
  const updateMutation = api.chapter.update.useMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: chapter ?? {
      name: "",
      emoji: "",
    },
  });

  const onFormSubmit = async (data: FormValues) => {
    try {
      if (chapter) {
        await updateMutation.mutateAsync({
          id: chapter.id,
          name: data.name,
          emoji: data.emoji,
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          emoji: data.emoji,
        });
      }
      toast.success(`Successfully ${chapter ? "updated" : "created"} chapter!`);
      onSubmit();
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        `Failed to ${chapter ? "update" : "create"} chapter: ${(error as Error).message}`,
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{chapter ? "Edit" : "Add"} Chapter</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="flex flex-col gap-4 pt-4"
          >
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="🌉"
                      autoComplete="off"
                      autoFocus
                      className="text-2xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {chapter ? "Update" : "Add"} Chapter
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
