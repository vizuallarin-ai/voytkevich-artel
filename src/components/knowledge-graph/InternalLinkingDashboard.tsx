"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type Summary = {
  total: number;
  active: number;
  broken: number;
  redirected: number;
  noindexTarget: number;
};

type Opportunity = {
  id: string;
  sourceContentItemId: string;
  targetContentItemId: string;
  score: number;
  confidence: string;
  explanation: string;
  suggestedAnchors: string[];
  status: string;
};

export function InternalLinkingDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/internal-linking")
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        setOpportunities(data.sampleOpportunities ?? []);
      });
  }, []);

  if (!summary) {
    return <p className="text-sm text-muted">Загрузка internal linking...</p>;
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-muted">
        Рекомендации ссылок требуют human review. Batch: preview → approve → apply → verify → rollback.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total links" value={summary.total} />
        <MetricCard label="Active" value={summary.active} />
        <MetricCard label="Broken" value={summary.broken} />
        <MetricCard label="Redirect targets" value={summary.redirected} />
        <MetricCard label="Noindex targets" value={summary.noindexTarget} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/content/knowledge-graph" className="text-primary underline">
          ← Knowledge Graph
        </Link>
        <Link href="/dashboard/content/internal-linking/orphans" className="text-primary underline">
          Orphan Pages →
        </Link>
      </div>

      {opportunities.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">Sample link opportunities</h2>
          <ul className="space-y-2 text-sm">
            {opportunities.map((o) => (
              <li key={o.id} className="rounded-sm border border-graphite/10 p-3">
                <strong>Score {o.score}</strong>
                <span className="ml-2 text-xs text-muted">{o.confidence} · {o.status}</span>
                <p className="mt-1 text-muted">{o.explanation}</p>
                {o.suggestedAnchors[0] && (
                  <p className="mt-1 text-xs">Anchor: {o.suggestedAnchors[0]}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
