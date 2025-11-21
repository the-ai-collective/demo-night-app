import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { type EventConfig } from "~/lib/types/eventConfig";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";

import EventHeader from "~/components/EventHeader";
import { LinkButton } from "~/components/Button";
import Logos from "~/components/Logos";
import { getBrandingClient } from "~/lib/branding";

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  try {
    const event = await api.event.get(params.eventId);

    if (!event) {
      return {
        title: "Event Not Found",
      };
    }

    const isPitchNight =
      (event.config as EventConfig | null)?.isPitchNight ?? false;

    return {
      title: event.name,
      description: `View details and submit your ${isPitchNight ? "pitch" : "demo"} for ${event.name}`,
      icons: [
        {
          rel: "icon",
          url: isPitchNight ? "/favicon-pitch.ico" : "/favicon.ico",
        },
      ],
    };
  } catch {
    return {
      title: "Event Not Found",
    };
  }
}

export default async function EventDetailsPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await api.event.get(params.eventId);
  const session = await getServerAuthSession();

  if (!event) {
    redirect("/404");
  }

  const eventConfig = event.config as EventConfig | null;
  const isPitchNight = eventConfig?.isPitchNight ?? false;
  const branding = getBrandingClient(isPitchNight);

  const eventDate = new Date(event.date);
  const isPastEvent = new Date() > eventDate;

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main className="m-auto flex size-full max-w-2xl flex-col px-4 text-black">
      <EventHeader event={event} isAdmin={!!session} />

      <div className="flex flex-col gap-6 py-8">
        {/* Event Logo and Name */}
        <div className="flex flex-col items-center gap-4 pt-12">
          <Logos size={100} logoPath={branding.logoPath} />
          <h1 className="text-center font-kallisto text-3xl font-bold">
            {event.name}
          </h1>
        </div>

        {/* Event Details Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Date & Time
              </h2>
              <p className="mt-1 text-lg text-gray-900">{formattedDate}</p>
            </div>

            {event.url && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Event Link
                </h2>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-lg text-blue-600 hover:underline"
                >
                  {event.url}
                </a>
              </div>
            )}

            {event.chapter && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Chapter
                </h2>
                <p className="mt-1 text-lg text-gray-900">
                  {event.chapter.emoji} {event.chapter.name}
                </p>
              </div>
            )}

            {event.demos.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  {isPitchNight ? "Pitches" : "Demos"}
                </h2>
                <p className="mt-1 text-lg text-gray-900">
                  {event.demos.length}{" "}
                  {isPitchNight
                    ? event.demos.length === 1
                      ? "pitch"
                      : "pitches"
                    : event.demos.length === 1
                      ? "demo"
                      : "demos"}{" "}
                  scheduled
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Demos List */}
        {event.demos.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">
              {isPitchNight ? "Pitch Lineup" : "Demo Lineup"}
            </h2>
            <div className="space-y-3">
              {event.demos.map((demo, index) => (
                <div
                  key={demo.id}
                  className="border-l-4 border-gray-300 pl-4 py-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {index + 1}. {demo.name}
                      </h3>
                      {demo.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {demo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!isPastEvent && (
          <div className="rounded-lg border-2 border-black bg-gray-50 p-6 text-center">
            <h2 className="mb-2 text-xl font-bold">
              Want to present at this event?
            </h2>
            <p className="mb-4 text-gray-600">
              Submit your {isPitchNight ? "pitch" : "demo"} and join the lineup!
            </p>
            <LinkButton href={`/${params.eventId}/submit`}>
              Submit {isPitchNight ? "Pitch" : "Demo"}
            </LinkButton>
          </div>
        )}

        {isPastEvent && (
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-gray-600">This event has already occurred.</p>
          </div>
        )}
      </div>
    </main>
  );
}
