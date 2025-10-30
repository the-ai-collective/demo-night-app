import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { EventPhase } from "~/lib/types/currentEvent";
import {
  eventConfigSchema,
  type EventConfig,
} from "~/lib/types/eventConfig";
import { api } from "~/trpc/server";

import DemoRecap from "./components/DemoRecap";
import { UpdateDemoPage } from "./components/UpdateDemo";
import EventHeader from "~/components/EventHeader";

export async function generateMetadata({
  params: { eventId, demoId },
  searchParams: { secret },
}: {
  params: { eventId: string; demoId: string };
  searchParams: { secret: string };
}): Promise<Metadata> {
  if (!secret) {
    return {
      title: "Demo Page",
    };
  }

  try {
    const event = await api.event.get(eventId);
    const demo = await api.demo.get({ id: demoId, secret });

    if (!event || !demo) {
      return {
        title: "Demo Page",
      };
    }

    const isPitchNight =
      (event.config as EventConfig | null)?.isPitchNight ?? false;

    return {
      title: `${demo.name} - ${event.name}`,
      icons: [
        {
          rel: "icon",
          url: isPitchNight ? "/favicon-pitch.ico" : "/favicon.ico",
        },
      ],
    };
  } catch {
    return {
      title: "Demo Page",
    };
  }
}

export default async function DemoistPage({
  params: { eventId, demoId },
  searchParams: { secret },
}: {
  params: { eventId: string; demoId: string };
  searchParams: { secret: string };
}) {
  if (!secret) {
    redirect("/404?type=invalid-secret");
  }

  const currentEvent = await api.event.getCurrent();
  const event = await api.event.get(eventId);
  const demo = await api.demo.get({ id: demoId, secret });

  if (!event || !demo) {
    redirect("/404");
  }

  let showRecap = true;

  // Only show the recap page if the demo has already happened
  if (!currentEvent) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    if (date <= event.date) {
      showRecap = false;
    }
  } else if (currentEvent.phase === EventPhase.Pre) {
    showRecap = false;
  } else if (currentEvent.phase === EventPhase.Demos) {
    showRecap = false;
  }

  if (!showRecap) {
    return (
      <main className="m-auto flex size-full max-w-xl flex-col text-black">
        <EventHeader event={event} />
        <UpdateDemoPage demo={demo} event={event} secret={secret} />
      </main>
    );
  }

  const quickActions = eventConfigSchema.parse(event.config).quickActions;

  return (
    <main className="m-auto flex size-full max-w-xl flex-col text-black">
      <EventHeader event={event} demoName={demo.name} />
      <DemoRecap demo={demo} event={event} quickActions={quickActions} />
    </main>
  );
}
