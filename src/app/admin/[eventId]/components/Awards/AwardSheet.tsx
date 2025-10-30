"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Award } from "@prisma/client";
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  votable: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function AwardSheet({
  award,
  eventId,
  isPitchNight = false,
  onSubmit,
  open,
  onOpenChange,
}: {
  award?: Award;
  eventId: string;
  isPitchNight?: boolean;
  onSubmit: (award: Award) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const upsertMutation = api.award.upsert.useMutation();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: award ?? {
      name: "",
      description: "",
      votable: true,
    },
  });

  const onFormSubmit = async (data: FormValues) => {
    try {
      const result = await upsertMutation.mutateAsync({
        originalId: award?.id,
        id: data.id!,
        eventId: eventId,
        name: data.name,
        description: data.description,
        votable: data.votable,
      });
      toast.success(`Successfully ${award ? "updated" : "created"} award!`);
      onSubmit(result);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        `Failed to ${award ? "update" : "create"} award: ${(error as Error).message}`,
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{award ? "Edit" : "Add"} Award</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="flex flex-col gap-4 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="🏆 Best Overall"
                      autoComplete="off"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {award && (
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Award ID</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The ultimate standout demo of the night!"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="votable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {isPitchNight ? "Attendees can invest?" : "Attendees can vote?"}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {isPitchNight
                        ? "Allow attendees to invest their $100k budget toward this award. The company with the most investment wins! If unchecked, you can still manually select the winner (e.g., for judges' choice)."
                        : "Determine the winner of this award by audience vote. If unchecked, you can still manually select the winner (e.g., for judges' choice)."}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={upsertMutation.isPending}>
              {award ? "Update" : "Add"} Award
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
