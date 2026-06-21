"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ClusterArch = {
  cluster: { id: string; title: string };
  graph: {
    pillarNodeId?: string;
    hubNodeIds: string[];
    memberNodeIds: string[];
    coverage: { missingTopics: string[]; duplicateTopics: string[] };
    health: { score: number; orphanCount: number; averageDepth: number | null };
  };
};

export default function ClusterArchitecturePage() {
  const [architecture, setArchitecture] = useState<ClusterArch[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/clusters/architecture")
      .then((r) => r.json())
      .then((data) => setArchitecture(data.architecture ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/knowledge-graph" className="text-sm text-muted underline">
          ← Knowledge Graph
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Cluster Architecture</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Pillar-cluster модель: pillar, hub, supporting, commercial destinations, topic coverage.
        </p>
      </div>

      <div className="space-y-4">
        {architecture.map(({ cluster, graph }) => (
          <article key={cluster.id} className="rounded-sm border border-graphite/10 p-4">
            <h2 className="font-semibold">{cluster.title}</h2>
            <p className="mt-1 text-xs text-muted">
              Health {graph.health.score} · Members {graph.memberNodeIds.length} · Orphans {graph.health.orphanCount}
            </p>
            {graph.pillarNodeId && (
              <p className="mt-2 text-sm">Pillar: {graph.pillarNodeId}</p>
            )}
            {graph.coverage.missingTopics.length > 0 && (
              <p className="mt-2 text-xs text-muted">
                Missing topics: {graph.coverage.missingTopics.slice(0, 5).join(", ")}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
