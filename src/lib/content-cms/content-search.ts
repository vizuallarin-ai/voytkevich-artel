import type { CMSContentItem, ContentFilters } from "@/types/content-cms";

export function filterContentItems(
  items: CMSContentItem[],
  filters?: ContentFilters,
): CMSContentItem[] {
  if (!filters) return items;

  return items.filter((item) => {
    if (filters.kind?.length && !filters.kind.includes(item.kind)) return false;
    if (filters.status?.length && !filters.status.includes(item.status)) return false;
    if (filters.qualityLevel?.length && !filters.qualityLevel.includes(item.quality.level)) {
      return false;
    }
    if (filters.priority?.length && item.seo.priority && !filters.priority.includes(item.seo.priority)) {
      return false;
    }
    if (filters.indexable !== undefined && item.indexing.indexable !== filters.indexable) return false;
    if (filters.sitemap !== undefined && item.indexing.sitemap !== filters.sitemap) return false;
    if (filters.requiresHumanReview && !item.quality.requiresHumanReview) return false;
    if (filters.requiresExpertReview && !item.quality.requiresExpertReview) return false;
    if (filters.requiresFactCheck && !item.quality.requiresFactCheck) return false;
    if (filters.requiresSource && !item.quality.requiresSource) return false;
    if (filters.requiresFictionNotice && !item.quality.requiresFictionNotice) return false;
    if (filters.teaserReady !== undefined && item.distribution.teaserReady !== filters.teaserReady) {
      return false;
    }
    if (filters.authorId && item.authorId !== filters.authorId) return false;
    if (filters.rubricId && item.rubricId !== filters.rubricId) return false;
    if (filters.clusterId && item.clusterId !== filters.clusterId) return false;
    if (filters.hasBlockers && item.quality.blockers.length === 0) return false;
    if (filters.hasWarnings && item.quality.warnings.length === 0) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${item.title} ${item.slug} ${item.seo.targetKeyword ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function searchContent(items: CMSContentItem[], query: string): CMSContentItem[] {
  return filterContentItems(items, { search: query });
}

export function sortContentByPriority(items: CMSContentItem[]): CMSContentItem[] {
  const order = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 } as const;
  return [...items].sort((a, b) => {
    const pa = a.seo.priority ? order[a.seo.priority] : 99;
    const pb = b.seo.priority ? order[b.seo.priority] : 99;
    return pa - pb;
  });
}
