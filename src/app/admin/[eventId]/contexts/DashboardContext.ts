import {
  type Attendee,
  type Award,
  type Chapter,
  type Demo,
  type Event,
  type EventFeedback,
} from "@prisma/client";
import { createContext, useContext } from "react";

import { type CurrentEvent } from "~/lib/types/currentEvent";
import { type EventConfig } from "~/lib/types/eventConfig";

export type AdminEvent = Event & {
  demos: Demo[];
  attendees: Attendee[];
  awards: Award[];
  eventFeedback: EventFeedback[];
  chapter: Chapter | null;
};

export type IDashboardContext = {
  currentEvent: CurrentEvent | null | undefined;
  event: AdminEvent | null | undefined;
  refetchEvent: () => void;
  config: EventConfig;
};

export const DashboardContext = createContext<IDashboardContext>(null!);

export function useDashboardContext() {
  return useContext(DashboardContext);
}
