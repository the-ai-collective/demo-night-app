import { useDashboardContext } from "../../contexts/DashboardContext";
import CsvButton from "../CsvButton";
import { UpdateIndexDialog } from "../UpdateIndexDialog";
import { type Demo } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  LinkIcon,
  Pencil,
  Plus,
  QrCode,
  Trash,
  TrophyIcon,
} from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
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

import DemoSheet from "./DemoSheet";

const DEMO_CSV_HEADERS = [
  "id",
  "name",
  "description",
  "email",
  "url",
  "votable",
  "feedbackUrl",
];

export function DemosTab() {
  const { event, refetchEvent } = useDashboardContext();
  const upsertMutation = api.demo.upsert.useMutation();
  const setDemosMutation = api.demo.setDemos.useMutation();
  const [demoSheetOpen, setDemoSheetOpen] = useState(false);

  if (!event) return null;

  const handleDemoUpdate = async (demo: Demo, updates: Partial<Demo>) => {
    try {
      await upsertMutation.mutateAsync({
        originalId: demo.id,
        id: demo.id,
        eventId: event.id,
        name: updates.name ?? demo.name,
        description: updates.description ?? demo.description ?? "",
        email: updates.email ?? demo.email ?? "",
        url: updates.url ?? demo.url ?? "",
        votable: updates.votable ?? demo.votable,
      });
      toast.success("Successfully updated demo!");
      refetchEvent();
    } catch (error) {
      toast.error(`Failed to update demo: ${(error as Error).message}`);
    }
  };

  const onUploadDemos = (rows: Record<string, string>[]) => {
    setDemosMutation
      .mutateAsync({
        eventId: event.id,
        demos: rows.map((row) => ({
          id: row.id,
          name: row.name!,
          description: row.description!,
          email: row.email!,
          url: row.url!,
          votable: !["0", "false", "FALSE"].includes(row.votable ?? ""),
        })),
      })
      .then(() => {
        toast.success("Demos updated!");
        refetchEvent();
      })
      .catch((e) => {
        toast.error("Failed to update demos: " + e.message);
      });
  };

  const demosWithFeedbackUrl = event.demos.map((demo) => ({
    id: demo.id,
    name: escapeCsvField(demo.name),
    description: escapeCsvField(demo.description),
    email: escapeCsvField(demo.email),
    url: escapeCsvField(demo.url),
    votable: demo.votable,
    feedbackUrl: `${window.location.origin}/${event.id}/${demo.id}?secret=${demo.secret}`,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
      <div className="flex items-end justify-between">
        <div className="flex items-end justify-start gap-2">
          <SidebarTrigger className="p-5 md:hidden" />
          <h2 className="text-2xl font-semibold">Demos</h2>
        </div>
        <CsvButton
          data={demosWithFeedbackUrl}
          headers={DEMO_CSV_HEADERS}
          filename="demos.csv"
          onUpload={onUploadDemos}
        />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <DemoSheet
          eventId={event.id}
          open={demoSheetOpen}
          onOpenChange={setDemoSheetOpen}
          onSubmit={(_: Demo) => {
            refetchEvent();
            setDemoSheetOpen(false);
          }}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="max-w-0">Name</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {event.demos.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={3}
                    className="h-24 text-center italic text-muted-foreground/50"
                  >
                    No demos (yet!)
                  </td>
                </TableRow>
              ) : (
                event.demos.map((demo) => (
                  <DemoRow
                    key={demo.id}
                    demo={demo}
                    eventId={event.id}
                    onUpdate={(updates) => handleDemoUpdate(demo, updates)}
                    refetchEvent={refetchEvent}
                  />
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setDemoSheetOpen(true)}>
          <Plus className="h-4 w-4" />
          Demo
        </Button>
      </div>
    </div>
  );
}

function DemoRow({
  demo,
  eventId,
  onUpdate: _,
  refetchEvent,
}: {
  demo: Demo;
  eventId: string;
  onUpdate: (updates: Partial<Demo>) => void;
  refetchEvent: () => void;
}) {
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateIndexDialogOpen, setUpdateIndexDialogOpen] = useState(false);

  const copyUrl = () => {
    const url = `${window.location.origin}/${eventId}/${demo.id}?secret=${demo.secret}`;
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success("URL copied to clipboard!");
      },
      (err) => {
        toast.error("Failed to copy URL: " + err);
      },
    );
  };

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
          layoutId={`index-${demo.id}`}
          className="w-[50px] p-4 font-medium"
        >
          {demo.index + 1}
        </motion.td>
        <motion.td
          layout
          layoutId={`name-${demo.id}`}
          className="w-full p-4 py-2"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{demo.name}</span>
            {!demo.votable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <TrophyIcon className="h-4 w-4 shrink-0 text-destructive" />
                </TooltipTrigger>
                <TooltipContent>Not eligible for awards</TooltipContent>
              </Tooltip>
            )}
          </div>
        </motion.td>
        <motion.td layout layoutId={`actions-${demo.id}`} className="p-4 py-2">
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
                <TooltipContent>Edit demo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl();
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy demo URL</TooltipContent>
              </Tooltip>

              <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl();
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="flex w-auto flex-col items-center gap-2 p-4">
                  <QRCode
                    size={150}
                    value={`${window.location.origin}/${eventId}/${demo.id}?secret=${demo.secret}`}
                  />
                  <p className="text-sm text-muted-foreground">
                    Scan to edit demo
                  </p>
                </HoverCardContent>
              </HoverCard>

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
                <TooltipContent>Change demo order</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete demo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.td>
      </motion.tr>
      <DemoSheet
        demo={demo}
        eventId={eventId}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={(_) => {
          refetchEvent();
          setEditSheetOpen(false);
        }}
      />
      <UpdateIndexDialog
        item={demo}
        type="demo"
        open={updateIndexDialogOpen}
        onOpenChange={setUpdateIndexDialogOpen}
      />
      <DeleteDemoDialog
        demo={demo}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={refetchEvent}
      />
    </>
  );
}

function DeleteDemoDialog({
  demo,
  open,
  onOpenChange,
  onDeleted,
}: {
  demo: Demo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const deleteMutation = api.demo.delete.useMutation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Demo?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this demo? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() => {
              deleteMutation
                .mutateAsync(demo.id)
                .then(() => {
                  onOpenChange(false);
                  toast.success("Demo successfully deleted");
                  onDeleted();
                })
                .catch((error) => {
                  toast.error(`Failed to delete demo: ${error.message}`);
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
