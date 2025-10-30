"use client";

import { useDashboardContext } from "../../contexts/DashboardContext";
import { AnimatePresence } from "framer-motion";
import { Copy, Trash } from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import AttendeeTypeBadge from "~/components/AttendeeTypeBadge";
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

function copyIdToClipboard(id: string) {
  navigator.clipboard.writeText(id).then(
    () => {
      toast.success("ID copied to clipboard!");
    },
    (err) => {
      toast.error("Failed to copy ID: " + err);
    },
  );
}

function DeleteAttendeeDialog({
  attendeeId,
  open,
  onOpenChange,
  onDeleted,
}: {
  attendeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const deleteMutation = api.attendee.delete.useMutation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Attendee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this attendee? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => {
              deleteMutation
                .mutateAsync(attendeeId)
                .then(() => {
                  onOpenChange(false);
                  toast.success("Attendee successfully deleted");
                  onDeleted();
                })
                .catch((error) => {
                  toast.error(`Failed to delete attendee: ${error.message}`);
                });
            }}
            disabled={deleteMutation.isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AttendeesTab() {
  const { event, refetchEvent } = useDashboardContext();
  const [searchFilter, setSearchFilter] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedAttendeeId, setSelectedAttendeeId] = React.useState<
    string | null
  >(null);

  // Fetch attendee analytics data only when this tab is active
  const {
    data: attendeesWithAnalytics,
    isLoading,
    refetch: refetchAnalytics,
  } = api.attendee.getAnalytics.useQuery(event?.id ?? "", {
    enabled: !!event?.id,
  });

  const filteredAttendees = attendeesWithAnalytics?.filter(
    (attendee) =>
      (attendee.name?.toLowerCase() ?? "").includes(
        searchFilter.toLowerCase(),
      ) ||
      (attendee.email?.toLowerCase() ?? "").includes(
        searchFilter.toLowerCase(),
      ) ||
      attendee.type?.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  const stats = useMemo(() => {
    if (!filteredAttendees) return null;

    const totalAttendees = filteredAttendees.length;
    const surveyOpened = filteredAttendees.filter(
      (a) => a.eventFeedback[0]?.surveyOpened,
    ).length;
    const totalFeedback = filteredAttendees.reduce(
      (sum, a) => sum + a._count.feedback,
      0,
    );
    const avgFeedback =
      totalAttendees > 0 ? (totalFeedback / totalAttendees).toFixed(1) : "0";
    const hasVoted = filteredAttendees.filter((a) => a._count.votes > 0).length;

    return { totalAttendees, surveyOpened, avgFeedback, hasVoted };
  }, [filteredAttendees]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="p-5 md:hidden" />
          <h2 className="text-2xl font-semibold">Attendees</h2>
        </div>
        <Input
          placeholder="Search by name, type, or email..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Attendees</p>
            <p className="text-2xl font-bold">{stats.totalAttendees}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Survey Opened</p>
            <p className="text-2xl font-bold">{stats.surveyOpened}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Avg Feedback</p>
            <p className="text-2xl font-bold">{stats.avgFeedback}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Voted</p>
            <p className="text-2xl font-bold">{stats.hasVoted}</p>
          </Card>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Survey</TableHead>
              <TableHead className="text-center">Feedback</TableHead>
              <TableHead className="text-center">Votes</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {isLoading ? (
                <TableRow>
                  <td
                    colSpan={7}
                    className="h-24 text-center italic text-muted-foreground/50"
                  >
                    Loading attendees...
                  </td>
                </TableRow>
              ) : !filteredAttendees || filteredAttendees.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={7}
                    className="h-24 text-center italic text-muted-foreground/50"
                  >
                    No attendees (yet!)
                  </td>
                </TableRow>
              ) : (
                filteredAttendees.map((attendee) => (
                  <TableRow key={attendee.id} className="group">
                    <TableCell>
                      {attendee.name ? (
                        <span className="line-clamp-1">{attendee.name}</span>
                      ) : (
                        <span className="line-clamp-1 italic text-gray-400">
                          Anonymous
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AttendeeTypeBadge type={attendee.type} />
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1">{attendee.email}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {attendee.eventFeedback[0]?.surveyOpened ? (
                        <span className="font-semibold text-green-600">
                          ✓ Opened
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {attendee._count.feedback > 0 ? (
                        <span className="font-medium">
                          {attendee._count.feedback}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {attendee._count.votes > 0 ? (
                        <span className="font-medium">
                          {attendee._count.votes}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyIdToClipboard(attendee.id)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy attendee ID</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedAttendeeId(attendee.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete attendee</TooltipContent>
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
      {selectedAttendeeId && (
        <DeleteAttendeeDialog
          attendeeId={selectedAttendeeId}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={() => {
            refetchEvent();
            void refetchAnalytics();
            setSelectedAttendeeId(null);
          }}
        />
      )}
    </div>
  );
}
