"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface EventSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

export function EventSearchBar({
  value,
  onChange,
  placeholder = "Search events by name, chapter, URL, or ID...",
  resultCount,
  totalCount,
}: EventSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-20"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 h-7 px-2"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <kbd className="pointer-events-none absolute right-3 hidden select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">/</span>
        </kbd>
      </div>
      {value && resultCount !== undefined && totalCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} event{totalCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
