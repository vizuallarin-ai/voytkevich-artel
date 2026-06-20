import type { ContentAnalyticsPeriod, ContentPerformanceSnapshot } from "@/types/content-analytics";
import type { CMSContentItem } from "@/types/content-cms";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";
import { checkIndexationStatus } from "@/lib/seo-indexation/indexation-monitoring-service";
import {
  buildContentPerformanceSnapshots,
  contentPerformanceSnapshotService,
} from "@/lib/content-analytics/content-performance-snapshot-service";

export type IndexationPerformanceItem = {
  contentItemId: string;
  url: string;
  contentType: string;
  priorityLevel?: string;
  published: boolean;
  indexable: boolean;
  sitemapIncluded: boolean;
  externallyIndexed: boolean | null;
  indexationStatus: "unknown" | "indexed" | "not-indexed" | "not-checked";
};

async function buildIndexationItem(item: CMSContentItem, allItems: CMSContentItem[]): Promise<IndexationPerformanceItem> {
  const page = cmsItemToIndexablePage(item);
  const decision = evaluateIndexability(page, { existingItems: allItems });
  const monitoring = await checkIndexationStatus(page.url, "google");

  let externallyIndexed: boolean | null = null;
  let indexationStatus: IndexationPerformanceItem["indexationStatus"] = "unknown";

  if (monitoring.status === "indexed") {
    externallyIndexed = true;
    indexationStatus = "indexed";
  } else if (monitoring.status === "excluded" || monitoring.status === "blocked-by-robots") {
    externallyIndexed = false;
    indexationStatus = "not-indexed";
  } else if (monitoring.status === "not-checked" || monitoring.status === "unknown") {
    externallyIndexed = null;
    indexationStatus = "not-checked";
  }

  return {
    contentItemId: item.id,
    url: item.url,
    contentType: item.kind,
    priorityLevel: item.seo.priority,
    published: item.status === "published",
    indexable: decision.indexable,
    sitemapIncluded: decision.sitemap,
    externallyIndexed,
    indexationStatus,
  };
}

export async function comparePublishedVsIndexed(period: ContentAnalyticsPeriod): Promise<{
  published: number;
  indexable: number;
  externallyIndexed: number | null;
  unknown: number;
}> {
  const items = await contentRepository.listContent();
  const publishedItems = items.filter((i) => i.status === "published");
  const indexationItems = await Promise.all(items.map((item) => buildIndexationItem(item, items)));

  const indexable = indexationItems.filter((i) => i.indexable && i.published).length;
  const externallyIndexed = indexationItems.filter((i) => i.externallyIndexed === true).length;
  const unknown = indexationItems.filter((i) => i.indexationStatus === "unknown" || i.indexationStatus === "not-checked").length;

  return {
    published: publishedItems.length,
    indexable,
    externallyIndexed: externallyIndexed > 0 ? externallyIndexed : null,
    unknown,
  };
}

export function calculateTimeToDiscovery(item: IndexationPerformanceItem): number | null {
  return null;
}

export function calculateTimeToCrawl(item: IndexationPerformanceItem): number | null {
  return null;
}

export function calculateTimeToIndex(item: IndexationPerformanceItem): number | null {
  return null;
}

export function findPublishedNotIndexed(items: IndexationPerformanceItem[]): IndexationPerformanceItem[] {
  return items.filter(
    (i) => i.published && i.indexable && i.externallyIndexed === false,
  );
}

export function findIndexedNotInSitemap(items: IndexationPerformanceItem[]): IndexationPerformanceItem[] {
  return items.filter(
    (i) => i.externallyIndexed === true && !i.sitemapIncluded,
  );
}

export function findSitemapNotIndexed(items: IndexationPerformanceItem[]): IndexationPerformanceItem[] {
  return items.filter(
    (i) => i.sitemapIncluded && i.externallyIndexed === false,
  );
}

export function findIndexationAnomalies(items: IndexationPerformanceItem[]): IndexationPerformanceItem[] {
  return [
    ...findIndexedNotInSitemap(items),
    ...findSitemapNotIndexed(items),
    ...items.filter((i) => i.published && !i.indexable && i.sitemapIncluded),
  ];
}

export function groupIndexationPerformanceByContentType(
  items: IndexationPerformanceItem[],
): Record<string, IndexationPerformanceItem[]> {
  const grouped: Record<string, IndexationPerformanceItem[]> = {};
  for (const item of items) {
    if (!grouped[item.contentType]) grouped[item.contentType] = [];
    grouped[item.contentType].push(item);
  }
  return grouped;
}

export function groupIndexationPerformanceByPriority(
  items: IndexationPerformanceItem[],
): Record<string, IndexationPerformanceItem[]> {
  const grouped: Record<string, IndexationPerformanceItem[]> = {};
  for (const item of items) {
    const key = item.priorityLevel ?? "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return grouped;
}

export async function getIndexationPerformanceItems(): Promise<IndexationPerformanceItem[]> {
  const items = await contentRepository.listContent();
  return Promise.all(items.map((item) => buildIndexationItem(item, items)));
}

export async function getIndexationPerformanceFromSnapshots(
  period: ContentAnalyticsPeriod,
): Promise<{ snapshots: ContentPerformanceSnapshot[]; items: IndexationPerformanceItem[] }> {
  const [snapshots, items] = await Promise.all([
    contentPerformanceSnapshotService.buildSnapshots(period),
    getIndexationPerformanceItems(),
  ]);
  return { snapshots, items };
}

export const indexationPerformanceService = {
  comparePublishedVsIndexed,
  calculateTimeToDiscovery,
  calculateTimeToCrawl,
  calculateTimeToIndex,
  findPublishedNotIndexed,
  findIndexedNotInSitemap,
  findSitemapNotIndexed,
  findIndexationAnomalies,
  groupIndexationPerformanceByContentType,
  groupIndexationPerformanceByPriority,
  getIndexationPerformanceItems,
  getIndexationPerformanceFromSnapshots,
};
