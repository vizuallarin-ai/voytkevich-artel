"use client";

import type { VisualAsset } from "@/types/visual-content";
import Link from "next/link";

type Props = {
  asset: VisualAsset;
};

export function VisualAssetCard({ asset }: Props) {
  const preview = asset.thumbnailUrl ?? asset.fileUrl;
  return (
    <Link
      href={`/dashboard/content/visuals/${asset.id}`}
      className="block rounded-sm border border-graphite/10 bg-background p-4 transition hover:border-primary/30"
    >
      <div className="aspect-video overflow-hidden rounded-sm bg-graphite/5">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">Нет превью</div>
        )}
      </div>
      <p className="mt-3 font-medium line-clamp-2">{asset.title}</p>
      <p className="mt-1 text-xs text-muted">
        {asset.kind} · {asset.status} · {asset.format.aspectRatio}
      </p>
    </Link>
  );
}
