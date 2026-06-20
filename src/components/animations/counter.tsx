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
  const staticMode = Boolean(preferStatic || reduced);
  const [display, setDisplay] = useState(value);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (staticMode) return;
    if (!inView || hasAnimatedRef.current) return;

    let frameId = 0;
    const startTime = performance.now();

    frameId = requestAnimationFrame(function tick(now) {
      if (!hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        setDisplay(0);
      }

      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frameId);
  }, [inView, value, duration, staticMode]);

  const shown = staticMode || !hasAnimatedRef.current ? value : display;

  return (
    <span ref={ref}>
      {decimals > 0 ? shown.toFixed(decimals) : Math.round(shown)}
      {suffix}
    </span>
  );
}
