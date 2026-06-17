import type { CMSContentItem } from "@/types/content-cms";
import type { ContentStatus } from "@/types/content-workflow";
import { REVIEW_QUEUE_STATUSES } from "@/data/content-review-rules";

export type ContentDashboardMetrics = {
  total: number;
  byStatus: Partial<Record<ContentStatus, number>>;
  byKind: Record<string, number>;
  published: number;
  draft: number;
  review: number;
  approved: number;
  scheduled: number;
  noindex: number;
  requiresAttention: number;
  quality: {
    poor: number;
    acceptable: number;
    good: number;
    strong: number;
    blockersCount: number;
    warningsCount: number;
  };
  indexing: {
    indexable: number;
    noindex: number;
    sitemapEligible: number;
    canonicalMissing: number;
  };
  queueTop: CMSContentItem[];
  reviewTop: CMSContentItem[];
  blockersTop: CMSContentItem[];
};

export function computeContentDashboardMetrics(items: CMSContentItem[]): ContentDashboardMetrics {
  const byStatus: Partial<Record<ContentStatus, number>> = {};
  const byKind: Record<string, number> = {};
  let blockersCount = 0;
  let warningsCount = 0;

  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
    byKind[item.kind] = (byKind[item.kind] ?? 0) + 1;
    blockersCount += item.quality.blockers.length;
    warningsCount += item.quality.warnings.length;
  }

  const reviewStatuses = new Set<string>(REVIEW_QUEUE_STATUSES);

  return {
    total: items.length,
    byStatus,
    byKind,
    published: byStatus.published ?? 0,
    draft: (byStatus.draft ?? 0) + (byStatus.planned ?? 0) + (byStatus.idea ?? 0),
    review: items.filter((i) => reviewStatuses.has(i.status)).length,
    approved: byStatus.approved ?? 0,
    scheduled: byStatus.scheduled ?? 0,
    noindex: byStatus.noindex ?? 0,
    requiresAttention: items.filter(
      (i) =>
        i.quality.blockers.length > 0 ||
        reviewStatuses.has(i.status) ||
        i.status === "needs-update",
    ).length,
    quality: {
      poor: items.filter((i) => i.quality.level === "poor").length,
      acceptable: items.filter((i) => i.quality.level === "acceptable").length,
      good: items.filter((i) => i.quality.level === "good").length,
      strong: items.filter((i) => i.quality.level === "strong").length,
      blockersCount,
      warningsCount,
    },
    indexing: {
      indexable: items.filter((i) => i.indexing.indexable).length,
      noindex: items.filter((i) => !i.indexing.indexable).length,
      sitemapEligible: items.filter((i) => i.indexing.sitemap).length,
      canonicalMissing: items.filter(
        (i) => !i.indexing.canonicalUrl && i.seo.cannibalizationRisk === "high",
      ).length,
    },
    queueTop: items
      .filter((i) => ["planned", "approved", "scheduled"].includes(i.status))
      .slice(0, 8),
    reviewTop: items.filter((i) => reviewStatuses.has(i.status)).slice(0, 8),
    blockersTop: items.filter((i) => i.quality.blockers.length > 0).slice(0, 8),
  };
}
