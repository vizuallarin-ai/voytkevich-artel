"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { KeywordDemandItem } from "@/types/keyword-demand";
import { KeywordDemandTable } from "@/components/content-prioritization/KeywordDemandTable";

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordDemandItem[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/content-prioritization/keywords")
      .then((r) => r.json())
      .then((d) => setKeywords(d.keywords ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/prioritization" className="text-sm text-muted underline">
          ← Приоритизация
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Keyword demand</h1>
      </div>
      <KeywordDemandTable items={keywords} />
    </div>
  );
}
