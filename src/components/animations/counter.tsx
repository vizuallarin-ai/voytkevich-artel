"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { usePreferStaticReveal } from "@/lib/motion-safe";

export function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
  duration = 2,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.01 });
  const reduced = useReducedMotion();
  const preferStatic = usePreferStaticReveal();
  const [display, setDisplay] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (reduced || preferStatic) {
      setDisplay(value);
      return;
    }

    if (!inView || hasAnimated) return;

    setHasAnimated(true);
    setDisplay(0);

    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [inView, value, duration, reduced, hasAnimated, preferStatic]);

  const shown = preferStatic || reduced || !hasAnimated ? value : display;

  return (
    <span ref={ref}>
      {decimals > 0 ? shown.toFixed(decimals) : Math.round(shown)}
      {suffix}
    </span>
  );
}
