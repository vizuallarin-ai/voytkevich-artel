"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type QualityData = {
  quality: {
    score: number;
    totalQueries: number;
    zeroResultRate: number;
    correctionRate: number;
    avgLatencyMs: number;
    feedbackNegativeRate: number;
  };
};

export default function SearchQualityPage() {
  const [data, setData] = useState<QualityData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/search/quality")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className="text-sm text-muted underline">← Search</Link>
      <h1 className="heading-section text-3xl">Search Quality</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Quality score" value={data.quality.score} />
          <MetricCard label="Total queries" value={data.quality.totalQueries} />
          <MetricCard label="Zero-result rate" value={`${data.quality.zeroResultRate}%`} />
          <MetricCard label="Correction rate" value={`${data.quality.correctionRate}%`} />
          <MetricCard label="Avg latency" value={`${Math.round(data.quality.avgLatencyMs)} ms`} />
          <MetricCard label="Negative feedback" value={`${data.quality.feedbackNegativeRate}%`} />
        </div>
      )}
    </div>
  );
}
