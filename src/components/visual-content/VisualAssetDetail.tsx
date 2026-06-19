"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { VisualAsset } from "@/types/visual-content";
import type { ImageValidationResult } from "@/types/image-generation";
import { ImageSafetyPanel } from "@/components/visual-content/ImageSafetyPanel";
import { ImageUsagePanel } from "@/components/visual-content/ImageUsagePanel";
import { VisualFormatPreview } from "@/components/visual-content/VisualFormatPreview";
import { ImagePromptPreview } from "@/components/visual-content/ImagePromptPreview";

export function VisualAssetDetail() {
  const params = useParams();
  const imageId = params.imageId as string;
  const [asset, setAsset] = useState<VisualAsset | null>(null);
  const [validation, setValidation] = useState<ImageValidationResult | null>(null);
  const [audit, setAudit] = useState<Array<{ action: string; at: string; details?: string }>>([]);
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(true);

  function reload() {
    return fetch(`/api/dashboard/visual-content/assets/${imageId}`)
      .then((r) => r.json())
      .then((data) => {
        setAsset(data.asset);
        setValidation(data.validation);
        setAudit(data.audit ?? []);
        setAlt(data.asset?.seo?.alt ?? "");
      });
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [imageId]);

  async function handleApprove() {
    await fetch(`/api/dashboard/visual-content/assets/${imageId}/approve`, { method: "POST" });
    await reload();
  }

  async function handleReject() {
    await fetch(`/api/dashboard/visual-content/assets/${imageId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Manual reject from dashboard" }),
    });
    await reload();
  }

  async function handleSaveAlt() {
    await fetch(`/api/dashboard/visual-content/assets/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seo: { alt } }),
    });
    await reload();
  }

  if (loading) return <p className="text-sm text-muted">Загрузка...</p>;
  if (!asset) return <p className="text-sm text-destructive">Asset not found</p>;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-video overflow-hidden rounded-sm border border-graphite/10 bg-graphite/5">
            {asset.fileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.fileUrl} alt={asset.seo.alt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">Нет файла — prompt only</div>
            )}
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted text-xs">Status</dt>
              <dd>{asset.status}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Kind</dt>
              <dd>{asset.kind}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Source</dt>
              <dd>{asset.source}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">Format</dt>
              <dd>{asset.format.aspectRatio}</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-4">
          <ImageSafetyPanel asset={asset} validation={validation} />
          <ImageUsagePanel asset={asset} />
        </div>
      </div>

      <section>
        <h2 className="font-medium text-sm mb-2">Alt text</h2>
        <textarea
          className="w-full rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm min-h-[60px]"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void handleSaveAlt()}
          className="mt-2 rounded-sm border border-graphite/20 px-3 py-1 text-sm"
        >
          Save alt
        </button>
      </section>

      <section>
        <h2 className="font-medium mb-3">Format variants</h2>
        <VisualFormatPreview asset={asset} />
      </section>

      <section>
        <h2 className="font-medium mb-3">Prompts</h2>
        <ImagePromptPreview
          prompt={asset.prompts?.generationPrompt ?? asset.prompts?.visualBrief}
          negativePrompt={asset.prompts?.negativePrompt}
        />
      </section>

      {audit.length > 0 && (
        <section>
          <h2 className="font-medium mb-3">Audit log</h2>
          <ul className="text-xs space-y-1">
            {audit.map((e) => (
              <li key={`${e.at}-${e.action}`}>
                {e.at} — {e.action} {e.details ? `(${e.details})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!validation?.canApprove}
          onClick={() => void handleApprove()}
          className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => void handleReject()}
          className="rounded-sm border border-destructive/30 px-4 py-2 text-sm text-destructive"
        >
          Reject
        </button>
        <Link href="/dashboard/content/visuals/generate" className="rounded-sm border border-graphite/20 px-4 py-2 text-sm">
          Generate variants
        </Link>
      </div>
    </div>
  );
}
