"use client";

import { type Attendee } from "@prisma/client";
import { createContext, useContext } from "react";

import { type CurrentEvent } from "~/lib/types/currentEvent";
import { type EventConfig } from "~/lib/types/eventConfig";
import { type CompleteEvent } from "~/server/api/routers/event";

export type IWorkspaceContext = {
  currentEvent: CurrentEvent;
  event: CompleteEvent;
  config: EventConfig;
  attendee: Attendee;
  setAttendee: (attendee: Attendee) => void;
};

export const WorkspaceContext = createContext<IWorkspaceContext>(null!);

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
