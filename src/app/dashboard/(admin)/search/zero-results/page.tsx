"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = { normalizedQuery: string; frequency: number; commercialRelevance: string; status: string };

export default function SearchZeroResultsPage() {
  const [items, setItems] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/search/zero-results")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className="text-sm text-muted underline">← Search</Link>
      <h1 className="heading-section text-3xl">Zero Results</h1>
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
            <tr key={row.normalizedQuery} className="border-b border-graphite/5">
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
