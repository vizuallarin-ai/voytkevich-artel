"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type QualityData = {
  quality: {
    requests: number;
    generated: number;
    clicked: number;
    ctr: number;
    dismissRate: number;
    negativeFeedbackRate: number;
    fallbackRate: number;
    emptyRate: number;
    averageLatencyMs: number;
  };
  actions: string[];
  lowQuality: string[];
  highDismissal: string[];
  repetitionProblems: number;
};

export default function RecommendationsQualityPage() {
  const [data, setData] = useState<QualityData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/recommendations/quality")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/recommendations" className="text-sm text-muted underline">
        ← Recommendations
      </Link>
      <h1 className="heading-section text-3xl">Recommendation Quality</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Requests" value={data.quality.requests} />
            <MetricCard label="Generated" value={data.quality.generated} />
            <MetricCard label="CTR" value={`${(data.quality.ctr * 100).toFixed(1)}%`} />
            <MetricCard label="Fallback rate" value={`${(data.quality.fallbackRate * 100).toFixed(1)}%`} />
            <MetricCard label="Empty rate" value={`${(data.quality.emptyRate * 100).toFixed(1)}%`} />
            <MetricCard label="Repetition issues" value={data.repetitionProblems} />
          </div>
          {data.actions.length > 0 && (
            <section className="rounded-sm border border-graphite/10 bg-background p-5">
              <h2 className="heading-section text-xl">Suggested actions</h2>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted">
                {data.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </section>
          )}
          {(data.lowQuality.length > 0 || data.highDismissal.length > 0) && (
            <section className="rounded-sm border border-graphite/5 bg-graphite/[0.02] p-5">
              <h2 className="heading-section text-xl">Problem items</h2>
              <p className="mt-2 text-sm text-muted">
                Low quality: {data.lowQuality.length}, high dismissal: {data.highDismissal.length}
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
