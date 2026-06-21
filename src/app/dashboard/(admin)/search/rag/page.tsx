"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type RAGData = {
  report: {
    sessions: number;
    retrieval: { fragmentCount: number; avgRelevance: number; coverageScore: number; sourceDiversity: number };
    citationSupport: { citationCount: number; supportedCitationCount: number; supportRatio: number };
    groundedness: { groundednessScore: number; unsupportedKeywordCount: number };
  };
  injectionAttempts: number;
};

export default function SearchRAGPage() {
  const [data, setData] = useState<RAGData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/search/rag")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className="text-sm text-muted underline">← Search</Link>
      <h1 className="heading-section text-3xl">RAG Quality</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Assistant sessions" value={data.report.sessions} />
            <MetricCard label="Avg relevance" value={data.report.retrieval.avgRelevance.toFixed(2)} />
            <MetricCard label="Citation support" value={`${(data.report.citationSupport.supportRatio * 100).toFixed(0)}%`} />
            <MetricCard label="Groundedness" value={data.report.groundedness.groundednessScore.toFixed(2)} />
            <MetricCard label="Injection attempts" value={data.injectionAttempts} />
          </div>
          <p className="text-xs text-muted">
            Метрики агрегированы; полный диалог не сохраняется без privacy policy.
          </p>
        </>
      )}
    </div>
  );
}
