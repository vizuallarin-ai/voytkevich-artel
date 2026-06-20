import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPriorityLevel } from "@/types/content-prioritization";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability, shouldIncludeInSitemap } from "@/lib/seo-indexation/indexability-service";
import { sitemapPriorityByContentPriority } from "@/data/seo-indexation-rules";

export type PriorityIndexationRecommendation = {
  contentItemId: string;
  priority: ContentPriorityLevel;
  indexable: boolean;
  sitemap: boolean;
  sitemapPriority: number;
  deferReason?: string;
};

export function getPriorityIndexationRecommendation(item: CMSContentItem): PriorityIndexationRecommendation {
  const page = cmsItemToIndexablePage(item);
  const decision = evaluateIndexability(page);
  const priority = item.seo.priority ?? "P3";

  return {
    contentItemId: item.id,
    priority,
    indexable: decision.indexable,
    sitemap: shouldIncludeInSitemap(page),
    sitemapPriority: sitemapPriorityByContentPriority[priority],
    deferReason: priority === "P5" ? "P5 deferred from sitemap" : undefined,
  };
}

export function sortCMSItemsForSitemapInclusion(items: CMSContentItem[]): CMSContentItem[] {
  return [...items].sort((a, b) => {
    const pa = sitemapPriorityByContentPriority[a.seo.priority ?? "P3"];
    const pb = sitemapPriorityByContentPriority[b.seo.priority ?? "P3"];
    return pb - pa;
  });
}

export function filterCMSItemsEligibleForSitemap(items: CMSContentItem[]): CMSContentItem[] {
  return sortCMSItemsForSitemapInclusion(
    items.filter((item) => shouldIncludeInSitemap(cmsItemToIndexablePage(item))),
  );
}

export function explainPriorityIndexation(item: CMSContentItem): string {
  const rec = getPriorityIndexationRecommendation(item);
  return `Priority ${rec.priority}: indexable=${rec.indexable}, sitemap=${rec.sitemap}, weight=${rec.sitemapPriority}${rec.deferReason ? ` (${rec.deferReason})` : ""}`;
}
