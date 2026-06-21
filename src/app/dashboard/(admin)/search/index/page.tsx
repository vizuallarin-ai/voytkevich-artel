"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchIndexPage() {
  const [data, setData] = useState<{ activeVersion: unknown; versions: { items: unknown[] } } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/search/index")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/search" className="text-sm text-muted underline">← Search</Link>
      <h1 className="heading-section text-3xl">Search Index</h1>
      {!data ? (
        <p className="text-sm text-muted">Загрузка...</p>
      ) : (
        <pre className="overflow-x-auto rounded-sm border border-graphite/10 p-4 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
