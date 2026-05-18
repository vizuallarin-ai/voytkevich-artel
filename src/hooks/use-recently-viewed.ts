"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "nordhaus-recent";
const MAX = 6;

export function useRecentlyViewed() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback((slug: string) => {
    setRecent((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recent, add };
}
