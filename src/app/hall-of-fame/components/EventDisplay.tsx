"use client";

import { ArrowUpDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { eventConfigSchema } from "~/lib/types/eventConfig";
import type { CompleteEvent } from "~/server/api/routers/event";
import { api } from "~/trpc/react";
import type { Chapter } from "~/lib/types/chapter";

import AwardWinnerItem from "./AwardWinnerItem";
import EventSelector from "./EventSelector";

interface EventDisplayProps {
  events: CompleteEvent[];
}

export default function EventDisplay({ events }: EventDisplayProps) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]!);
  const [showSelector, setShowSelector] = useState(false);
    const { data: chapters } = api.chapter.all.useQuery();
    const chaptersTyped = chapters as Chapter[] | undefined;
  
  const config = eventConfigSchema.parse(selectedEvent.config);

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-2">
        <p className="mb-2 max-w-lg text-center text-base font-medium italic leading-5 text-gray-500">
          Welcome to the Demo Night Hall of Fame! 🏆 View the winners and demos
          from the most recent demo night or select a different one.
        </p>
        <button
          className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-base font-bold text-gray-700 transition hover:bg-gray-200"
          onClick={() => setShowSelector(true)}
        >
          Switch demo night
          <ArrowUpDown size={20} strokeWidth={2.5} />
        </button>
        <EventSelector
          events={events}
          onEventChange={(event) => {
            setSelectedEvent(event);
            setShowSelector(false);
          }}
          isOpen={showSelector}
          setIsOpen={setShowSelector}
        />
        <div className="mt-8 flex w-full max-w-2xl flex-col items-center">
          <h1 className="flex items-center gap-2 text-center font-kallisto text-4xl font-extrabold text-black">
              {selectedEvent.chapterId && chaptersTyped?.find((c) => c.id === selectedEvent.chapterId)?.emoji ? `${chaptersTyped?.find((c) => c.id === selectedEvent.chapterId)?.emoji} ` : ""}
            {selectedEvent.name}
          </h1>
          <p className="mt-1 text-lg font-bold text-gray-500">
            {new Date(selectedEvent.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-8 pt-4">
        {selectedEvent.awards.map((award) => (
          <AwardWinnerItem
            key={award.id}
            award={award}
            demos={selectedEvent.demos}
          />
        ))}
      </div>
      <div className="mt-12 flex w-full flex-col gap-2">
        <h2 className="font-kallisto text-2xl font-bold text-black">
          All Demos
        </h2>
        <div className="flex w-full flex-col gap-4">
          {selectedEvent.demos.map((demo) => (
            <Link
              key={demo.id}
              href={demo.url ?? "#"}
              target={demo.url ? "_blank" : "_self"}
              onClick={demo.url ? undefined : (e) => e.preventDefault()}
              className={`group z-10 flex w-full flex-col gap-1 rounded-lg bg-gray-300/50 p-4 font-medium leading-6 shadow-xl backdrop-blur ${demo.url ? "" : "cursor-default"}`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3
                    className={`line-clamp-1 text-xl font-bold ${demo.url ? "group-hover:underline" : ""}`}
                  >
                    {demo.name}
                  </h3>
                  {demo.url && (
                    <ArrowUpRight
                      size={24}
                      strokeWidth={3}
                      className="h-5 w-5 flex-none rounded-md bg-gray-300/50 p-[2px] text-gray-500 group-hover:bg-gray-400/50 group-hover:text-gray-700"
                    />
                  )}
                </div>
              </div>
              {demo.description && (
                <p className="italic leading-5 text-gray-700">
                  {demo.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
      {config.partners.length > 0 && (
        <div className="mt-12 flex w-full flex-col gap-2">
          <h2 className="font-kallisto text-2xl font-bold text-black">
            Hosts & Sponsors
          </h2>
          <div className="flex w-full flex-col gap-4">
            {config.partners.map((partner) => (
              <Link
                key={partner.name}
                href={partner.url}
                target="_blank"
                className="group z-10 flex w-full flex-col gap-1 rounded-lg bg-gray-300/50 p-4 font-medium leading-6 shadow-xl backdrop-blur"
              >
                <div className="flex w-full flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="line-clamp-1 text-xl font-bold group-hover:underline">
                      {partner.name}
                    </h3>
                    <ArrowUpRight
                      size={24}
                      strokeWidth={3}
                      className="h-5 w-5 flex-none rounded-md bg-gray-300/50 p-[2px] text-gray-500 group-hover:bg-gray-400/50 group-hover:text-gray-700"
                    />
                  </div>
                </div>
                <p className="italic leading-5 text-gray-700">
                  {partner.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
