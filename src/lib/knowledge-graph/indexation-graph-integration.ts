import type { LinkRecommendation } from "@/types/link-recommendation";
import type { KnowledgeGraphSnapshot } from "@/types/knowledge-graph";
import type { CMSContentItem } from "@/types/content-cms";
import type { InternalLinkRecord } from "@/types/internal-link";
import { getRedirect } from "@/lib/seo-indexation/redirect-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { cmsKnowledgeGraphIntegration } from "@/lib/knowledge-graph/cms-knowledge-graph-integration";

const UNSAFE_STATUSES = new Set(["draft", "review", "idea", "rejected", "archived"]);

export function excludeNonIndexableTargets(
  recommendations: LinkRecommendation[],
  items: CMSContentItem[],
): LinkRecommendation[] {
  const itemMap = new Map(items.map((i) => [i.id, i]));
  return recommendations.filter((rec) => {
    const target = itemMap.get(rec.targetContentItemId);
    if (!target) return false;
    if (!target.indexing.indexable || target.quality.shouldNoindex) return false;
    if (UNSAFE_STATUSES.has(target.status)) return false;
    return true;
  });
}

export function detectLinksToNoindex(
  graph: KnowledgeGraphSnapshot,
  items: CMSContentItem[],
): InternalLinkRecord[] {
  const noindexUrls = new Set(
    items.filter((i) => !i.indexing.indexable || i.quality.shouldNoindex).map((i) => normalizeUrl(i.url)),
  );
  return knowledgeGraphStore.listLinkRecords().filter((l) => noindexUrls.has(normalizeUrl(l.targetUrl)));
}

export function detectLinksToRedirects(
  graph: KnowledgeGraphSnapshot,
): InternalLinkRecord[] {
  return knowledgeGraphStore.listLinkRecords().filter((l) => {
    const redirect = getRedirect(l.targetUrl);
    return Boolean(redirect);
  });
}

export function detectLinksToNonCanonicalTargets(items: CMSContentItem[]): InternalLinkRecord[] {
  const nonCanonical = new Map(
    items
      .filter((i) => i.indexing.canonicalUrl && i.indexing.canonicalUrl !== i.url)
      .map((i) => [normalizeUrl(i.url), i.indexing.canonicalUrl!]),
  );

  return knowledgeGraphStore.listLinkRecords().filter((l) => {
    const canonical = nonCanonical.get(normalizeUrl(l.targetUrl));
    return Boolean(canonical && normalizeUrl(l.targetUrl) !== normalizeUrl(canonical));
  });
}

export function detectIndexableOrphans(items: CMSContentItem[]): CMSContentItem[] {
  const graph = contentGraphService.buildContentGraph(items);
  return items.filter((item) => {
    if (!item.indexing.indexable) return false;
    const incoming = contentGraphService.getIncomingContentLinks(item.id);
    return incoming.length === 0;
  });
}

export async function recalculateGraphAfterIndexabilityChange(
  contentItemId: string,
): Promise<void> {
  await cmsKnowledgeGraphIntegration.syncCMSContentToGraph(contentItemId);
  knowledgeGraphStore.logAudit({
    action: "graph_recalculated_indexability",
    entityType: "node",
    entityId: contentItemId,
    contentItemId,
  });
}

export function validateGraphIndexationConsistency(
  graph: KnowledgeGraphSnapshot,
  items: CMSContentItem[],
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  issues.push(...detectLinksToNoindex(graph, items).map((l) => `Link to noindex: ${l.id}`));
  issues.push(...detectLinksToRedirects(graph).map((l) => `Link to redirect: ${l.id}`));
  issues.push(
    ...detectLinksToNonCanonicalTargets(items).map((l) => `Link to non-canonical: ${l.id}`),
  );
  return { valid: issues.length === 0, issues };
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "") || "/";
}

export const indexationGraphIntegration = {
  excludeNonIndexableTargets,
  detectLinksToNoindex,
  detectLinksToRedirects,
  detectLinksToNonCanonicalTargets,
  detectIndexableOrphans,
  recalculateGraphAfterIndexabilityChange,
  validateGraphIndexationConsistency,
};
