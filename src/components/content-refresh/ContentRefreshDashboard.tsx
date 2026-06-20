"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RefreshDashboardData } from "@/lib/content-refresh/refresh-dashboard-service";
import { MetricCard } from "@/components/content-analytics/MetricCard";

export function ContentRefreshDashboard() {
  const [data, setData] = useState<RefreshDashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/content-refresh?range=30d")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Загрузка refresh queue...</p>;

  const k = data.kpis;

  return (
    <div className="space-y-8">
      <p className="text-xs text-muted">
        Сигнал → diagnosis → brief → review → publish → monitoring. Без автопубликации.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Candidates" value={k.detected} />
        <MetricCard label="Critical" value={k.critical} />
        <MetricCard label="High priority" value={k.high} />
        <MetricCard label="In review" value={k.inReview} />
        <MetricCard label="Monitoring" value={k.monitoring} />
        <MetricCard label="Experiments" value={k.activeExperiments} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/content/refresh/queue" className="text-primary underline">Queue →</Link>
        <Link href="/dashboard/content/refresh/briefs" className="text-primary underline">Briefs →</Link>
        <Link href="/dashboard/content/refresh/reviews" className="text-primary underline">Reviews →</Link>
        <Link href="/dashboard/content/refresh/versions" className="text-primary underline">Versions →</Link>
        <Link href="/dashboard/content/refresh/monitoring" className="text-primary underline">Monitoring →</Link>
        <Link href="/dashboard/content/experiments" className="text-primary underline">Experiments →</Link>
        <Link href="/dashboard/content/analytics/intelligence" className="text-primary underline">Analytics intelligence →</Link>
      </div>

      {data.urgent.length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">Urgent candidates</h2>
          <ul className="text-sm space-y-2">
            {data.urgent.map((c) => (
              <li key={c.id} className="rounded-sm border border-graphite/10 p-3">
                <strong>{c.url}</strong>
                <span className="ml-2 text-xs text-muted">{c.priority.level} · {c.priority.confidence}</span>
                <p className="text-muted text-xs mt-1">{c.recommendedAction}</p>
                <p className="text-xs mt-1">{c.reasons.join(", ")}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
