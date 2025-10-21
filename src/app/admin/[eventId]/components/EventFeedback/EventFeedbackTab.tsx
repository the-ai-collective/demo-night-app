import { useDashboardContext } from "../../contexts/DashboardContext";
import { AnimatePresence } from "framer-motion";
import { Copy, Trash } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
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
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { env } from "~/env";

const REFRESH_INTERVAL =
  env.NEXT_PUBLIC_NODE_ENV === "development" ? 1_000 : 5_000;

function copyCommentToClipboard(comment: string | null) {
  if (!comment) {
    toast.error("No comment to copy");
    return;
  }
  navigator.clipboard.writeText(comment).then(
    () => {
      toast.success("Comment copied to clipboard!");
    },
    (err) => {
      toast.error("Failed to copy comment: " + err);
    },
  );
}

export default function EventFeedbackTab() {
  const { event, currentEvent } = useDashboardContext();
  const [searchFilter, setSearchFilter] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = React.useState<
    string | null
  >(null);

  const { data: eventFeedback } = api.eventFeedback.getAdmin.useQuery(
    event?.id ?? "",
    {
      enabled: !!event?.id,
      refetchInterval:
        currentEvent?.id === event?.id ? REFRESH_INTERVAL : false,
    },
  );

  const deleteMutation = api.eventFeedback.delete.useMutation({
    onSuccess: () => {
      toast.success("Feedback deleted successfully");
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete feedback: ${error.message}`);
    },
  });

  const filteredFeedback =
    eventFeedback?.filter(
      (feedback) =>
        (feedback.attendee.name?.toLowerCase() ?? "").includes(
          searchFilter.toLowerCase(),
        ) ||
        (feedback.attendee.type?.toLowerCase() ?? "").includes(
          searchFilter.toLowerCase(),
        ) ||
        (feedback.comment?.toLowerCase() ?? "").includes(
          searchFilter.toLowerCase(),
        ),
    ) ?? [];

  const handleDelete = async () => {
    if (!selectedFeedbackId) return;
    await deleteMutation.mutateAsync(selectedFeedbackId);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="p-5 md:hidden" />
          <h2 className="text-2xl font-semibold">Event Feedback</h2>
        </div>
        <Input
          placeholder="Search by name, type, or comment..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attendee</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredFeedback?.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={3}
                    className="h-24 text-center italic text-muted-foreground/50"
                  >
                    No feedback (yet!)
                  </td>
                </TableRow>
              ) : (
                filteredFeedback?.map((feedback) => (
                  <TableRow key={feedback.id} className="group">
                    <TableCell>
                      {feedback.attendee.name ? (
                        <span className="line-clamp-1">
                          {feedback.attendee.name}
                        </span>
                      ) : (
                        <span className="line-clamp-1 italic text-muted-foreground">
                          Anonymous
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="whitespace-pre-wrap">
                        {feedback.comment ? (
                          <span className="italic">
                            &ldquo;{feedback.comment}&rdquo;
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground">
                            No comment
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyCommentToClipboard(feedback.comment)
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy comment</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => {
                                  setSelectedFeedbackId(feedback.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete feedback</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
