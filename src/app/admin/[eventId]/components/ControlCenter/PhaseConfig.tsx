import {
  HandshakeIcon,
  LoaderIcon,
  PresentationIcon,
  TrophyIcon,
  VoteIcon,
} from "lucide-react";

import { EventPhase } from "~/lib/types/currentEvent";

interface PhaseConfig {
  phase: EventPhase;
  icon: React.ComponentType<{ className?: string }>;
  suggestedDescription?: string;
  warningPhase?: EventPhase;
  warningDescription?: string;
}

export const phaseConfigs: PhaseConfig[] = [
  {
    phase: EventPhase.Pre,
    icon: LoaderIcon,
  },
  {
    phase: EventPhase.Demos,
    icon: PresentationIcon,
    warningPhase: EventPhase.Pre,
    warningDescription: "The first demo isn't selected!",
    suggestedDescription: "Click when it's time to start the demos!",
  },
  {
    phase: EventPhase.Voting,
    icon: VoteIcon,
    suggestedDescription: "All demos are done. Click to start voting!",
    warningPhase: EventPhase.Demos,
    warningDescription: "The last demo isn't live yet!",
  },
  {
    phase: EventPhase.Results,
    icon: TrophyIcon,
    suggestedDescription:
      "All awards have a winner. Click to prepare the grand reveal!",
    warningPhase: EventPhase.Voting,
    warningDescription: "Some awards still don't have a winner!",
  },
  {
    phase: EventPhase.Recap,
    icon: HandshakeIcon,
    suggestedDescription:
      "All awards are revealed! Click to present the recap!",
    warningPhase: EventPhase.Results,
    warningDescription: "Some awards haven't been revealed yet!",
  },
];
