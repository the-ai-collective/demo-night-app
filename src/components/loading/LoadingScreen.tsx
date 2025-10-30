import { getBrandingClient } from "~/lib/branding";

import LoadingDots from "./LoadingDots";
import { useWorkspaceContext } from "~/app/(attendee)/contexts/WorkspaceContext";

export default function LoadingScreen() {
  const { currentEvent } = useWorkspaceContext();
  const { isPitchNight } = getBrandingClient(currentEvent?.isPitchNight);
  return (
    <div className="flex w-full flex-1 animate-pulse flex-col items-center justify-center gap-2 py-16 font-kallisto text-black">
      <h1 className="pt-4 text-center text-2xl font-bold">
        Loading {isPitchNight ? "Pitches" : "Demos"}!
      </h1>
      <p className="text-lg font-semibold italic text-gray-500">
        (hold tight!)
      </p>
      <LoadingDots />
    </div>
  );
}
