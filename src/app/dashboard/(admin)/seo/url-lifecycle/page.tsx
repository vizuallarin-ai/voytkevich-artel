"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UrlLifecyclePage() {
  const [rows, setRows] = useState<{ title: string; url: string; lifecycle: string; indexable: boolean }[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/seo-indexation/url-lifecycle").then((r) => r.json()).then(setRows);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/seo/indexation" className="text-sm text-muted underline">← Indexation</Link>
      <h1 className="heading-section text-3xl">URL lifecycle</h1>
      <ul className="text-sm space-y-1 max-h-[480px] overflow-auto">
        {rows.map((r) => (
          <li key={r.url}>{r.lifecycle} · {r.indexable ? "index" : "noindex"} — {r.title}</li>
        ))}
      </ul>
    </div>
  );
}
