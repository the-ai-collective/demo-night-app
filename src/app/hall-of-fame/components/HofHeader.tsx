"use client";

import Logos from "~/components/Logos";
import { getBrandingClient } from "~/lib/branding";

export default function HofHeader() {
  const branding = getBrandingClient();

  return (
    <header className="fixed left-0 right-0 z-20 flex h-14 w-full select-none flex-col items-center bg-white/60 text-black backdrop-blur">
      <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-between">
        <div className="flex w-full flex-1 flex-row items-center justify-between px-3">
          <Logos size={36} />
          <div className="flex flex-col items-center justify-center">
            <h1 className="mt-1 line-clamp-1 text-ellipsis px-1 font-marker text-xl font-bold leading-5 tracking-tight">
              {branding.appName}
            </h1>
            <h2 className="line-clamp-1 text-ellipsis px-1 font-marker text-sm font-bold leading-5 tracking-tight">
              Hall of Fame 🏆
            </h2>
          </div>
          <div className="flex w-[108px] items-center justify-end" />
        </div>
      </div>
    </header>
  );
}
