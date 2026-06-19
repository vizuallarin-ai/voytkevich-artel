"use client";

import type { VisualAsset } from "@/types/visual-content";
import Link from "next/link";

type Props = {
  items: VisualAsset[];
};

export function VisualAssetTable({ items }: Props) {
  if (!items.length) {
    return <p className="text-sm text-muted">Visual assets пока нет.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-graphite/10">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-graphite/10 bg-graphite/5 text-xs text-muted">
          <tr>
            <th className="p-3">Preview</th>
            <th className="p-3">Title</th>
            <th className="p-3">Kind</th>
            <th className="p-3">Source</th>
            <th className="p-3">Status</th>
            <th className="p-3">Format</th>
            <th className="p-3">Safety</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((asset) => (
            <tr key={asset.id} className="border-b border-graphite/5 last:border-0">
              <td className="p-3">
                <div className="h-10 w-16 overflow-hidden rounded-sm bg-graphite/5">
                  {asset.thumbnailUrl || asset.fileUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.thumbnailUrl ?? asset.fileUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              </td>
              <td className="p-3 max-w-[200px] truncate">{asset.title}</td>
              <td className="p-3 text-xs">{asset.kind}</td>
              <td className="p-3 text-xs">{asset.source}</td>
              <td className="p-3 text-xs">{asset.status}</td>
              <td className="p-3 text-xs">{asset.format.aspectRatio}</td>
              <td className="p-3 text-xs">
                {asset.safety.misleadingRisk === "high" ? (
                  <span className="text-destructive">high</span>
                ) : (
                  asset.safety.misleadingRisk
                )}
              </td>
              <td className="p-3">
                <Link href={`/dashboard/content/visuals/${asset.id}`} className="text-primary underline text-xs">
                  Открыть
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
