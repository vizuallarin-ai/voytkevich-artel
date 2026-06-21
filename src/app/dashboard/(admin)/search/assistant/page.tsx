"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/content-analytics/MetricCard";

type AssistantData = {
  sessionCount: number;
  eventCount: number;
  recentSessions: Array<{ sessionId: string; intent?: string; buildingType?: string; updatedAt: string }>;
};

export default function SearchAssistantPage() {
  const [data, setData] = useState<AssistantData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/search/assistant")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className="text-sm text-muted underline">← Search</Link>
      <h1 className="heading-section text-3xl">Navigation Assistant</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Sessions" value={data.sessionCount} />
            <MetricCard label="Analytics events" value={data.eventCount} />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted">
                <th className="p-2">Session</th>
                <th className="p-2">Intent</th>
                <th className="p-2">Building type</th>
                <th className="p-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSessions.map((row) => (
                <tr key={row.sessionId} className="border-b border-graphite/5">
                  <td className="p-2 font-mono text-xs">{row.sessionId}</td>
                  <td className="p-2">{row.intent ?? "—"}</td>
                  <td className="p-2">{row.buildingType ?? "—"}</td>
                  <td className="p-2 text-xs text-muted">{row.updatedAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
