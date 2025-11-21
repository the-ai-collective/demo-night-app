"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

export type SortByOption = "date" | "name" | "demos" | "attendees";
export type SortOrderOption = "asc" | "desc";

interface EventSortControlsProps {
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
  onSortByChange: (value: SortByOption) => void;
  onSortOrderChange: (value: SortOrderOption) => void;
}

export function EventSortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: EventSortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sortBy" className="text-sm font-medium">
        Sort by:
      </Label>
      <Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortByOption)}>
        <SelectTrigger id="sortBy" className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="demos">Demos</SelectItem>
          <SelectItem value="attendees">Attendees</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
        title={sortOrder === "asc" ? "Ascending" : "Descending"}
      >
        {sortOrder === "asc" ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
