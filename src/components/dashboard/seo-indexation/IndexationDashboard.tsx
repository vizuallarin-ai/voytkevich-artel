"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { IndexationDashboardRow } from "@/lib/seo-indexation/indexation-dashboard-service";
import { IndexabilityBadge } from "./IndexabilityBadge";
import { trackSeoIndexationDashboardViewed } from "@/lib/seo-indexation/indexation-analytics";

type DashboardData = {
  metrics: Record<string, number>;
  readyToIndex: IndexationDashboardRow[];
  blocked: IndexationDashboardRow[];
  highPriorityBlocked: IndexationDashboardRow[];
  sitemapStats: { indexableEntries: number; excludedEntries: number };
};

export function IndexationDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    trackSeoIndexationDashboardViewed({});
    fetch("/api/dashboard/seo-indexation")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Загрузка indexation...</p>;

  const m = data.metrics;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Indexable", value: m.indexable },
          { label: "Noindex", value: m.noindex },
          { label: "Blocked", value: m.blocked },
          { label: "In sitemap", value: m.sitemapIncluded },
          { label: "P1/P2 blocked", value: m.p1p2Blocked },
          { label: "Critical blockers", value: m.criticalBlockers },
          { label: "Sitemap URLs", value: data.sitemapStats.indexableEntries },
          { label: "Excluded", value: data.sitemapStats.excludedEntries },
        ].map((k) => (
          <div key={k.label} className="rounded-sm border border-graphite/10 p-4">
            <p className="text-xs text-muted">{k.label}</p>
            <p className="mt-1 font-display text-2xl">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/seo/sitemaps" className="text-primary underline">Sitemaps →</Link>
        <Link href="/dashboard/seo/canonicals" className="text-primary underline">Canonicals →</Link>
        <Link href="/dashboard/seo/crawl-budget" className="text-primary underline">Crawl budget →</Link>
        <Link href="/dashboard/seo/url-lifecycle" className="text-primary underline">URL lifecycle →</Link>
        <Link href="/dashboard/seo/monitoring" className="text-primary underline">Monitoring →</Link>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Ready to index</h2>
        <IndexationTable rows={data.readyToIndex} />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Blocked</h2>
        <IndexationTable rows={data.blocked} />
      </section>
    </div>
  );
}

function IndexationTable({ rows }: { rows: IndexationDashboardRow[] }) {
  if (!rows.length) return <p className="text-sm text-muted">Нет записей</p>;
  return (
    <div className="overflow-x-auto rounded-sm border border-graphite/10">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-graphite/5 text-xs text-muted">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">URL</th>
            <th className="p-3">Status</th>
            <th className="p-3">Index</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.contentItemId} className="border-b border-graphite/5">
              <td className="p-3">{row.title}</td>
              <td className="p-3 text-xs text-muted">{row.url}</td>
              <td className="p-3 text-xs">{row.status}</td>
              <td className="p-3">
                <IndexabilityBadge status={row.decision.status} indexable={row.decision.indexable} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
