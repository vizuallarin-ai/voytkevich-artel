"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ContentExperimentsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/content-experiments").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/content/refresh" className="text-sm text-muted underline">← Refresh</Link>
      <h1 className="heading-section text-3xl">Content experiments</h1>
      <p className="text-sm text-muted max-w-3xl">
        Контролируемые SEO/CTA эксперименты с guardrails. Без cloaking и автопубликации.
      </p>
      {!data ? (
        <p className="text-sm text-muted">Загрузка...</p>
      ) : (
        <pre className="text-xs overflow-auto max-h-[520px] rounded-sm border border-graphite/10 p-4 bg-graphite/5">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
