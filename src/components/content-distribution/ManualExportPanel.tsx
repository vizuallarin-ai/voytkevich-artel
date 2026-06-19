"use client";

import { useState } from "react";
import type { ManualExportPayload } from "@/lib/content-distribution/manual-export";
import { Button } from "@/components/ui/button";
import { trackPublicationManualExportCopied } from "@/lib/content-distribution/publication-analytics";

type Props = {
  publicationId: string;
  exportPayload: ManualExportPayload;
  onMarkedPublished?: () => void;
};

export function ManualExportPanel({ publicationId, exportPayload, onMarkedPublished }: Props) {
  const [publishedUrl, setPublishedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function copyText() {
    void navigator.clipboard.writeText(exportPayload.copyableText);
    trackPublicationManualExportCopied({ publicationId, platformId: exportPayload.platformId });
  }

  function copyUtm() {
    void navigator.clipboard.writeText(exportPayload.utmUrl);
    trackPublicationManualExportCopied({ publicationId, type: "utm" });
  }

  async function markPublished() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/dashboard/content-distribution/publications/${publicationId}/mark-published`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publishedUrl }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      onMarkedPublished?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold">Manual export — {exportPayload.platformTitle}</h3>
      <ol className="list-decimal pl-5 text-sm space-y-1 text-muted">
        {exportPayload.checklist.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <pre className="rounded-lg bg-muted-bg p-3 text-xs whitespace-pre-wrap overflow-x-auto">
        {exportPayload.copyableText}
      </pre>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={copyText}>
          Copy text
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copyUtm}>
          Copy UTM URL
        </Button>
      </div>
      <label className="block space-y-1 text-sm">
        <span>Published URL на площадке</span>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={publishedUrl}
          onChange={(e) => setPublishedUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" disabled={!publishedUrl.trim() || loading} onClick={markPublished}>
        Mark as published manually
      </Button>
    </div>
  );
}
