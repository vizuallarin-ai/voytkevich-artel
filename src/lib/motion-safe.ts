"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

/** Браузеры, где scroll-анимации framer-motion часто ломают видимость контента. */
export function hasUnreliableScrollMotion(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  if (/\bOPR\/|Opera/i.test(ua)) return true;
  if (typeof IntersectionObserver === "undefined") return true;

  return false;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getClientSnapshot() {
  return hasUnreliableScrollMotion();
}

function getServerSnapshot() {
  return false;
}

/**
 * true → рендерим обычный DOM без скрытия контента.
 * Используется в Reveal/Stagger и счётчиках.
 */
export function usePreferStaticReveal(): boolean {
  const reduced = useReducedMotion();
  const unreliable = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  return reduced === true || unreliable;
}
