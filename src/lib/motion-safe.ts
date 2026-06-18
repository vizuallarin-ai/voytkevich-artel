"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Браузеры, где scroll-анимации framer-motion часто ломают видимость контента. */
export function hasUnreliableScrollMotion(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  if (/\bOPR\/|Opera/i.test(ua)) return true;
  if (typeof IntersectionObserver === "undefined") return true;

  return false;
}

/**
 * true → рендерим обычный DOM без скрытия контента.
 * Используется в Reveal/Stagger и счётчиках.
 */
export function usePreferStaticReveal(): boolean {
  const reduced = useReducedMotion();
  const [preferStatic, setPreferStatic] = useState(reduced === true);

  useEffect(() => {
    if (reduced) {
      setPreferStatic(true);
      return;
    }
    setPreferStatic(hasUnreliableScrollMotion());
  }, [reduced]);

  return preferStatic;
}
