"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type DashboardData = {
  period: { from: string; to: string };
  kpi: {
    requests: number;
    generated: number;
    clicked: number;
    ctr: number;
    dismissRate: number;
    negativeFeedbackRate: number;
    averageLatencyMs: number;
  };
  assistedLeads: number;
  directLeads: number;
  privacyWarnings: number;
};

export function RecommendationsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/recommendations")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Загрузка recommendation analytics…</p>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Requests" value={data.kpi.requests} />
        <MetricCard label="Generated" value={data.kpi.generated} />
        <MetricCard label="CTR" value={`${(data.kpi.ctr * 100).toFixed(1)}%`} />
        <MetricCard label="Dismiss rate" value={`${(data.kpi.dismissRate * 100).toFixed(1)}%`} />
        <MetricCard label="Assisted leads" value={data.assistedLeads} />
        <MetricCard label="Direct leads" value={data.directLeads} />
        <MetricCard label="Avg latency" value={`${Math.round(data.kpi.averageLatencyMs)} ms`} />
        <MetricCard label="Privacy warnings" value={data.privacyWarnings} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/recommendations/rules" className="text-primary underline">
          Rules →
        </Link>
        <Link href="/dashboard/recommendations/quality" className="text-primary underline">
          Quality →
        </Link>
        <Link href="/dashboard/recommendations/privacy" className="text-primary underline">
          Privacy →
        </Link>
        <Link href="/dashboard/recommendations/review" className="text-primary underline">
          Review queue →
        </Link>
      </div>
    </div>
  );
}
