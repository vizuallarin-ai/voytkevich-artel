import type { CMSContentItem } from "@/types/content-cms";
import type { ContentGraph } from "@/lib/knowledge-graph/content-graph-service";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { linkOpportunityService } from "@/lib/internal-linking/link-opportunity-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { knowledgeGraphAnalytics } from "@/lib/knowledge-graph/knowledge-graph-analytics";

export type OrphanClassification =
  | "true-orphan"
  | "sitemap-only"
  | "breadcrumbs-only"
  | "navigation-only"
  | "weakly-connected"
  | "intentionally-isolated"
  | "newly-published"
  | "archived"
  | "nonindexable";

const intentionalIsolation = new Map<string, string>();

export function detectOrphanPages(
  graph: ContentGraph,
  items: CMSContentItem[],
): CMSContentItem[] {
  return items.filter((item) => {
    if (!item.indexing.indexable) return false;
    const incoming = contentGraphService.getIncomingContentLinks(item.id);
    return incoming.length === 0;
  });
}

export function classifyOrphanPage(page: CMSContentItem, graph: ContentGraph): OrphanClassification {
  if (!page.indexing.indexable || page.quality.shouldNoindex) return "nonindexable";
  if (page.status === "archived") return "archived";
  if (intentionalIsolation.has(page.id)) return "intentionally-isolated";

  const incoming = contentGraphService.getIncomingContentLinks(page.id);
  if (incoming.length === 0) {
    if (page.workflow.publishedAt) {
      const publishedAt = new Date(page.workflow.publishedAt).getTime();
      if (Date.now() - publishedAt < 7 * 24 * 60 * 60 * 1000) return "newly-published";
    }
    if (page.indexing.sitemap) return "sitemap-only";
    return "true-orphan";
  }

  if (incoming.length <= 1) return "weakly-connected";
  return "weakly-connected";
}

export function calculateOrphanSeverity(
  page: CMSContentItem,
  context: { classification: OrphanClassification },
): "low" | "medium" | "high" {
  if (context.classification === "intentionally-isolated" || context.classification === "nonindexable") {
    return "low";
  }
  if (page.seo.priority === "P1" || page.seo.priority === "P2") return "high";
  if (context.classification === "true-orphan") return "medium";
  return "low";
}

export function findBestOrphanRecoverySources(
  page: CMSContentItem,
  allItems: CMSContentItem[],
): CMSContentItem[] {
  return allItems
    .filter(
      (s) =>
        s.id !== page.id &&
        s.indexing.indexable &&
        (s.clusterId === page.clusterId || s.seo.priority === "P1" || s.seo.priority === "P2"),
    )
    .slice(0, 5);
}

export function recommendOrphanRecovery(
  page: CMSContentItem,
  allItems: CMSContentItem[],
): LinkRecommendation[] {
  knowledgeGraphAnalytics.trackOrphanPageDetected({ contentItemId: page.id });
  return linkOpportunityService.findOrphanRecoveryOpportunities(page, allItems);
}

export function markIntentionalIsolation(pageId: string, reason: string): void {
  intentionalIsolation.set(pageId, reason);
  knowledgeGraphStore.logAudit({
    action: "intentional_isolation",
    entityType: "node",
    entityId: pageId,
    contentItemId: pageId,
    reason,
  });
}

export const orphanPageService = {
  detectOrphanPages,
  classifyOrphanPage,
  calculateOrphanSeverity,
  findBestOrphanRecoverySources,
  recommendOrphanRecovery,
  markIntentionalIsolation,
};
