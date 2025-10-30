import { kv } from "@vercel/kv";
import { type EventConfig } from "./eventConfig";

export enum EventPhase {
  Pre,
  Demos,
  Voting,
  Results,
  Recap,
}

export const allPhases = [
  EventPhase.Pre,
  EventPhase.Demos,
  EventPhase.Voting,
  EventPhase.Results,
  EventPhase.Recap,
];

export function displayName(phase: EventPhase, isPitchNight = false): string {
  switch (phase) {
    case EventPhase.Pre:
      return isPitchNight ? "Pre-Pitches" : "Pre-Demos";
    case EventPhase.Demos:
      return isPitchNight ? "Pitches" : "Demos";
    case EventPhase.Voting:
      return isPitchNight ? "Investing" : "Voting";
    case EventPhase.Results:
      return "Results";
    case EventPhase.Recap:
      return "Recap";
  }
}

export type CurrentEvent = {
  id: string;
  name: string;
  phase: EventPhase;
  currentDemoId: string | null;
  currentAwardId: string | null;
  isPitchNight: boolean;
};

export async function getCurrentEvent(): Promise<CurrentEvent | null> {
  return await kv.get("currentEvent");
}

export async function updateCurrentEvent(
  event: { id: string; name: string; config?: any } | null,
) {
  if (!event) {
    return kv.set("currentEvent", null);
  }
  let currentEvent = await getCurrentEvent();
  if (currentEvent && currentEvent.id === event.id) {
    return;
  }

  // Parse config to get isPitchNight
  const config = event.config as EventConfig | undefined;
  const isPitchNight = config?.isPitchNight ?? false;

  currentEvent = {
    id: event.id,
    name: event.name,
    phase: EventPhase.Pre,
    currentDemoId: null,
    currentAwardId: null,
    isPitchNight,
  };
  return kv.set("currentEvent", currentEvent);
}

export async function updateCurrentEventState({
  phase,
  currentDemoId,
  currentAwardId,
}: {
  phase?: EventPhase;
  currentDemoId?: string | null;
  currentAwardId?: string | null;
}) {
  const currentEvent = await getCurrentEvent();
  if (!currentEvent) {
    throw new Error("No current event");
  }
  if (phase !== undefined) {
    currentEvent.phase = phase;
  }
  if (currentDemoId !== undefined) {
    currentEvent.currentDemoId = currentDemoId;
  }
  if (currentAwardId !== undefined) {
    currentEvent.currentAwardId = currentAwardId;
  }
  return kv.set("currentEvent", currentEvent);
}
