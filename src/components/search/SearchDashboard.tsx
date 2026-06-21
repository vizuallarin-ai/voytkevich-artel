"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type DashboardData = {
  overview: {
    indexedDocuments: number;
    indexedChunks: number;
    activeIndexVersion: string | null;
    queuedFeedback: number;
    openZeroResults: number;
  };
  quality: { score: number; zeroResultRate: number; avgLatencyMs: number };
};

export function SearchDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/search")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Загрузка search analytics...</p>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Indexed documents" value={data.overview.indexedDocuments} />
        <MetricCard label="Indexed chunks" value={data.overview.indexedChunks} />
        <MetricCard label="Open zero-results" value={data.overview.openZeroResults} />
        <MetricCard label="Quality score" value={data.quality.score} />
        <MetricCard label="Zero-result rate" value={`${(data.quality.zeroResultRate * 100).toFixed(1)}%`} />
        <MetricCard label="Avg latency" value={`${Math.round(data.quality.avgLatencyMs)} ms`} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/search/index" className="text-primary underline">Index →</Link>
        <Link href="/dashboard/search/queries" className="text-primary underline">Queries →</Link>
        <Link href="/dashboard/search/zero-results" className="text-primary underline">Zero results →</Link>
        <Link href="/dashboard/search/quality" className="text-primary underline">Quality →</Link>
        <Link href="/dashboard/search/rag" className="text-primary underline">RAG →</Link>
        <Link href="/dashboard/search/assistant" className="text-primary underline">Assistant →</Link>
        <Link href="/dashboard/search/content-gaps" className="text-primary underline">Content gaps →</Link>
      </div>

      {data.overview.activeIndexVersion && (
        <p className="text-xs text-muted">Active index: {data.overview.activeIndexVersion}</p>
      )}
    </div>
  );
}
