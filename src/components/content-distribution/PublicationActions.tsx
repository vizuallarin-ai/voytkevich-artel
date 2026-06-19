"use client";

import { useState } from "react";
import Link from "next/link";
import type { ExternalPublication } from "@/types/content-distribution";
import { Button } from "@/components/ui/button";

type Props = {
  publication: ExternalPublication;
  canPublish: boolean;
  requiresManualExport: boolean;
  onAction?: () => void;
};

export function PublicationActions({
  publication,
  canPublish,
  requiresManualExport,
  onAction,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string, url: string) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      onAction?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(null);
    }
  }

  const base = `/api/dashboard/content-distribution/publications/${publication.id}`;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {publication.status === "draft" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading !== null}
            onClick={() => run("validate", base)}
          >
            Validate
          </Button>
        )}
        {(publication.status === "draft" || publication.status === "review") && (
          <Button
            type="button"
            size="sm"
            disabled={loading !== null}
            onClick={() => run("approve", `${base}/approve`)}
          >
            Approve
          </Button>
        )}
        {canPublish && publication.status === "approved" && (
          <Button
            type="button"
            size="sm"
            disabled={loading !== null}
            onClick={() => run("publish", `${base}/publish`)}
          >
            {loading === "publish" ? "Publishing…" : "Publish"}
          </Button>
        )}
        {requiresManualExport && (
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href={`/dashboard/content/distribution/manual-export?id=${publication.id}`}>
              Manual export
            </Link>
          </Button>
        )}
      </div>
      {!canPublish && requiresManualExport && (
        <p className="text-xs text-muted">
          Нельзя опубликовать автоматически: платформа требует manual export.
        </p>
      )}
    </div>
  );
}
