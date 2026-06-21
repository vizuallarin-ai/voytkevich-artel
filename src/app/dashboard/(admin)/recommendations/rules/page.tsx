"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RulesData = {
  activeRuleset: { id: string; name: string; status: string } | null;
  draftCount: number;
  recentAudit: { action: string; entityType: string; entityId: string; createdAt: string }[];
};

export default function RecommendationsRulesPage() {
  const [data, setData] = useState<RulesData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/recommendations/rules")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/recommendations" className="text-sm text-muted underline">
        ← Recommendations
      </Link>
      <h1 className="heading-section text-3xl">Recommendation Rules</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : (
        <>
          <div className="rounded-sm border border-graphite/10 bg-background p-5">
            <p className="text-sm text-muted">Active ruleset</p>
            <p className="mt-1 font-display text-xl">
              {data.activeRuleset?.name ?? "Нет активного ruleset"}
            </p>
            <p className="mt-2 text-sm text-muted">Draft rulesets: {data.draftCount}</p>
          </div>
          <section>
            <h2 className="heading-section text-xl">Recent audit</h2>
            <ul className="mt-3 space-y-2">
              {data.recentAudit.map((entry) => (
                <li
                  key={`${entry.entityId}-${entry.createdAt}`}
                  className="rounded-sm border border-graphite/5 px-3 py-2 text-sm"
                >
                  <span className="text-muted">{entry.action}</span> — {entry.entityType} / {entry.entityId}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
