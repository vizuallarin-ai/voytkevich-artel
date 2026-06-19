"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SemanticCluster } from "@/types/semantic-clusters";
import { SemanticClusterTable } from "@/components/content-prioritization/SemanticClusterTable";

export default function ClustersPage() {
  const [clusters, setClusters] = useState<SemanticCluster[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/content-prioritization/clusters")
      .then((r) => r.json())
      .then((d) => setClusters(d.clusters ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/prioritization" className="text-sm text-muted underline">
          ← Приоритизация
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Semantic clusters</h1>
        <p className="mt-2 text-sm text-muted">Сид из seo-clusters. demandLevel = unknown без импорта.</p>
      </div>
      <SemanticClusterTable clusters={clusters} />
    </div>
  );
}
