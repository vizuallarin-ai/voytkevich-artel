"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchQueriesPage() {
  const [items, setItems] = useState<Array<{ normalizedQuery: string; count: number; zeroResults: number }>>([]);

  useEffect(() => {
    fetch("/api/dashboard/search/queries")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className="text-sm text-muted underline">← Search</Link>
      <h1 className="heading-section text-3xl">Search Queries</h1>
      <p className="text-xs text-muted">Агрегированные normalized queries без PII.</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted">
            <th className="p-2">Query</th>
            <th className="p-2">Count</th>
            <th className="p-2">Zero results</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 50).map((row) => (
            <tr key={row.normalizedQuery} className="border-b border-graphite/5">
              <td className="p-2">{row.normalizedQuery}</td>
              <td className="p-2">{row.count}</td>
              <td className="p-2">{row.zeroResults}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
