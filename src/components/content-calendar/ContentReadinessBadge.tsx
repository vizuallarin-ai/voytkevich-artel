"use client";

import type { ContentReadinessStatus } from "@/types/content-scheduling";

type Props = {
  readiness: ContentReadinessStatus;
  compact?: boolean;
};

export function ContentReadinessBadge({ readiness, compact }: Props) {
  const label = readiness.canSchedule
    ? "ready"
    : readiness.blockers.length
      ? "blocked"
      : "warnings";

  const colors = {
    ready: "bg-emerald-100 text-emerald-900",
    blocked: "bg-red-100 text-red-900",
    warnings: "bg-amber-100 text-amber-900",
  };

  if (compact) {
    return (
      <span className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-medium ${colors[label]}`}>
        {label}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {[
        { k: "CMS", ok: readiness.cmsReady },
        { k: "SEO", ok: readiness.seoReady },
        { k: "Visual", ok: readiness.visualReady },
        { k: "Dist", ok: readiness.distributionReady },
      ].map((b) => (
        <span
          key={b.k}
          className={`rounded-sm px-2 py-0.5 text-[10px] ${b.ok ? "bg-emerald-100 text-emerald-900" : "bg-graphite/10 text-muted"}`}
        >
          {b.k}
        </span>
      ))}
    </div>
  );
}
