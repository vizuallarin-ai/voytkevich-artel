import type { CMSContentItem } from "@/types/content-cms";
import type { ContentIndexingDecision } from "@/types/content-indexing";
import { NON_INDEXABLE_STATUSES, isStatusIndexable } from "@/data/content-statuses";

export function resolveContentIndexing(item: CMSContentItem): ContentIndexingDecision {
  const issues: ContentIndexingDecision["issues"] = [];

  if (NON_INDEXABLE_STATUSES.includes(item.status) && item.indexing.indexable) {
    issues.push({
      type: "draft-indexable",
      severity: "high",
      message: `Статус «${item.status}» не должен индексироваться`,
    });
  }

  if (item.status === "ai-generated" && item.indexing.indexable) {
    issues.push({
      type: "ai-generated-indexable",
      severity: "high",
      message: "AI-generated не должен быть indexable",
    });
  }

  if (!item.indexing.canonicalUrl && item.seo.cannibalizationRisk === "high") {
    issues.push({
      type: "missing-canonical",
      severity: "high",
      message: "Canonical обязателен при high cannibalization risk",
    });
  }

  if (item.status === "published" && !item.indexing.indexable) {
    issues.push({
      type: "published-noindex",
      severity: "medium",
      message: "Опубликован, но noindex",
    });
  }

  if (item.indexing.indexable && !item.indexing.sitemap) {
    issues.push({
      type: "sitemap-excluded",
      severity: "low",
      message: "Indexable, но не в sitemap",
    });
  }

  const indexable =
    isStatusIndexable(item.status) &&
    item.indexing.indexable &&
    !item.quality.shouldNoindex &&
    issues.filter((i) => i.severity === "high").length === 0;

  return {
    indexable,
    sitemap: indexable && item.indexing.sitemap,
    canonicalUrl: item.indexing.canonicalUrl,
    noindexReason: item.indexing.noindexReason,
    robots: {
      index: indexable,
      follow: item.indexing.robots.follow,
    },
    issues,
  };
}

export function getIndexingIssues(items: CMSContentItem[]) {
  return items
    .map((item) => ({ item, decision: resolveContentIndexing(item) }))
    .filter(({ decision }) => decision.issues.length > 0);
}
