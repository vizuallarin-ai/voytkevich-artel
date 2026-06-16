"use client";

import { useCallback, useState } from "react";

import { brand } from "@/data/brand";

const KEY = `${brand.storagePrefix}-recent`;
const MAX = 6;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [recent, setRecent] = useState<string[]>(readRecent);

  const add = useCallback((slug: string) => {
    setRecent((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recent, add };
}
