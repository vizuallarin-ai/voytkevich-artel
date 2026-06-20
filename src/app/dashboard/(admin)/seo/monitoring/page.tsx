"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MonitoringPage() {
  const [data, setData] = useState<{ dataSourceAvailable: boolean; records: { url: string; searchEngine: string; status: string }[] } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/seo-indexation/monitoring").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/seo/indexation" className="text-sm text-muted underline">← Indexation</Link>
      <h1 className="heading-section text-3xl">Indexation monitoring</h1>
      {!data?.dataSourceAvailable && (
        <p className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          GSC / Яндекс Вебмастер не подключены — status = unknown. TODO: API credentials.
        </p>
      )}
      <ul className="text-xs space-y-1 max-h-96 overflow-auto">
        {data?.records.slice(0, 40).map((r) => (
          <li key={`${r.searchEngine}-${r.url}`}>{r.searchEngine}: {r.status} — {r.url}</li>
        ))}
      </ul>
    </div>
  );
}
