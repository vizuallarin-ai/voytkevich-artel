"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Conflict = {
  id: string;
  sourceContentItemId: string;
  targetContentItemId: string;
  severity: string;
  confidence: string;
  titleSimilarity: number;
};

export default function CannibalizationPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/knowledge-graph/cannibalization")
      .then((r) => r.json())
      .then((data) => setConflicts(data.conflicts ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/knowledge-graph" className="text-sm text-muted underline">
          ← Knowledge Graph
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Cannibalization</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Конфликты интента между страницами. Semantic similarity сама по себе не доказывает каннибализацию.
        </p>
      </div>

      {conflicts.length === 0 ? (
        <p className="text-sm text-muted">Конфликты не обнаружены.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {conflicts.slice(0, 30).map((c) => (
            <li key={c.id} className="rounded-sm border border-graphite/10 p-3">
              <strong>{c.sourceContentItemId}</strong> ↔ {c.targetContentItemId}
              <span className="ml-2 text-xs text-muted">
                {c.severity} · {c.confidence} · sim {c.titleSimilarity.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
