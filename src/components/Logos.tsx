"use client";

import { cn } from "../lib/utils";
import Image from "next/image";
import React from "react";
import { type ReactNode } from "react";

import { getBrandingClient } from "~/lib/branding";

import { useWorkspaceContext } from "~/app/(attendee)/contexts/WorkspaceContext";

export default function Logos({
  size,
  className,
}: {
  size?: number;
  className?: string;
}): ReactNode {
  const context = useWorkspaceContext();
  const branding = getBrandingClient(context?.currentEvent?.isPitchNight);

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center gap-0",
        className,
      )}
    >
      <Image
        src={branding?.logoPath}
        id="logo"
        alt="logo"
        width={size}
        height={size}
        className="logo"
      />
      <Image
        src="/images/ai-collective.png"
        id="logo"
        alt="logo"
        width={size}
        height={size}
        className="logo"
      />
      {/* <Image
        src="/images/produnt-hunt.png"
        id="logo"
        alt="logo"
        width={size}
        height={size}
        className="logo"
      /> */}
    </div>
  );
}
