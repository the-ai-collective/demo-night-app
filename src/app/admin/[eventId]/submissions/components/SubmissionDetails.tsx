import { type Submission, type SubmissionStatus } from "@prisma/client";
import { FlagIcon, Presentation, StarIcon, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SUBMISSION_STATUSES, statusTitle } from "~/lib/types/submissionStatus";
import { TAGLINE_MAX_LENGTH } from "~/lib/types/taglineMaxLength";
import { cn, debounce } from "~/lib/utils";
import { api } from "~/trpc/react";

import { statusColor } from "~/components/SubmissionStatusBadge";
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
import { Button, buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { type Event } from "./SubmissionsDashboard";

export default function SubmissionDetails({
  event,
  submission,
  isAdmin,
  onUpdate,
}: {
  event: Event;
  submission: Submission;
  isAdmin: boolean;
  onUpdate: () => void;
}) {
  return (
    <ScrollArea className="flex size-full flex-col gap-2 overflow-y-scroll pb-12">
      <SubmissionReview
        event={event}
        submission={submission}
        isAdmin={isAdmin}
        onUpdate={onUpdate}
      />
      <h2 className="pb-1 pt-4 text-2xl font-semibold">Submission Details</h2>
      <Submission
        submission={submission}
        isAdmin={isAdmin}
        onUpdate={onUpdate}
      />
    </ScrollArea>
  );
}

function SubmissionReview({
  event,
  submission,
  isAdmin: _,
  onUpdate,
}: {
  event: Event;
  submission: Submission;
  isAdmin: boolean;
  onUpdate: () => void;
}) {
  const updateMutation = api.submission.update.useMutation();
  const sendStatusEmailMutation = api.submission.sendStatusEmail.useMutation();
  const [sendingEmail, setSendingEmail] = useState(false);
  const { register, setValue, watch } = useForm({
    values: {
      id: submission.id,
      status: submission.status,
      flagged: submission.flagged,
      rating: submission.rating,
      comment: submission.comment,
    },
  });
  const status = watch("status");
  const flagged = watch("flagged");
  const rating = watch("rating");
  const comment = watch("comment");

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      // Update DB with status, flag, rating, and comment
      await updateMutation.mutateAsync({
        eventId: event.id,
        secret: event.secret,
        id: submission.id,
        status: status,
        flagged: flagged,
        rating: rating ? (rating as number) : null,
        comment: comment,
      });
      
      // Then send the email
      await sendStatusEmailMutation.mutateAsync({
        submissionId: submission.id,
        status: status as SubmissionStatus,
        message: comment ?? undefined,
      });
      toast.success("Email sent successfully!");
      onUpdate();
    } catch (error) {
      toast.error(`Failed: ${(error as Error).message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Debounced update - only for status, flag, rating (NOT comment)
  const debouncedUpdate = debounce(() => {
    updateMutation
      .mutateAsync({
        eventId: event.id,
        secret: event.secret,
        id: submission.id,
        status: status,
        flagged: flagged,
        rating: rating ? (rating as number) : null,
        comment: submission.comment, // Keep the original comment, don't update
      })
      .then(onUpdate)
      .catch((error) => {
        toast.error(`Failed to update submission: ${error.message}`);
      });
  }, 1000);

  useEffect(() => {
    debouncedUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, flagged, rating]);

  return (
    <Card className="flex flex-col gap-4 bg-muted/50 p-4">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col gap-1">
            <Select
              value={status}
              onValueChange={(value: SubmissionStatus) =>
                setValue("status", value)
              }
            >
              <SelectTrigger
                className={cn(
                  "w-[200px] font-semibold",
                  statusColor(status),
                  `text-${statusColor(status).replace("bg-", "")}-800`,
                )}
              >
                <SelectValue placeholder="Select status">
                  {statusTitle(status)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SUBMISSION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex flex-row items-center gap-2">
                      <div
                        className={cn(
                          "size-3 rounded-full",
                          statusColor(status),
                        )}
                      />
                      <span className="text-sm font-medium">
                        {statusTitle(status)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={watch("flagged")}
                onCheckedChange={(checked) => {
                  if (typeof checked === "boolean") {
                    setValue("flagged", checked);
                  }
                }}
                className="hidden"
              />
              <FlagIcon
                className={cn(
                  "h-6 w-6 cursor-pointer transition-all duration-300",
                  watch("flagged")
                    ? "fill-orange-500 text-orange-700"
                    : "text-muted-foreground/50",
                )}
                strokeWidth={2.5}
                onClick={() => setValue("flagged", !watch("flagged"))}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarIcon
                  key={value}
                  className={cn(
                    "h-[26px] w-[26px] cursor-pointer transition-all duration-300",
                    (watch("rating") ?? 0) >= value
                      ? "fill-yellow-300 text-yellow-500"
                      : "text-muted-foreground/50",
                  )}
                  strokeWidth={2.25}
                  onClick={() => {
                    if (watch("rating") === value) {
                      setValue("rating", null);
                    } else {
                      setValue("rating", value);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Textarea
            {...register("comment")}
            placeholder="Add a comment..."
            className="max-h-32 min-h-10"
            rows={1}
          />
        </div>
        <Button
          onClick={handleSendEmail}
          disabled={sendingEmail}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {sendingEmail ? "Sending..." : "✉️ Confirm & Send Email"}
        </Button>
      </div>
    </Card>
  );
}

function Submission({
  submission,
  isAdmin,
  onUpdate,
}: {
  submission: Submission;
  isAdmin: boolean;
  onUpdate: () => void;
}) {
  const adminUpdateMutation = api.submission.adminUpdate.useMutation();
  const convertToDemoMutation = api.submission.convertToDemo.useMutation();
  const deleteMutation = api.submission.delete.useMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { register, watch } = useForm({
    values: submission,
  });

  const debouncedUpdate = debounce((data: any) => {
    if (!isAdmin) return;
    adminUpdateMutation
      .mutateAsync({
        id: data.id,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        email: data.email,
        url: data.url,
        demoUrl: data.demoUrl,
        pocName: data.pocName,
      })
      .then(onUpdate)
      .catch((error) => {
        toast.error(`Failed to update submission: ${error.message}`);
      });
  }, 1000);

  useEffect(() => {
    const subscription = watch(debouncedUpdate);
    return () => subscription.unsubscribe();
  }, [watch, debouncedUpdate]);

  const convertToDemo = () => {
    convertToDemoMutation
      .mutateAsync(submission.id)
      .then(() => {
        toast.success(`Converted to demo!`);
        onUpdate();
      })
      .catch((error) => {
        toast.error(`Failed to convert to demo: ${error.message}`);
      });
  };

  return (
    <TooltipProvider>
      <Card className="flex flex-col gap-4 bg-muted/50 p-4">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex w-full flex-col gap-4 md:flex-row">
            <div className="flex w-full flex-col gap-1">
              <Label className="font-semibold">Demo / Startup Name</Label>
              <Input type="text" {...register("name")} disabled={!isAdmin} />
            </div>
            <div className="flex w-full flex-col gap-1">
              <Label className="font-semibold">Demo / Startup Website</Label>
              <Input
                type="url"
                placeholder="https://yourstartupwebsite.com"
                {...register("url")}
                disabled={!isAdmin}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex w-full flex-row items-center justify-start gap-1">
              <Label className="font-semibold">Tagline 👋</Label>
              {watch("tagline")?.length >= 100 && (
                <span
                  className={cn(
                    "text-sm italic",
                    watch("tagline")?.length >= TAGLINE_MAX_LENGTH
                      ? "text-red-500"
                      : "text-gray-400",
                  )}
                >
                  {`(${watch("tagline").length} / ${TAGLINE_MAX_LENGTH})`}
                </span>
              )}
            </div>
            <Textarea
              {...register("tagline")}
              className="max-h-32 min-h-10"
              rows={2}
              disabled={!isAdmin}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="font-semibold">Demo Description 🧑‍💻</Label>
            <Textarea
              {...register("description")}
              className="max-h-64 min-h-10"
              rows={3}
              disabled={!isAdmin}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="font-semibold">Demo Link 🔗</Label>
            <Input
              type="url"
              placeholder="None"
              {...register("demoUrl")}
              className="placeholder:italic"
              autoComplete="off"
              disabled={!isAdmin}
            />
          </div>
          <div className="flex w-full flex-col gap-4 md:flex-row">
            <div className="flex w-full flex-col gap-1">
              <Label className="font-semibold">PoC Name</Label>
              <Input type="text" {...register("pocName")} disabled={!isAdmin} />
            </div>
            <div className="flex w-full flex-col gap-1">
              <Label className="font-semibold">PoC Email</Label>
              <Input type="email" {...register("email")} disabled={!isAdmin} />
            </div>
          </div>
        </div>
      </Card>
      {isAdmin && (
        <div className="flex flex-row justify-between gap-4 pt-2">
          <Button onClick={convertToDemo}>
            <Presentation className="h-4 w-4" />
            Convert to demo
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete submission</TooltipContent>
          </Tooltip>
        </div>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={() => {
                deleteMutation
                  .mutateAsync(submission.id)
                  .then(() => {
                    setDeleteDialogOpen(false);
                    toast.success("Submission successfully deleted");
                    onUpdate();
                  })
                  .catch((error) => {
                    toast.error(
                      `Failed to delete submission: ${error.message}`,
                    );
                  });
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
