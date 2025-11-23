"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type LayoutType = "list" | "grid";

interface LayoutToggleProps {
  layout: LayoutType;
  onToggle: () => void;
}

export function LayoutToggle({ layout, onToggle }: LayoutToggleProps) {
  const isGrid = layout === "grid";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onToggle}
            size="icon"
            className="group fixed bottom-6 right-6 z-50 h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-indigo-600 to-purple-600 p-0 shadow-xl transition-all duration-300 hover:scale-110 hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl active:scale-95"
            aria-label={`Switch to ${isGrid ? "list" : "grid"} view`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Pulsing ring on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 blur transition-opacity duration-300 group-hover:animate-ping group-hover:opacity-75" />

            <div className="relative flex h-full w-full items-center justify-center">
              <LayoutList
                className={`absolute h-5 w-5 text-white transition-all duration-500 ${
                  isGrid
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-180 scale-0 opacity-0"
                }`}
                strokeWidth={2.5}
              />
              <LayoutGrid
                className={`absolute h-5 w-5 text-white transition-all duration-500 ${
                  isGrid
                    ? "rotate-180 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
                strokeWidth={2.5}
              />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="rounded-md border-slate-300 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white shadow-lg"
        >
          <p>Switch to {isGrid ? "List" : "Grid"} View</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
