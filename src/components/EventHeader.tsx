import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { getBrandingClient } from "~/lib/branding";
import { api } from "~/trpc/react";
import type { Chapter } from "~/lib/types/chapter";
import { type EventConfig } from "~/lib/types/eventConfig";
import { type CompleteEvent } from "~/server/api/routers/event";

import Logos from "./Logos";

export default function EventHeader({
  event,
  demoName,
  isAdmin,
}: {
  event: CompleteEvent;
  demoName?: string;
  isAdmin?: boolean;
}) {
  const branding = getBrandingClient(
    (event.config as EventConfig)?.isPitchNight as boolean,
  );
  const { data: chapters } = api.chapter.all.useQuery();
  const chapterEmoji = event.chapterId
    ? chapters?.find((c: Chapter) => c.id === event.chapterId)?.emoji
    : undefined;

  return (
    <header className="fixed left-0 right-0 z-20 flex h-14 w-full select-none flex-col items-center bg-white/60 text-black backdrop-blur">
      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-between">
        <div className="flex w-full flex-1 flex-row items-center justify-between px-3">
          <Logos size={36} logoPath={branding.logoPath} />
          <div className="flex flex-col items-center">
            <h1 className="mt-1 line-clamp-1 text-ellipsis px-1 font-marker text-xl font-bold tracking-tight">
              {chapterEmoji ? `${chapterEmoji} ` : ""}
              {demoName
                ? `${demoName} ${branding.appName.replace(" Night", "")} Recap`
                : event.name}
            </h1>
            {demoName && (
              <h2 className="-mt-1 line-clamp-1 text-ellipsis px-1 font-marker text-sm font-bold tracking-tight">
                {event.name}
              </h2>
            )}
          </div>
          <div className="flex w-[108px] items-center justify-end">
            {isAdmin && event.id && (
              <Link
                href={`/admin/${event.id}?tab=submissions`}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-100 p-2 text-sm font-medium hover:bg-gray-200"
              >
                Admin
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
