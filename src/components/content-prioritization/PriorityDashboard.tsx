"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PriorityMetrics, PriorityQueueItem } from "@/types/content-prioritization";
import { PriorityQueueTable } from "./PriorityQueueTable";
import { PriorityExplanationPanel } from "./PriorityExplanationPanel";
import { trackPriorityDashboardViewed } from "@/lib/content-prioritization/priority-analytics";

type DashboardData = {
  metrics: PriorityMetrics;
  keywordMetrics: { total: number; withVolume: number; withoutVolume: number };
  topP1: PriorityQueueItem[];
  needsKeywordData: PriorityQueueItem[];
  mode: string;
  clusterCount: number;
};

export function PriorityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    trackPriorityDashboardViewed({ page: "prioritization" });
    fetch("/api/dashboard/content-prioritization")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-muted">Загрузка приоритизации...</p>;

  const m = data.metrics;

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-graphite/10 bg-background p-4 text-sm">
        Mode: <strong>{data.mode}</strong>
        {data.mode === "heuristic" && (
          <span className="text-amber-700 ml-2">
            — нет импортированной частотности, P1 помечается как heuristic*
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "P1", value: m.p1 },
          { label: "P2", value: m.p2 },
          { label: "P3", value: m.p3 },
          { label: "Needs keyword data", value: m.needsKeywordData },
          { label: "Ready to schedule", value: m.readyToSchedule },
          { label: "High commercial", value: m.highCommercialIntent },
          { label: "High lead potential", value: m.highLeadPotential },
          { label: "Low confidence", value: m.lowConfidence },
          { label: "Cannibalization risk", value: m.highCannibalizationRisk },
          { label: "Keywords imported", value: data.keywordMetrics.total },
        ].map((k) => (
          <div key={k.label} className="rounded-sm border border-graphite/10 p-4">
            <p className="text-xs text-muted">{k.label}</p>
            <p className="mt-1 font-display text-2xl">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/content/prioritization/queue" className="text-primary underline">
          Очередь →
        </Link>
        <Link href="/dashboard/content/prioritization/keywords" className="text-primary underline">
          Keywords →
        </Link>
        <Link href="/dashboard/content/prioritization/clusters" className="text-primary underline">
          Clusters ({data.clusterCount}) →
        </Link>
        <Link href="/dashboard/content/prioritization/import" className="text-primary underline">
          CSV import →
        </Link>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Top P1</h2>
        <PriorityQueueTable queue={data.topP1} />
      </section>

      {data.topP1[0] && (
        <PriorityExplanationPanel score={data.topP1[0].score} title="Пример explanation" />
      )}

      <section>
        <h2 className="font-semibold mb-3">Needs keyword data</h2>
        <PriorityQueueTable queue={data.needsKeywordData} />
      </section>
    </div>
  );
}
