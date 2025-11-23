"use client";

import { useEffect, useState } from "react";

type LayoutType = "list" | "grid";

const STORAGE_KEY = "admin-home-layout";
const DEFAULT_LAYOUT: LayoutType = "list";

export function useLayoutPreference(): [LayoutType, (layout: LayoutType) => void] {
  const [layout, setLayoutState] = useState<LayoutType>(DEFAULT_LAYOUT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "grid") {
      setLayoutState(stored);
    }
  }, []);

  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout);
    localStorage.setItem(STORAGE_KEY, newLayout);
  };

  // Return default layout during SSR/initial render to prevent hydration mismatch
  if (!mounted) {
    return [DEFAULT_LAYOUT, setLayout];
  }

  return [layout, setLayout];
}
