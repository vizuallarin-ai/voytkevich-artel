"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackCrawlBudgetCalculated } from "@/lib/seo-indexation/indexation-analytics";

export default function CrawlBudgetPage() {
  const [data, setData] = useState<{ summary: Record<string, number>; waste: { url: string; reason: string }[] } | null>(null);

  useEffect(() => {
    trackCrawlBudgetCalculated({});
    fetch("/api/dashboard/seo-indexation/crawl-budget").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/seo/indexation" className="text-sm text-muted underline">← Indexation</Link>
      <h1 className="heading-section text-3xl">Crawl budget</h1>
      <p className="text-sm text-muted">Internal crawl priority — не реальная частота обхода Google/Яндекс.</p>
      {data && (
        <>
          <p className="text-sm">Waste candidates: {data.summary.wasteCount ?? 0}</p>
          <ul className="text-xs space-y-1">
            {data.waste.map((w) => (
              <li key={w.url}>{w.reason} — {w.url}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
