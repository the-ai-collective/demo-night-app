import { useDashboardContext } from "../../contexts/DashboardContext";
import { AdminTab } from "../AdminSidebar";
import { AlertTriangle, CircleCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EventPhase, displayName } from "~/lib/types/currentEvent";
import { type EventConfig } from "~/lib/types/eventConfig";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import AwardsAndVotingTab from "./AwardsAndVotingTab";
import DemosAndFeedbackTab from "./DemosAndFeedbackTab";
import { phaseConfigs } from "./PhaseConfig";

export default function ControlCenterTab({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: AdminTab;
  setSelectedTab: (tab: AdminTab) => void;
}) {
  const { currentEvent, event, refetchEvent } = useDashboardContext();
  const eventConfig = event?.config as EventConfig;
  const isPitchNight = eventConfig?.isPitchNight ?? false;
  const updateCurrentStateMutation = api.event.updateCurrentState.useMutation();
  const [suggestedPhase, setSuggestedPhase] = useState<EventPhase | null>(null);

  const setPhase = useCallback(
    (phase: EventPhase) => {
      updateCurrentStateMutation
        .mutateAsync({ phase })
        .then(() => refetchEvent());
    },
    [updateCurrentStateMutation, refetchEvent],
  );

  useEffect(() => {
    if (!currentEvent?.phase) return;

    if (
      currentEvent.phase === EventPhase.Voting ||
      currentEvent.phase === EventPhase.Results
    ) {
      setSelectedTab(AdminTab.AwardsAndVoting);
    } else {
      setSelectedTab(AdminTab.DemosAndFeedback);
    }
  }, [currentEvent?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    switch (currentEvent?.phase) {
      case EventPhase.Pre:
        if (
          currentEvent.currentDemoId === null ||
          currentEvent?.currentDemoId === event?.demos[0]?.id
        ) {
          setSuggestedPhase(EventPhase.Demos);
          return;
        }
        break;
      case EventPhase.Demos:
        const lastDemo = event?.demos[event.demos.length - 1];
        if (currentEvent?.currentDemoId === lastDemo?.id) {
          setSuggestedPhase(EventPhase.Voting);
          return;
        }
        break;
      case EventPhase.Voting:
        if (event?.awards.every((award) => award.winnerId)) {
          setSuggestedPhase(EventPhase.Results);
          return;
        }
        break;
      case EventPhase.Results:
        if (currentEvent?.currentAwardId === event?.awards[0]?.id) {
          setSuggestedPhase(EventPhase.Recap);
          return;
        }
        break;
      default:
        setSuggestedPhase(null);
    }
    setSuggestedPhase(null);
  }, [currentEvent, event?.demos, event?.awards]);

  if (!event) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      {currentEvent && currentEvent.id === event.id && (
        <TooltipProvider>
          <div className="flex w-full flex-row items-center justify-between gap-2">
            {phaseConfigs.map((config) => (
              <PhaseButton
                key={config.phase}
                config={config}
                currentPhase={currentEvent.phase}
                suggestedPhase={suggestedPhase}
                isPitchNight={isPitchNight}
                onPhaseSelect={() => setPhase(config.phase)}
              />
            ))}
          </div>
        </TooltipProvider>
      )}
      <div className="flex-1">
        {selectedTab === AdminTab.DemosAndFeedback ? (
          <DemosAndFeedbackTab />
        ) : selectedTab === AdminTab.AwardsAndVoting ? (
          <AwardsAndVotingTab />
        ) : null}
      </div>
    </div>
  );
}

interface PhaseButtonProps {
  config: (typeof phaseConfigs)[number];
  currentPhase: EventPhase;
  suggestedPhase: EventPhase | null;
  isPitchNight: boolean;
  onPhaseSelect: () => void;
}

function PhaseButton({
  config,
  currentPhase,
  suggestedPhase,
  isPitchNight,
  onPhaseSelect,
}: PhaseButtonProps) {
  const tooltipContent = useMemo(() => {
    if (suggestedPhase === config.phase) {
      return (
        <div className="flex items-center gap-2">
          <CircleCheck className="h-4 w-4 text-green-500" />
          {config.suggestedDescription}
        </div>
      );
    }
    if (currentPhase === config.warningPhase) {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          {config.warningDescription}
        </div>
      );
    }
    return null;
  }, [config, currentPhase, suggestedPhase]);

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          onClick={onPhaseSelect}
          className={cn(
            "relative flex w-[calc(16.666%-0.4rem)] min-w-0",
            config.phase === currentPhase
              ? "bg-green-100 text-green-500 hover:bg-green-100/80"
              : "",
            currentPhase === config.warningPhase &&
              suggestedPhase !== config.phase &&
              "hover:bg-yellow-100/80 hover:text-yellow-500",
            suggestedPhase === config.phase && "animate-pulse-border border-2",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <config.icon className="size-4 shrink-0" />
            <span className="truncate">{displayName(config.phase, isPitchNight)}</span>
          </div>
        </Button>
      </TooltipTrigger>
      {tooltipContent && <TooltipContent>{tooltipContent}</TooltipContent>}
    </Tooltip>
  );
}
