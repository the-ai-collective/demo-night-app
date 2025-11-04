import { useDashboardContext } from "../../contexts/DashboardContext";
import CsvButton from "../CsvButton";
import { UpdateIndexDialog } from "../UpdateIndexDialog";
import { type Award } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Pencil, Plus, Trash, TrophyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type EventConfig } from "~/lib/types/eventConfig";
import { escapeCsvField } from "~/lib/csvUtils";

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
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  Table,
  TableBody,
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

import AwardSheet from "./AwardSheet";

const AWARD_CSV_HEADERS = ["id", "name", "description", "votable"];

export function AwardsTab() {
  const { event, refetchEvent } = useDashboardContext();
  const upsertMutation = api.award.upsert.useMutation();
  const setAwardsMutation = api.award.setAwards.useMutation();
  const [awardSheetOpen, setAwardSheetOpen] = useState(false);

  if (!event) return null;

  const config = event.config as EventConfig;
  const isPitchNight = config?.isPitchNight ?? false;

  const handleAwardUpdate = async (award: Award, updates: Partial<Award>) => {
    try {
      await upsertMutation.mutateAsync({
        originalId: award.id,
        id: award.id,
        eventId: event.id,
        name: updates.name ?? award.name,
        description: updates.description ?? award.description,
        votable: updates.votable ?? award.votable,
      });
      toast.success("Successfully updated award!");
      refetchEvent();
    } catch (error) {
      toast.error(`Failed to update award: ${(error as Error).message}`);
    }
  };

  const onUploadAwards = (rows: Record<string, string>[]) => {
    setAwardsMutation
      .mutateAsync({
        eventId: event.id,
        awards: rows.map((row) => ({
          id: row.id,
          name: row.name!,
          description: row.description!,
          votable: !["0", "false", "FALSE"].includes(row.votable ?? ""),
        })),
      })
      .then(() => {
        toast.success("Awards updated!");
        refetchEvent();
      })
      .catch((e) => {
        toast.error("Failed to update awards: " + e.message);
      });
  };

  const awardsData = event.awards.map((award) => ({
    id: award.id,
    name: escapeCsvField(award.name),
    description: escapeCsvField(award.description),
    votable: award.votable,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-end justify-start gap-2">
          <SidebarTrigger className="p-5 md:hidden" />
          <h2 className="text-2xl font-semibold">Awards</h2>
        </div>
        <CsvButton
          data={awardsData}
          headers={AWARD_CSV_HEADERS}
          filename="awards.csv"
          onUpload={onUploadAwards}
        />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <AwardSheet
          eventId={event.id}
          isPitchNight={isPitchNight}
          open={awardSheetOpen}
          onOpenChange={setAwardSheetOpen}
          onSubmit={(_: Award) => {
            refetchEvent();
            setAwardSheetOpen(false);
          }}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="max-w-0">Name</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {event.awards.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={3}
                    className="h-24 text-center italic text-muted-foreground/50"
                  >
                    No awards (yet!)
                  </td>
                </TableRow>
              ) : (
                event.awards.map((award) => (
                  <AwardRow
                    key={award.id}
                    award={award}
                    eventId={event.id}
                    isPitchNight={isPitchNight}
                    onUpdate={(updates) => handleAwardUpdate(award, updates)}
                    refetchEvent={refetchEvent}
                  />
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setAwardSheetOpen(true)}>
          <Plus className="h-4 w-4" />
          Award
        </Button>
      </div>
    </div>
  );
}

function AwardRow({
  award,
  eventId,
  isPitchNight,
  onUpdate: _,
  refetchEvent,
}: {
  award: Award;
  eventId: string;
  isPitchNight: boolean;
  onUpdate: (updates: Partial<Award>) => void;
  refetchEvent: () => void;
}) {
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateIndexDialogOpen, setUpdateIndexDialogOpen] = useState(false);

  return (
    <>
      <motion.tr
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setEditSheetOpen(true)}
        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
      >
        <motion.td
          layout
          layoutId={`index-${award.id}`}
          className="p-4 font-medium"
        >
          {award.index + 1}
        </motion.td>
        <motion.td
          layout
          layoutId={`name-${award.id}`}
          className="w-full p-4 py-2"
        >
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{award.name}</span>
              {!award.votable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TrophyIcon className="h-4 w-4 shrink-0 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>Not votable</TooltipContent>
                </Tooltip>
              )}
            </div>
            <span className="italic text-muted-foreground">
              {award.description}
            </span>
          </div>
        </motion.td>
        <motion.td layout layoutId={`actions-${award.id}`} className="p-4 py-2">
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditSheetOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit award</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUpdateIndexDialogOpen(true);
                    }}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Change award order</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete award</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.td>
      </motion.tr>
      <AwardSheet
        award={award}
        eventId={eventId}
        isPitchNight={isPitchNight}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={(_: Award) => {
          refetchEvent();
          setEditSheetOpen(false);
        }}
      />
      <UpdateIndexDialog
        item={award}
        type="award"
        open={updateIndexDialogOpen}
        onOpenChange={setUpdateIndexDialogOpen}
      />
      <DeleteAwardDialog
        award={award}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={refetchEvent}
      />
    </>
  );
}

function DeleteAwardDialog({
  award,
  open,
  onOpenChange,
  onDeleted,
}: {
  award: Award;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const deleteMutation = api.award.delete.useMutation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Award</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this award? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => {
              deleteMutation
                .mutateAsync(award.id)
                .then(() => {
                  onOpenChange(false);
                  toast.success("Award successfully deleted");
                  onDeleted();
                })
                .catch((error) => {
                  toast.error(`Failed to delete award: ${error.message}`);
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
