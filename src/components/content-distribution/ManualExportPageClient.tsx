"use client";

import { useEffect, useState } from "react";
import { ManualExportPanel } from "./ManualExportPanel";
import type { ManualExportPayload } from "@/lib/content-distribution/manual-export";

export function ManualExportPageClient({ publicationId }: { publicationId?: string }) {
  const [payload, setPayload] = useState<ManualExportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicationId) return;
    fetch(`/api/dashboard/content-distribution/publications/${publicationId}/manual-export`)
      .then((r) => r.json())
      .then((d) => {
        if (d.exportPayload) setPayload(d.exportPayload);
        else setError(d.error ?? "Not found");
      });
  }, [publicationId]);

  if (!publicationId) {
    return (
      <p className="text-sm text-muted">
        Укажите ?id=publicationId в URL или откройте manual export из карточки публикации.
      </p>
    );
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!payload) return <p className="text-sm text-muted">Загрузка…</p>;

  return <ManualExportPanel publicationId={publicationId} exportPayload={payload} />;
}
