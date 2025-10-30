import { useDashboardContext } from "../../contexts/DashboardContext";
import CsvButton from "../CsvButton";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { eventConfigSchema } from "~/lib/types/eventConfig";
import { type Partner } from "~/lib/types/partner";
import { type QuickAction } from "~/lib/types/quickAction";
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

import PartnerSheet from "./PartnerSheet";
import QuickActionSheet from "./QuickActionSheet";

const PARTNER_CSV_HEADERS = ["name", "description", "url", "email"];
const QUICK_ACTION_CSV_HEADERS = ["id", "icon", "description"];

export function ConfigurationTab() {
  const { event, refetchEvent, config } = useDashboardContext();
  const [partnerSheetOpen, setPartnerSheetOpen] = useState(false);
  const [quickActionSheetOpen, setQuickActionSheetOpen] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState(config.surveyUrl ?? "");
  const [isEditingSurvey, setIsEditingSurvey] = useState(false);
  const upsertMutation = api.event.upsert.useMutation();

  if (!event) return null;

  const handleSaveSurveyUrl = () => {
    upsertMutation
      .mutateAsync({
        originalId: event.id,
        config: {
          ...config,
          surveyUrl: surveyUrl || undefined,
        },
      })
      .then(() => {
        toast.success("Survey URL updated!");
        setIsEditingSurvey(false);
        refetchEvent();
      })
      .catch((e) => {
        toast.error("Failed to update survey URL: " + e.message);
      });
  };

  const onUploadPartners = (rows: Record<string, string>[]) => {
    const newPartners = rows.map((row) => {
      if (!row.name || !row.description || !row.url) {
        throw new Error("Name, description, and URL are required fields");
      }
      return {
        name: row.name,
        description: row.description,
        url: row.url,
        email: row.email ?? undefined,
      };
    });

    upsertMutation
      .mutateAsync({
        originalId: event.id,
        config: {
          ...config,
          partners: newPartners,
        },
      })
      .then(() => {
        toast.success("Partners updated!");
        refetchEvent();
      })
      .catch((e) => {
        toast.error("Failed to update partners: " + e.message);
      });
  };

  const onUploadQuickActions = (rows: Record<string, string>[]) => {
    const newQuickActions = rows.map((row) => {
      if (!row.id || !row.icon || !row.description) {
        throw new Error("ID, icon, and description are required fields");
      }
      return {
        id: row.id,
        icon: row.icon,
        description: row.description,
      };
    });

    upsertMutation
      .mutateAsync({
        originalId: event.id,
        config: {
          ...config,
          quickActions: newQuickActions,
        },
      })
      .then(() => {
        toast.success("Quick Actions updated!");
        refetchEvent();
      })
      .catch((e) => {
        toast.error("Failed to update quick actions: " + e.message);
      });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Event Survey</h2>
        </div>
        <div className="flex flex-col gap-2 rounded-md border p-4">
          <p className="text-sm text-muted-foreground">
            Optional external survey link (e.g., Google Form) shown to attendees
            during voting and recap phases.
          </p>
          {isEditingSurvey ? (
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={surveyUrl}
                onChange={(e) => setSurveyUrl(e.target.value)}
                placeholder="https://forms.gle/..."
                className="rounded-md border border-gray-200 p-2"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSurveyUrl(config.surveyUrl ?? "");
                    setIsEditingSurvey(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveSurveyUrl}
                  disabled={upsertMutation.isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {config.surveyUrl ? (
                  <a
                    href={config.surveyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {config.surveyUrl}
                  </a>
                ) : (
                  <span className="italic text-muted-foreground">
                    No survey URL set
                  </span>
                )}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingSurvey(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="flex items-end justify-start gap-2">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
          </div>
          <CsvButton
            data={config.quickActions}
            headers={QUICK_ACTION_CSV_HEADERS}
            filename="quick-actions.csv"
            onUpload={onUploadQuickActions}
          />
        </div>
        <div className="overflow-x-auto rounded-md border">
          <QuickActionSheet
            eventId={event.id}
            open={quickActionSheetOpen}
            onOpenChange={setQuickActionSheetOpen}
            onSubmit={(_: QuickAction) => {
              refetchEvent();
              setQuickActionSheetOpen(false);
            }}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="w-[50px]">Icon</TableHead>
                <TableHead className="max-w-0">Description</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {config.quickActions.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={4}
                    className="h-24 text-center italic text-muted-foreground/50"
                  >
                    No quick actions (yet!)
                  </td>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {config.quickActions.map((quickAction, index) => (
                    <QuickActionRow
                      key={quickAction.id}
                      quickAction={quickAction}
                      index={index}
                      eventId={event.id}
                      refetchEvent={refetchEvent}
                    />
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setQuickActionSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="flex items-end justify-start gap-2">
            <SidebarTrigger className="p-5 md:hidden" />
            <h2 className="text-2xl font-semibold">Hosts & Sponsors</h2>
          </div>
          <CsvButton
            data={config.partners}
            headers={PARTNER_CSV_HEADERS}
            filename="partners.csv"
            onUpload={onUploadPartners}
          />
        </div>
        <div className="overflow-x-auto rounded-md border">
          <PartnerSheet
            eventId={event.id}
            open={partnerSheetOpen}
            onOpenChange={setPartnerSheetOpen}
            onSubmit={(_: Partner) => {
              refetchEvent();
              setPartnerSheetOpen(false);
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
                {config.partners.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={4}
                      className="h-24 text-center italic text-muted-foreground/50"
                    >
                      No hosts or sponsors (yet!)
                    </td>
                  </TableRow>
                ) : (
                  config.partners.map((partner, index) => (
                    <PartnerRow
                      key={partner.name}
                      partner={partner}
                      index={index}
                      eventId={event.id}
                      refetchEvent={refetchEvent}
                    />
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setPartnerSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            Partner
          </Button>
        </div>
      </div>
    </div>
  );
}

function PartnerRow({
  partner,
  index,
  eventId,
  refetchEvent,
}: {
  partner: Partner;
  index: number;
  eventId: string;
  refetchEvent: () => void;
}) {
  const { event } = useDashboardContext();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const upsertMutation = api.event.upsert.useMutation();

  const handleDelete = async () => {
    if (!event) return;
    const config = eventConfigSchema.parse(event.config);
    try {
      await upsertMutation.mutateAsync({
        originalId: eventId,
        config: {
          ...config,
          partners: config.partners.filter((p) => p.name !== partner.name),
        },
      });
      setDeleteDialogOpen(false);
      toast.success("Partner successfully deleted");
      refetchEvent();
    } catch (error) {
      toast.error(`Failed to delete partner: ${(error as Error).message}`);
    }
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
        <motion.td className="w-[50px] p-4 py-2 font-medium">
          {index + 1}
        </motion.td>
        <motion.td
          layout
          layoutId={`name-${partner.name}`}
          className="w-full p-4 py-2 font-semibold"
        >
          {partner.name}
        </motion.td>
        <motion.td
          layout
          layoutId={`actions-${partner.name}`}
          className="p-4 py-2"
        >
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
                <TooltipContent>Edit partner</TooltipContent>
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
                <TooltipContent>Delete partner</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.td>
      </motion.tr>
      <PartnerSheet
        partner={partner}
        eventId={eventId}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={(_) => {
          refetchEvent();
          setEditSheetOpen(false);
        }}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this partner? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={handleDelete}
              disabled={upsertMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function QuickActionRow({
  quickAction,
  index,
  eventId,
  refetchEvent,
}: {
  quickAction: QuickAction;
  index: number;
  eventId: string;
  refetchEvent: () => void;
}) {
  const { event } = useDashboardContext();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const upsertMutation = api.event.upsert.useMutation();

  const handleDelete = async () => {
    if (!event) return;
    const config = eventConfigSchema.parse(event.config);
    try {
      await upsertMutation.mutateAsync({
        originalId: eventId,
        config: {
          ...config,
          quickActions: config.quickActions.filter(
            (q) => q.id !== quickAction.id,
          ),
        },
      });
      setDeleteDialogOpen(false);
      toast.success("Quick Action successfully deleted");
      refetchEvent();
    } catch (error) {
      toast.error(`Failed to delete quick action: ${(error as Error).message}`);
    }
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
        <motion.td className="w-[50px] p-4 py-2 font-medium">
          {index + 1}
        </motion.td>
        <motion.td
          layout
          layoutId={`icon-${quickAction.id}`}
          className="w-[50px] p-4 py-2 text-center text-xl"
        >
          {quickAction.icon}
        </motion.td>
        <motion.td
          layout
          layoutId={`description-${quickAction.id}`}
          className="w-full p-4 py-2"
        >
          {quickAction.description}
        </motion.td>
        <motion.td
          layout
          layoutId={`actions-${quickAction.id}`}
          className="p-4 py-2"
        >
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
                <TooltipContent>Edit quick action</TooltipContent>
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
                <TooltipContent>Delete quick action</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.td>
      </motion.tr>
      <QuickActionSheet
        quickAction={quickAction}
        eventId={eventId}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={(_) => {
          refetchEvent();
          setEditSheetOpen(false);
        }}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quick Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quick action? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: "destructive" }))}
              onClick={handleDelete}
              disabled={upsertMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
