import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

async function loadItems() {
  return cmsIndexationIntegration.getCMSItemsByIndexability(true);
}

function itemToCandidate(item: Awaited<ReturnType<typeof loadItems>>[number], source: RecommendationCandidate["source"]): RecommendationCandidate {
  return {
    id: `rel:${item.id}`,
    type: "related-content",
    contentItemId: item.id,
    targetUrl: item.indexing.canonicalUrl ?? item.url,
    title: item.title,
    description: item.seoDescription,
    entityNodeIds: [],
    clusterIds: item.clusterId ? [item.clusterId] : [],
    source,
    eligibility: {
      published: item.status === "published",
      indexable: item.indexing.indexable,
      canonical: true,
      available: true,
    },
    createdAt: new Date().toISOString(),
  };
}

export async function getGraphRelatedContent(contentItemId: string): Promise<RecommendationCandidate[]> {
  const items = await loadItems();
  return contentGraphService
    .getRelatedContent(contentItemId, items)
    .filter((i) => i.id !== contentItemId)
    .map((item) => itemToCandidate(item, "knowledge-graph"));
}

export async function getClusterRelatedContent(contentItemId: string): Promise<RecommendationCandidate[]> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item?.clusterId) return [];
  const items = await loadItems();
  return items
    .filter((i) => i.clusterId === item.clusterId && i.id !== contentItemId)
    .slice(0, 8)
    .map((i) => itemToCandidate(i, "taxonomy"));
}

export async function getSemanticallyRelatedContent(contentItemId: string): Promise<RecommendationCandidate[]> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return [];
  const query = item.seo.targetKeyword ?? item.title;
  const searchResults = hybridRetrievalService.searchHybrid(query, { limit: 8 });
  const items = await loadItems();
  const itemMap = new Map(items.map((i) => [i.id, i]));

  return searchResults
    .map((result) => {
      const cmsItem = result.contentItemId ? itemMap.get(result.contentItemId) : undefined;
      if (!cmsItem || cmsItem.id === contentItemId) return null;
      return itemToCandidate(cmsItem, "search");
    })
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function getSupportingContent(contentItemId: string): Promise<RecommendationCandidate[]> {
  const items = await loadItems();
  return contentGraphService
    .getInformationalSupportPages(contentItemId, items)
    .map((item) => itemToCandidate(item, "knowledge-graph"));
}

export async function getCommerciallyRelatedContent(contentItemId: string): Promise<RecommendationCandidate[]> {
  const items = await loadItems();
  return contentGraphService
    .getCommercialDestinations(contentItemId, items)
    .map((item) => ({ ...itemToCandidate(item, "knowledge-graph"), type: "service" as const }));
}

export function excludeNearDuplicateContent(results: RecommendationCandidate[]): RecommendationCandidate[] {
  const seen = new Set<string>();
  const output: RecommendationCandidate[] = [];
  for (const item of results) {
    const key = item.title.slice(0, 30).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

export function buildRelatedContentExplanation(result: RecommendationCandidate): string {
  return recommendationExplanationService.removeSensitiveExplanationSignals(
    `Связанный материал: ${result.title}`,
  );
}

export async function getRelatedContent(
  contentItemId: string,
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const groups = await Promise.all([
    getGraphRelatedContent(contentItemId),
    getClusterRelatedContent(contentItemId),
    getSemanticallyRelatedContent(contentItemId),
    getSupportingContent(contentItemId),
  ]);

  const merged = groups.flat();
  const deduped = excludeNearDuplicateContent(merged);
  return deduped.filter(
    (c) =>
      c.contentItemId !== contentItemId &&
      !context.dismissedRecommendationIds.includes(c.contentItemId ?? c.id),
  );
}

export const relatedContentService = {
  getRelatedContent,
  getSemanticallyRelatedContent,
  getGraphRelatedContent,
  getClusterRelatedContent,
  getSupportingContent,
  getCommerciallyRelatedContent,
  excludeNearDuplicateContent,
  buildRelatedContentExplanation,
};
