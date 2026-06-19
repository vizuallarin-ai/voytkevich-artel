"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { VisualAsset, VisualAssetMetrics } from "@/types/visual-content";
import { VisualAssetTable } from "./VisualAssetTable";
import { trackVisualDashboardViewed } from "@/lib/visual-content/visual-content-analytics";

export function VisualAssetsDashboard() {
  const [metrics, setMetrics] = useState<VisualAssetMetrics | null>(null);
  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [kindFilter, setKindFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [missingAltOnly, setMissingAltOnly] = useState(false);

  useEffect(() => {
    trackVisualDashboardViewed({ page: "visuals" });
    Promise.all([
      fetch("/api/dashboard/visual-content/metrics").then((r) => r.json()),
      fetch("/api/dashboard/visual-content/assets").then((r) => r.json()),
    ]).then(([m, a]) => {
      setMetrics(m.metrics);
      setAssets(a.assets ?? []);
    });
  }, []);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (kindFilter && a.kind !== kindFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (missingAltOnly && a.seo.alt?.trim()) return false;
      return true;
    });
  }, [assets, kindFilter, statusFilter, missingAltOnly]);

  return (
    <div className="space-y-8">
      {metrics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Всего", value: metrics.total },
            { label: "Approved", value: metrics.approved },
            { label: "Review", value: metrics.review },
            { label: "Missing alt", value: metrics.missingAlt },
            { label: "Attached to content", value: metrics.attachedToContent },
            { label: "Generated", value: metrics.generated },
            { label: "Uploaded", value: metrics.uploaded },
            { label: "Missing rights", value: metrics.missingRights },
            { label: "Illustration notice", value: metrics.requiresIllustrationNotice },
            { label: "Publications", value: metrics.attachedToPublications },
          ].map((k) => (
            <div key={k.label} className="rounded-sm border border-graphite/10 bg-background p-4">
              <p className="text-xs text-muted">{k.label}</p>
              <p className="mt-1 font-display text-2xl">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/content/visuals/generate" className="text-primary underline">
          Generation workspace →
        </Link>
        <Link href="/dashboard/content/visuals/templates" className="text-primary underline">
          Templates →
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted">Kind</label>
          <select
            className="mt-1 block rounded-sm border border-graphite/20 bg-background px-2 py-1 text-sm"
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="ai-illustration">ai-illustration</option>
            <option value="real-photo">real-photo</option>
            <option value="diagram">diagram</option>
            <option value="cover">cover</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted">Status</label>
          <select
            className="mt-1 block rounded-sm border border-graphite/20 bg-background px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="review">review</option>
            <option value="approved">approved</option>
            <option value="generated">generated</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm pb-1">
          <input type="checkbox" checked={missingAltOnly} onChange={(e) => setMissingAltOnly(e.target.checked)} />
          Missing alt
        </label>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Visual assets</h2>
        <VisualAssetTable items={filtered} />
      </section>

      <p className="text-xs text-muted max-w-3xl">
        Единая визуальная система для SEO-контента: стиль, шаблоны, prompt builder, validation и связь с CMS /
        дистрибуцией. Массовая генерация — не на этом этапе.
      </p>
    </div>
  );
}
