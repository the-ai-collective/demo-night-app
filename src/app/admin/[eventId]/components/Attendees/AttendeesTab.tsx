"use client";

import { useDashboardContext } from "../../contexts/DashboardContext";
import { AnimatePresence } from "framer-motion";
import { Copy, Trash } from "lucide-react";
import React from "react";
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

  const filteredAttendees = event?.attendees.filter(
    (attendee) =>
      (attendee.name?.toLowerCase() ?? "").includes(
        searchFilter.toLowerCase(),
      ) ||
      (attendee.email?.toLowerCase() ?? "").includes(
        searchFilter.toLowerCase(),
      ) ||
      attendee.type?.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredAttendees?.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={4}
                    className="h-24 text-center italic text-muted-foreground/50"
                  >
                    No attendees (yet!)
                  </td>
                </TableRow>
              ) : (
                filteredAttendees?.map((attendee) => (
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
                                className="text-green-600"
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
            setSelectedAttendeeId(null);
          }}
        />
      )}
    </div>
  );
}
