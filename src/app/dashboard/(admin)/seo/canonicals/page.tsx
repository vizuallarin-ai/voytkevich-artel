"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CanonicalsPage() {
  const [data, setData] = useState<{ summary: string; conflicts: { conflictType: string; relatedUrls: string[] }[] } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/seo-indexation/canonicals").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/seo/indexation" className="text-sm text-muted underline">← Indexation</Link>
      <h1 className="heading-section text-3xl">Canonicals</h1>
      {data && (
        <>
          <p className="text-sm">{data.summary}</p>
          <ul className="text-xs space-y-2">
            {data.conflicts.map((c, i) => (
              <li key={i}>{c.conflictType}: {c.relatedUrls.join(" → ")}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
