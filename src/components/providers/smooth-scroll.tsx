"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const HEADER_OFFSET = -100;

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

function scrollToHash(hash: string, lenis?: Lenis | null) {
  if (!hash || hash === "#") return false;
  const el = document.querySelector(hash);
  if (!el || !(el instanceof HTMLElement)) return false;

  if (lenis) {
    lenis.scrollTo(el, { offset: HEADER_OFFSET, duration: 1 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return true;
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    // Opera / Chromium-форки: Lenis иногда ломает якоря и скролл
    const isOpera = /\bOPR\/|Opera/i.test(navigator.userAgent);
    const useLenis = !prefersReduced && !coarsePointer && !isOpera;

    let lenis: Lenis | null = null;

    if (useLenis) {
      try {
        lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        window.__lenis = lenis;

        function raf(time: number) {
          lenis?.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch {
        window.__lenis = undefined;
      }
    } else {
      window.__lenis = undefined;
    }

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a[href*='#']") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const hash = href.slice(hashIndex);
      const pathPart = hashIndex > 0 ? href.slice(0, hashIndex) : "";
      const current = window.location.pathname.replace(/\/$/, "") || "/";
      const targetPath = (pathPart || current).replace(/\/$/, "") || "/";

      if (targetPath !== current) return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      scrollToHash(hash, lenis);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    if (window.location.hash) {
      requestAnimationFrame(() => scrollToHash(window.location.hash, lenis));
    }

    return () => {
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}

/** Прокрутка к якорю с учётом Lenis (для onClick-кнопок) */
export function scrollToAnchor(id: string) {
  const hash = id.startsWith("#") ? id : `#${id}`;
  scrollToHash(hash, window.__lenis ?? null);
}
