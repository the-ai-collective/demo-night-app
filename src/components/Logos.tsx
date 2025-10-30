"use client";

import { cn } from "../lib/utils";
import Image from "next/image";
import React from "react";
import { type ReactNode } from "react";

export default function Logos({
  size,
  className,
  logoPath,
}: {
  size?: number;
  className?: string;
  logoPath: string;
}): ReactNode {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center gap-0",
        className,
      )}
    >
      <Image
        src={logoPath}
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
