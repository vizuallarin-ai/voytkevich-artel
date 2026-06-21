"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GapRow = {
  id: string;
  normalizedQuery: string;
  frequency: number;
  commercialRelevance: string;
  status: string;
  lastSeenAt: string;
};

export default function SearchContentGapsPage() {
  const [items, setItems] = useState<GapRow[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/search/content-gaps")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className="text-sm text-muted underline">← Search</Link>
      <h1 className="heading-section text-3xl">Content Gaps</h1>
      <p className="text-xs text-muted">
        Повторяющиеся zero-result queries — кандидаты на контент, не автоматическое создание.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted">
            <th className="p-2">Query</th>
            <th className="p-2">Frequency</th>
            <th className="p-2">Commercial</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 50).map((row) => (
            <tr key={row.id} className="border-b border-graphite/5">
              <td className="p-2">{row.normalizedQuery}</td>
              <td className="p-2">{row.frequency}</td>
              <td className="p-2">{row.commercialRelevance}</td>
              <td className="p-2">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
