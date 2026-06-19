"use client";

import { useState } from "react";
import { trackKeywordCsvImportStarted } from "@/lib/content-prioritization/priority-analytics";

type Props = { onImported?: () => void };

const SAMPLE = `keyword,searchVolume,region,source,cluster,intent
строительство домов под ключ иркутск,,irkutsk,csv-import,turnkey,commercial
дом под ключ иркутск,,irkutsk,csv-import,turnkey,commercial`;

export function CSVImportPanel({ onImported }: Props) {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setLoading(true);
    setError(null);
    setResult(null);
    trackKeywordCsvImportStarted({});
    const res = await fetch("/api/dashboard/content-prioritization/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setResult(`Imported: ${data.imported}, duplicates: ${data.duplicates}`);
    onImported?.();
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-muted">
        Вставьте CSV (keyword, searchVolume, region, source, cluster, intent). Пустой volume = null, не
        fake number.
      </p>
      <textarea
        className="w-full min-h-[200px] rounded-sm border border-graphite/20 p-3 font-mono text-xs"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        placeholder={SAMPLE}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading || !csv.trim()}
          onClick={() => void handleImport()}
          className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          Import
        </button>
        <button
          type="button"
          onClick={() => setCsv(SAMPLE)}
          className="rounded-sm border border-graphite/20 px-4 py-2 text-sm"
        >
          Load sample
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && <p className="text-sm text-emerald-800">{result}</p>}
    </div>
  );
}
