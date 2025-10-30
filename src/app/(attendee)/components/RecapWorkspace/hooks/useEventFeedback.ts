import { type EventFeedback } from "@prisma/client";
import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

export type LocalEventFeedback = Omit<
  EventFeedback,
  "id" | "createdAt" | "updatedAt"
>;

export function useEventFeedback(eventId: string, attendeeId: string) {
  const { data: eventFeedbackData } = api.eventFeedback.get.useQuery({
    eventId,
    attendeeId,
  });
  const [eventFeedback, setEventFeedback] = useState<LocalEventFeedback>(
    eventFeedbackData ?? emptyEventFeedback(eventId, attendeeId),
  );
  const [debouncedEventFeedback, setDebouncedEventFeedback] =
    useState(eventFeedback);
  const upsertMutation = api.eventFeedback.upsert.useMutation();

  useEffect(() => {
    if (eventFeedbackData) {
      setEventFeedback(eventFeedbackData);
    }
  }, [eventFeedbackData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (feedbackIsEmpty(debouncedEventFeedback)) return;
      upsertMutation.mutate(debouncedEventFeedback);
    }, 3_000);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedEventFeedback]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDebouncedEventFeedback(eventFeedback);
  }, [eventFeedback]); // eslint-disable-line react-hooks/exhaustive-deps

  return { eventFeedback, setEventFeedback };
}

function emptyEventFeedback(
  eventId: string,
  attendeeId: string,
): LocalEventFeedback {
  return {
    eventId,
    attendeeId,
    comment: null,
    surveyOpened: false,
  };
}

function feedbackIsEmpty(feedback: LocalEventFeedback): boolean {
  return feedback.comment === null;
}
