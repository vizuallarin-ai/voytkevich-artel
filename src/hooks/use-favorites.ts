"use client";

import { useCallback, useState } from "react";

import { brand } from "@/data/brand";

const KEY = `${brand.storagePrefix}-favorites`;

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(readFavorites);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      persist(
        favorites.includes(id)
          ? favorites.filter((f) => f !== id)
          : [...favorites, id],
      );
    },
    [favorites, persist],
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
