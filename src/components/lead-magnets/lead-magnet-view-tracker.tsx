"use client";

import { useEffect, useRef } from "react";
import { trackLeadMagnetEvent } from "@/lib/lead-magnets";

type Props = {
  leadMagnetId: string;
  pageType: string;
  pageSlug?: string;
};

export function LeadMagnetViewTracker({ leadMagnetId, pageType, pageSlug }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || fired.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35);
        if (!visible || fired.current) return;
        fired.current = true;
        trackLeadMagnetEvent("lead_magnet_viewed", {
          leadMagnetId,
          pageType,
          pageSlug,
        });
        observer.disconnect();
      },
      { threshold: [0.35] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [leadMagnetId, pageSlug, pageType]);

  return <div ref={ref} className="pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden />;
}
