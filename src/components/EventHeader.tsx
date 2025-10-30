import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

import { getBrandingClient } from "~/lib/branding";

import Logos from "./Logos";
import { useWorkspaceContext } from "~/app/(attendee)/contexts/WorkspaceContext";

export default function EventHeader({
  eventName,
  demoName,
  eventId,
  isAdmin,
}: {
  eventName: string;
  demoName?: string;
  eventId?: string;
  isAdmin?: boolean;
}) {
  const { currentEvent } = useWorkspaceContext();
  const branding = getBrandingClient(currentEvent?.isPitchNight);

  return (
    <header className="fixed left-0 right-0 z-20 flex h-14 w-full select-none flex-col items-center bg-white/60 text-black backdrop-blur">
      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-between">
        <div className="flex w-full flex-1 flex-row items-center justify-between px-3">
          <Logos size={36} />
          <div className="flex flex-col items-center">
            <h1 className="mt-1 line-clamp-1 text-ellipsis px-1 font-marker text-xl font-bold tracking-tight">
              {demoName
                ? `${demoName} ${branding.appName.replace(" Night", "")} Recap`
                : eventName}
            </h1>
            {demoName && (
              <h2 className="-mt-1 line-clamp-1 text-ellipsis px-1 font-marker text-sm font-bold tracking-tight">
                {eventName}
              </h2>
            )}
          </div>
          <div className="flex w-[108px] items-center justify-end">
            {isAdmin && eventId && (
              <Link
                href={`/admin/${eventId}?tab=submissions`}
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
