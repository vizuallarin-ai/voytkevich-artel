"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SitemapsPage() {
  const [data, setData] = useState<{ stats: Record<string, unknown>; entries: { url: string; segment: string }[] } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/seo-indexation/sitemaps").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/seo/indexation" className="text-sm text-muted underline">← Indexation</Link>
      <h1 className="heading-section text-3xl">Sitemaps</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка...</p>
      ) : (
        <>
          <p className="text-sm">Indexable URLs: {String(data.stats.indexableEntries)} · Excluded: {String(data.stats.excludedEntries)}</p>
          <ul className="text-xs space-y-1 max-h-96 overflow-auto">
            {data.entries.map((e) => (
              <li key={e.url}>{e.segment} — {e.url}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
