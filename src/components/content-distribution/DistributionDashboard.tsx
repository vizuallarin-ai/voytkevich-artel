"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DistributionMetrics, ExternalPublication } from "@/types/content-distribution";
import { PublicationTable } from "./PublicationTable";
import { trackDistributionDashboardViewed } from "@/lib/content-distribution/publication-analytics";

export function DistributionDashboard() {
  const [metrics, setMetrics] = useState<DistributionMetrics | null>(null);
  const [recent, setRecent] = useState<ExternalPublication[]>([]);

  useEffect(() => {
    trackDistributionDashboardViewed({ page: "distribution" });
    Promise.all([
      fetch("/api/dashboard/content-distribution/metrics").then((r) => r.json()),
      fetch("/api/dashboard/content-distribution/publications").then((r) => r.json()),
    ]).then(([m, p]) => {
      setMetrics(m.metrics);
      setRecent((p.publications as ExternalPublication[]).slice(0, 8));
    });
  }, []);

  return (
    <div className="space-y-8">
      {metrics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Drafts / review", value: metrics.totalDrafts },
            { label: "Approved", value: metrics.approved },
            { label: "Published", value: metrics.published },
            { label: "Manual export", value: metrics.manualExport },
            { label: "Failed", value: metrics.failed },
            { label: "Platforms active", value: metrics.platformsActive },
            { label: "Manual platforms", value: metrics.platformsManual },
            { label: "Needs API", value: metrics.platformsNeedsApi },
          ].map((k) => (
            <div key={k.label} className="rounded-sm border border-graphite/10 bg-background p-4">
              <p className="text-xs text-muted">{k.label}</p>
              <p className="mt-1 font-display text-2xl">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/content/distribution/queue" className="text-primary underline">
          Очередь →
        </Link>
        <Link href="/dashboard/content/distribution/publications" className="text-primary underline">
          Все публикации →
        </Link>
        <Link href="/dashboard/content/distribution/platforms" className="text-primary underline">
          Площадки →
        </Link>
        <Link href="/dashboard/content/distribution/manual-export" className="text-primary underline">
          Manual export →
        </Link>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Последние публикации</h2>
        <PublicationTable items={recent} />
      </section>

      <p className="text-xs text-muted max-w-3xl">
        Полная статья — только на stroistroy.ru. Внешние площадки получают teaser с UTM. Auto-publish
        только при active adapter и без validation blockers.
      </p>
    </div>
  );
}
