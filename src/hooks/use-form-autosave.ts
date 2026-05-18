"use client";

import { useEffect } from "react";

export function useFormAutosave<T extends Record<string, unknown>>(
  key: string,
  values: T,
  setValues: (v: T) => void
) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValues({ ...values, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(values));
    }, 500);
    return () => clearTimeout(t);
  }, [key, values]);
}
