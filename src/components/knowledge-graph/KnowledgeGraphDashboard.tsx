"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";
import type { KnowledgeGraphDashboardData } from "@/lib/knowledge-graph/knowledge-graph-dashboard-service";

type ApiResponse = {
  kpis: KnowledgeGraphDashboardData["kpis"];
  validation: {
    valid: boolean;
    errorCount: number;
    warningCount: number;
    issues: Array<{ severity: string; message: string; nodeId?: string; edgeId?: string }>;
  };
  subgraph: KnowledgeGraphDashboardData["subgraph"];
};

export function KnowledgeGraphDashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/knowledge-graph")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load knowledge graph");
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">Ошибка: {error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted">Загрузка Knowledge Graph...</p>;
  }

  const k = data.kpis;

  return (
    <div className="space-y-8">
      <p className="text-xs text-muted">
        Смысловой слой контента: сущности → связи → перелинковка → review → публикация.
        Полный граф не загружается в браузер — только subgraph (до 80 узлов).
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Nodes" value={k.nodes} />
        <MetricCard label="Edges" value={k.edges} />
        <MetricCard label="Active edges" value={k.activeEdges} />
        <MetricCard label="Suggested edges" value={k.suggestedEdges} />
        <MetricCard label="Entities" value={k.entities} />
        <MetricCard label="Orphan pages" value={k.orphanPages} />
        <MetricCard label="Suggested links" value={k.suggestedLinks} />
        <MetricCard label="Validation errors" value={k.validationErrors} />
        <MetricCard label="Cannibalization" value={k.cannibalizationConflicts} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/content/internal-linking" className="text-primary underline">
          Internal Linking →
        </Link>
        <Link href="/dashboard/content/internal-linking/orphans" className="text-primary underline">
          Orphan Pages →
        </Link>
        <Link href="/dashboard/content/clusters/architecture" className="text-primary underline">
          Cluster Architecture →
        </Link>
        <Link href="/dashboard/content/knowledge-graph/cannibalization" className="text-primary underline">
          Cannibalization →
        </Link>
        <Link href="/dashboard/content/knowledge-graph/journeys" className="text-primary underline">
          User Journeys →
        </Link>
      </div>

      {!data.validation.valid && (
        <section>
          <h2 className="mb-3 font-semibold">Validation issues ({data.validation.errorCount} errors)</h2>
          <ul className="space-y-2 text-sm">
            {data.validation.issues.slice(0, 10).map((issue, i) => (
              <li key={i} className="rounded-sm border border-graphite/10 p-3">
                <span className="text-xs uppercase text-muted">{issue.severity}</span>
                <p className="mt-1">{issue.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Subgraph preview (table)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-left text-xs text-muted">
                <th className="p-2">Node</th>
                <th className="p-2">Type</th>
                <th className="p-2">Status</th>
                <th className="p-2">Indexability</th>
              </tr>
            </thead>
            <tbody>
              {data.subgraph.nodes.slice(0, 20).map((node) => (
                <tr key={node.id} className="border-b border-graphite/5">
                  <td className="p-2">{node.title}</td>
                  <td className="p-2 text-muted">{node.type}</td>
                  <td className="p-2">{node.status}</td>
                  <td className="p-2">{node.indexability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          {data.subgraph.nodes.length} nodes · {data.subgraph.edges.length} edges в subgraph
        </p>
      </section>
    </div>
  );
}
