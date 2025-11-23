import { useDashboardContext } from "../../contexts/DashboardContext";
import { LiveIndicator } from "../LiveIndicator";
import { type Demo } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { EyeIcon, Trash } from "lucide-react";
import { useMemo, useState } from "react";

import { feedbackScore } from "~/lib/feedback";
import { EventPhase } from "~/lib/types/currentEvent";
import { type QuickAction } from "~/lib/types/quickAction";
import { cn } from "~/lib/utils";
import { type FeedbackAndAttendee } from "~/server/api/routers/demo";
import { api } from "~/trpc/react";

import AttendeeTypeBadge from "~/components/AttendeeTypeBadge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
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
  TooltipTrigger,
} from "~/components/ui/tooltip";

import FeedbackOverview from "./FeedbackOverview";
import { env } from "~/env";

const REFRESH_INTERVAL =
  env.NEXT_PUBLIC_NODE_ENV === "development" ? 5_000 : 5_000;

export default function DemosAndFeedbackTab() {
  const { currentEvent, event, refetchEvent, config } = useDashboardContext();
  const isDemoPhase =
    currentEvent?.id === event?.id && currentEvent?.phase === EventPhase.Demos;
  const [selectedDemo, setSelectedDemo] = useState<Demo | undefined>(
    event?.demos.find((demo) => demo.id === currentEvent?.currentDemoId),
  );

  const votableIndices = useMemo(() => {
    if (!event) return new Map<string, number>();
    const votableDemos = event.demos.filter((d) => d.votable);
    return new Map(votableDemos.map((d, i) => [d.id, i + 1]));
  }, [event]);

  const { data: feedback, refetch: refetchFeedback } =
    api.demo.getFeedback.useQuery(selectedDemo?.id ?? "", {
      enabled: !!selectedDemo,
      refetchInterval:
        currentEvent?.id === event?.id ? REFRESH_INTERVAL : false,
    });
  // const { feedback, refetch: refetchFeedback } = useMockFeedback();

  const scoredFeedback = useMemo(() => {
    if (!feedback) return [];
    return feedback.sort((a, b) => feedbackScore(b) - feedbackScore(a));
  }, [feedback]);

  const updateCurrentEventStateMutation =
    api.event.updateCurrentState.useMutation();
  const deleteFeedbackMutation = api.feedback.delete.useMutation();

  if (!event) return null;

  return (
    <ResizablePanelGroup direction="horizontal" className="size-full">
      <ResizablePanel defaultSize={50} minSize={10} className="space-y-2">
        <div className="flex items-center justify-start gap-2">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-2xl font-semibold">Demos</h2>
        </div>
        <div className="max-h-[calc(100vh-122px)] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                  <TableRow
                    key={demo.id}
                    className={cn(
                      "cursor-pointer",
                      selectedDemo?.id === demo.id && "bg-accent",
                    )}
                    onClick={() => {
                      setSelectedDemo(demo);
                      if (isDemoPhase) {
                        updateCurrentEventStateMutation
                          .mutateAsync({ currentDemoId: demo.id })
                          .then(() => refetchEvent());
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      {demo.votable ? votableIndices.get(demo.id) : "-"}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <span className="line-clamp-1 font-semibold">
                        {demo.name}
                      </span>
                      {isDemoPhase &&
                        demo.id === currentEvent?.currentDemoId && (
                          <LiveIndicator />
                        )}
                    </TableCell>
                    <TableCell className="py-0">
                      {isDemoPhase && selectedDemo?.id !== demo.id && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDemo(demo);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sneak peek</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ResizablePanel>
      <ResizableHandle className="bg-transparent pl-2" />
      <ResizablePanel minSize={10} className="pl-2">
        <div className="flex min-w-[300px] flex-col gap-2">
          <div className="flex flex-col items-start gap-2">
            <h2 className="text-2xl font-semibold">
              {selectedDemo?.name
                ? `Feedback for ${selectedDemo.name}`
                : "Feedback"}
            </h2>
            <FeedbackOverview
              feedback={feedback ?? []}
              quickActions={config.quickActions}
            />
          </div>
          <div className="h-full max-h-[calc(100vh-122px)] space-y-2 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {feedback && feedback.length > 0 ? (
                scoredFeedback.map((item) => (
                  <FeedbackItem
                    key={item.id}
                    item={item}
                    quickActions={config.quickActions}
                    onDelete={(id) =>
                      deleteFeedbackMutation
                        .mutateAsync(id)
                        .then(() => refetchFeedback())
                    }
                  />
                ))
              ) : (
                <div className="p-10 text-center text-sm italic text-muted-foreground/50">
                  No feedback (yet!)
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function FeedbackItem({
  item,
  onDelete,
  quickActions,
}: {
  item: FeedbackAndAttendee;
  onDelete: (id: string) => void;
  quickActions: QuickAction[];
}) {
  const summaryString = useMemo(() => {
    const summary: string[] = [];
    if (item.rating) {
      summary.push(String.fromCodePoint(48 + item.rating, 65039, 8419));
    }
    if (item.claps) {
      summary.push(`👏<span class="text-xs text-black"> x${item.claps}</span>`);
    }
    if (item.tellMeMore) {
      summary.push("📬");
    }
    quickActions.forEach((action) => {
      if (item.quickActions.includes(action.id)) {
        summary.push(action.icon);
      }
    });
    return summary.join(" • ");
  }, [item, quickActions]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "line-clamp-1 font-semibold",
                item.attendee.name?.length ?? 0 > 0
                  ? "text-black"
                  : "italic text-muted-foreground",
              )}
            >
              {item.attendee.name?.length ?? 0 > 0
                ? item.attendee.name
                : "Anonymous"}
            </span>
            <AttendeeTypeBadge type={item.attendee.type} />
            <p
              className="shrink-0 font-semibold text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: `${summaryString ? `• ${summaryString}` : ""}`,
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onDelete(item.id)}
          >
            <Trash className="h-4 w-4 stroke-muted-foreground" />
          </Button>
        </CardHeader>
        <CardContent className="-mt-4 p-4 pt-0">
          {item.comment && (
            <p className="text-sm italic">&ldquo;{item.comment}&rdquo;</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
