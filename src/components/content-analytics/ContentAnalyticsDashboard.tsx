"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ContentAnalyticsDashboardData } from "@/lib/content-analytics/content-analytics-dashboard-service";
import { MetricCard } from "./MetricCard";
import { DataCompletenessBadge } from "./DataCompletenessBadge";
import { trackContentAnalyticsDashboardViewed } from "@/lib/content-analytics/content-analytics-events";

export function ContentAnalyticsDashboard() {
  const [data, setData] = useState<ContentAnalyticsDashboardData | null>(null);

  useEffect(() => {
    trackContentAnalyticsDashboardViewed({});
    fetch("/api/dashboard/content-analytics?range=30d")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Загрузка аналитики контента...</p>;

  const k = data.kpis;
  const f = data.funnel;

  return (
    <div className="space-y-8">
      <DataCompletenessBadge
        completeness={k.dataCompleteness}
        searchAvailable={data.meta.searchDataAvailable}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Published" value={k.published} />
        <MetricCard label="Indexed" value={k.indexed} hint="external status may be unknown" />
        <MetricCard label="Sessions" value={k.sessions} />
        <MetricCard label="Leads" value={k.leads} />
        <MetricCard label="Qualified leads" value={k.qualifiedLeads} />
        <MetricCard label="Search impressions" value={k.searchImpressions} hint="GSC not connected = null" />
        <MetricCard label="Content cost" value={k.contentCost} hint="manual import required" />
        <MetricCard label="ROI" value={k.roi != null ? `${k.roi.toFixed(0)}%` : null} />
      </div>

      <section className="rounded-sm border border-graphite/10 p-4 text-sm">
        <h2 className="font-semibold mb-3">Content funnel</h2>
        <p className="text-muted tabular-nums">
          planned {f.planned ?? "—"} → created {f.created ?? "—"} → approved {f.approved ?? "—"} → published{" "}
          {f.published ?? "—"} → indexed {f.indexed ?? "—"} → traffic {f.traffic ?? "—"} → leads {f.leads ?? "—"} →
          qualified {f.qualifiedLeads ?? "—"} → deals {f.deals ?? "—"}
        </p>
      </section>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/content/analytics/search" className="text-primary underline">Search →</Link>
        <Link href="/dashboard/content/analytics/conversions" className="text-primary underline">Conversions →</Link>
        <Link href="/dashboard/content/analytics/leads" className="text-primary underline">Leads →</Link>
        <Link href="/dashboard/content/analytics/roi" className="text-primary underline">ROI →</Link>
        <Link href="/dashboard/content/analytics/intelligence" className="text-primary underline">Intelligence →</Link>
        <Link href="/dashboard/content/analytics/data-quality" className="text-primary underline">Data quality →</Link>
      </div>

      {data.panels.recommendedActions.length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">Recommended actions</h2>
          <ul className="text-sm space-y-2">
            {data.panels.recommendedActions.slice(0, 8).map((r) => (
              <li key={r.id} className="rounded-sm border border-graphite/10 p-3">
                <strong>{r.title}</strong>
                <span className="ml-2 text-xs text-muted">{r.confidence} confidence</span>
                <p className="text-muted text-xs mt-1">{r.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
