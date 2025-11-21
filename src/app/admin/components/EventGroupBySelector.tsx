"use client";

import { Group } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";

export type GroupByOption = "none" | "chapter" | "year" | "quarter" | "month" | "type";

interface EventGroupBySelectorProps {
  value: GroupByOption;
  onChange: (value: GroupByOption) => void;
}

export function EventGroupBySelector({
  value,
  onChange,
}: EventGroupBySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="groupBy" className="flex items-center gap-1.5 text-sm font-medium">
        <Group className="h-4 w-4" />
        Group by:
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as GroupByOption)}>
        <SelectTrigger id="groupBy" className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="chapter">Chapter</SelectItem>
          <SelectItem value="year">Year</SelectItem>
          <SelectItem value="quarter">Quarter</SelectItem>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="type">Event Type</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
