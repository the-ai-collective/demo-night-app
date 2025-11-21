"use client";

import { LayoutList, LayoutGrid, Table } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export type ViewMode = "list" | "compact" | "table";

interface EventViewSelectorProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function EventViewSelector({ value, onChange }: EventViewSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant={value === "list" ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 px-3", value === "list" && "shadow-sm")}
        onClick={() => onChange("list")}
        title="List view"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant={value === "compact" ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 px-3", value === "compact" && "shadow-sm")}
        onClick={() => onChange("compact")}
        title="Compact view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={value === "table" ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 px-3", value === "table" && "shadow-sm")}
        onClick={() => onChange("table")}
        title="Table view"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}
