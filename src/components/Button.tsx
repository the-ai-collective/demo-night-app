"use client";

import Link from "next/link";

import { getBrandingClient } from "~/lib/branding";
import { cn } from "~/lib/utils";

import LoadingDots from "./loading/LoadingDots";
import { useWorkspaceContext } from "~/app/(attendee)/contexts/WorkspaceContext";

export default function Button({
  children,
  onClick,
  pending = false,
  className,
  isPitchNight: isPitchNightProp = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  pending?: boolean;
  className?: string;
  isPitchNight?: boolean;
}) {
  const context = useWorkspaceContext();
  const isPitchNight = isPitchNightProp ?? context?.currentEvent?.isPitchNight;
  return (
    <button
      type="submit"
      className={cn(
        `z-30 flex h-14 w-full items-center justify-center gap-2 space-x-2 rounded-lg px-4 py-2 font-kallisto text-xl font-bold tracking-wide text-white shadow-lg backdrop-blur transition-all focus:outline-none active:scale-95 active:shadow-md`,
        pending
          ? "cursor-not-allowed"
          : isPitchNight
            ? "bg-green-800/80 hover:bg-green-900/80"
            : "bg-orange-500/80 hover:bg-orange-600/80",
        className,
      )}
      disabled={pending}
      onClick={onClick}
    >
      {pending ? <LoadingDots color="#fff" /> : children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link
      className={cn(
        `z-10 mt-4 rounded-lg bg-orange-500/80 px-4 py-3 font-semibold tracking-wide text-white shadow-lg backdrop-blur transition-all hover:bg-orange-600/80 focus:outline-none active:scale-95 active:shadow-md`,
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
