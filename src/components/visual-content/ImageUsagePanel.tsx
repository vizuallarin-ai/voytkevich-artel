"use client";

import type { VisualAsset } from "@/types/visual-content";

type Props = {
  asset: VisualAsset;
};

export function ImageUsagePanel({ asset }: Props) {
  const usages = [
    asset.usage.siteCover && "Site cover",
    asset.usage.openGraph && "Open Graph",
    asset.usage.socialTeaser && "Social teaser",
    asset.usage.blogInline && "Blog inline",
    asset.usage.catalog && "Catalog",
    asset.usage.casePage && "Case page",
    asset.usage.dashboardOnly && "Dashboard only",
  ].filter((u): u is string => Boolean(u));

  return (
    <div className="rounded-sm border border-graphite/10 p-4 space-y-3">
      <h3 className="font-medium text-sm">Usage</h3>
      <ul className="text-xs space-y-1">
        {usages.length ? usages.map((u) => <li key={u}>{u}</li>) : <li className="text-muted">Не назначено</li>}
      </ul>
      <dl className="text-xs space-y-2">
        {asset.related.contentItemId && (
          <div>
            <dt className="text-muted">Content item</dt>
            <dd>{asset.related.contentItemId}</dd>
          </div>
        )}
        {asset.related.publicationId && (
          <div>
            <dt className="text-muted">Publication</dt>
            <dd>{asset.related.publicationId}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
