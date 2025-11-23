import { useDashboardContext } from "../../contexts/DashboardContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleCheck,
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  RotateCcw,
  TriangleAlert,
  TrophyIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EventPhase } from "~/lib/types/currentEvent";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type EventConfig } from "~/lib/types/eventConfig";

import { Button } from "~/components/ui/button";
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

import { env } from "~/env";

const REFRESH_INTERVAL =
  env.NEXT_PUBLIC_NODE_ENV === "development" ? 5_000 : 5_000;

export default function AwardsAndVotingTab() {
  const { event, currentEvent, refetchEvent } = useDashboardContext();
  const config = event?.config as EventConfig;
  const isPitchNight = config?.isPitchNight ?? false;
  const isResultsPhase =
    event?.id === currentEvent?.id &&
    currentEvent?.phase === EventPhase.Results;
  const [selectedAwardId, setSelectedAwardId] = useState<string | undefined>(
    event?.awards[0]?.id,
  );
  const { data: votes, refetch: refetchVotes } = api.award.getVotes.useQuery(
    selectedAwardId ?? "",
    {
      enabled: !!selectedAwardId,
      refetchInterval:
        currentEvent?.id === event?.id ? REFRESH_INTERVAL : false,
    },
  );
  const updateWinnerMutation = api.award.updateWinner.useMutation();
  const updateCurrentStateMutation = api.event.updateCurrentState.useMutation();

  const selectedAward = useMemo(() => {
    if (!event) return undefined;
    return event.awards.find((award) => award.id === selectedAwardId);
  }, [event, selectedAwardId]);

  const votesByDemoId = useMemo(() => {
    if (!event || !votes) return new Map();
    const map = new Map(
      event.demos
        .filter((demo) => demo.votable !== false)
        .map((demo) => [demo.id, 0]),
    );
    votes?.forEach((vote) => {
      if (!vote.demoId) return;
      // For pitch nights, sum investment amounts; for demo nights, count votes
      const value = isPitchNight && vote.amount ? vote.amount : 1;
      map.set(vote.demoId, (map.get(vote.demoId) ?? 0) + value);
    });
    return map;
  }, [event, votes, isPitchNight]);

  if (!event) return null;

  const handleSelectWinner = (demoId: string | null) => {
    if (!selectedAwardId) return;
    updateWinnerMutation
      .mutateAsync({ id: selectedAwardId, winnerId: demoId })
      .then(() => {
        refetchEvent();
        refetchVotes();
      });
  };

  const currentAwardIndex = event.awards.findIndex(
    (a) => a.id === currentEvent?.currentAwardId,
  );

  return (
    <ResizablePanelGroup direction="horizontal" className="size-full">
      <ResizablePanel defaultSize={50} minSize={10} className="space-y-2">
        <div className="flex items-center justify-start gap-2">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-2xl font-semibold">Awards</h2>
        </div>
        <div className="max-h-[calc(100vh-122px)] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0">
              <TableRow>
                <TableHead className="h-12 w-1/2 px-4">Name</TableHead>
                <TableHead className="h-12 w-1/2 px-4">Winner</TableHead>
                {isResultsPhase && (
                  <TableHead className="h-12 px-4">Reveal</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.awards.map((award, index) => (
                <TableRow
                  key={award.id}
                  className={cn(
                    "cursor-pointer",
                    selectedAwardId === award.id && "bg-accent",
                  )}
                  onClick={() => setSelectedAwardId(award.id)}
                >
                  <TableCell className="p-4">
                    <div className="flex flex-col gap-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {award.name}
                        </span>
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
                  </TableCell>
                  <TableCell className="p-4">
                    {award.winnerId ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CircleCheck className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">
                          {
                            event.demos.find(
                              (demo) => demo.id === award.winnerId,
                            )?.name
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <TriangleAlert className="h-4 w-4 text-yellow-500" />
                        <span className="italic text-muted-foreground">
                          None selected
                        </span>
                      </div>
                    )}
                  </TableCell>
                  {isResultsPhase && (
                    <TableCell className="p-4">
                      <RevealButton
                        state={determineRevealState(
                          index,
                          currentAwardIndex,
                          event.awards.length,
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          const shouldHide =
                            currentEvent?.currentAwardId === award.id;
                          updateCurrentStateMutation
                            .mutateAsync({
                              currentAwardId: shouldHide
                                ? event.awards[index + 1]?.id ?? null
                                : award.id,
                            })
                            .then(refetchEvent);
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ResizablePanel>
      <ResizableHandle className="bg-transparent pl-2" />
      <ResizablePanel minSize={10} className="pl-2">
        <div className="flex min-w-[300px] flex-col gap-2">
          <div className="flex flex-col items-start gap-1">
            <div className="flex w-full items-center justify-between gap-2">
              <h2 className="line-clamp-1 text-2xl font-semibold">
                {selectedAward?.name
                  ? `${isPitchNight ? "Investments" : "Votes"} for ${selectedAward.name}`
                  : isPitchNight ? "Investments" : "Votes"}
                <span> ({votes?.length ?? 0} total)</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* TODO: Re-enable when calculateAccuracy mutation is implemented
                {(currentEvent?.phase === EventPhase.Results || currentEvent?.phase === EventPhase.Recap) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!event?.id) return;
                          calculateAccuracyMutation.mutateAsync({ eventId: event.id }).then(() => {
                            refetchEvent();
                          });
                        }}
                        disabled={calculateAccuracyMutation.isPending}
                      >
                        🔮 Calculate Accuracy
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Calculate prediction accuracy for all attendees</TooltipContent>
                  </Tooltip>
                )}
                */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleSelectWinner(null)}
                      disabled={!selectedAward?.winnerId}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deselect winner</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="h-full max-h-[calc(100vh-122px)] overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0">
                <TableRow>
                  <TableHead>Demo</TableHead>
                  <TableHead className="w-[100px] text-right">
                    {isPitchNight ? "Invested" : "Votes"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {Array.from(votesByDemoId.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([demoId, voteCount]) => {
                      return (
                        <motion.tr
                          key={demoId}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={cn(
                            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                            "cursor-pointer",
                            selectedAward?.winnerId === demoId && "bg-accent",
                          )}
                          onClick={() => handleSelectWinner(demoId)}
                        >
                          <TableCell className="flex items-center justify-start gap-2 font-medium">
                            {selectedAward?.winnerId === demoId && (
                              <CircleCheck className="h-4 w-4 text-green-500" />
                            )}
                            <span
                              className={cn(
                                selectedAward?.winnerId === demoId &&
                                  "font-semibold",
                              )}
                            >
                              {
                                event.demos.find((demo) => demo.id === demoId)
                                  ?.name
                              }
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {isPitchNight ? `$${(voteCount / 1000).toFixed(0)}k` : voteCount}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

enum RevealButtonAction {
  Locked = "LOCKED",
  Reveal = "REVEAL",
  Hide = "HIDE",
  Revealed = "REVEALED",
}

const config: Record<
  RevealButtonAction,
  {
    icon: React.ComponentType<{ className?: string }>;
    tooltip: string;
    allowClick: boolean;
  }
> = {
  [RevealButtonAction.Locked]: {
    icon: LockIcon,
    tooltip: "Locked. Reveal the previous award first!",
    allowClick: false,
  },
  [RevealButtonAction.Reveal]: {
    icon: EyeIcon,
    tooltip: "Click to reveal winner!",
    allowClick: true,
  },
  [RevealButtonAction.Hide]: {
    icon: EyeOffIcon,
    tooltip: "Currently revealed. Click to re-hide",
    allowClick: true,
  },
  [RevealButtonAction.Revealed]: {
    icon: CircleCheckIcon,
    tooltip: "Already revealed",
    allowClick: false,
  },
};

interface RevealButtonProps {
  state: RevealButtonAction;
  onClick: (e: React.MouseEvent) => void;
}

function RevealButton({ state, onClick }: RevealButtonProps) {
  const { icon: Icon, tooltip, allowClick } = config[state];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "size-8",
            state === RevealButtonAction.Reveal &&
              "animate-pulse-border border-2",
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!allowClick) return;
            onClick(e);
          }}
        >
          <Icon
            className={cn("h-4 w-4", !allowClick && "text-muted-foreground")}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function determineRevealState(
  awardIndex: number,
  currentAwardIndex: number,
  totalAwards: number,
): RevealButtonAction {
  // If no award is currently revealed (currentAwardIndex is -1)
  // The last award should be next
  if (currentAwardIndex === -1) {
    return awardIndex === totalAwards - 1
      ? RevealButtonAction.Reveal
      : RevealButtonAction.Locked;
  }

  // If this is the currently revealed award, it can be hidden
  if (awardIndex === currentAwardIndex) {
    return RevealButtonAction.Hide;
  }

  // If this award comes after the currently revealed award
  // The next award in sequence should be marked as next
  if (awardIndex === currentAwardIndex - 1) {
    return RevealButtonAction.Reveal;
  }

  // If this award comes before or at the current award index
  // It has already been revealed
  if (awardIndex > currentAwardIndex) {
    return RevealButtonAction.Revealed;
  }

  // Otherwise, this award is locked (comes later in sequence)
  return RevealButtonAction.Locked;
}
