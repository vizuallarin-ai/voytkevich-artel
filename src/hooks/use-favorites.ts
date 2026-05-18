"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "nordhaus-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavorites(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      persist(
        favorites.includes(id)
          ? favorites.filter((f) => f !== id)
          : [...favorites, id]
      );
    },
    [favorites, persist]
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
