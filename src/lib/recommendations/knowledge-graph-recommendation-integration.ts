import type { CMSContentItem } from "@/types/content-cms";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

function resolveEntityNodeIds(item: CMSContentItem): string[] {
  const extracted = entityResolutionService.extractEntitiesFromContent(item);
  const resolved = entityResolutionService.mapContentToEntities(item, extracted);
  return resolved.filter((r) => r.entity).map((r) => r.entity!.id);
}

function toCandidate(item: Awaited<ReturnType<typeof contentRepository.getContentById>>, source: RecommendationCandidate["source"]): RecommendationCandidate | null {
  if (!item) return null;
  return {
    id: `kg:${item.id}`,
    type: "related-content",
    contentItemId: item.id,
    targetUrl: item.indexing.canonicalUrl ?? item.url,
    title: item.title,
    description: item.seoDescription,
    entityNodeIds: resolveEntityNodeIds(item),
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

export function excludeUnsafeGraphNodes(nodeIds: string[]): string[] {
  return nodeIds.filter((id) => {
    const node = knowledgeGraphStore.getNode(id);
    return node && node.status === "active";
  });
}

export async function getGraphRecommendationCandidates(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentItemId = context.currentPage?.contentItemId;
  if (!contentItemId) return [];

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const related = contentGraphService.getRelatedContent(contentItemId, items);
  return related
    .map((item) => toCandidate(item, "knowledge-graph"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function expandRecommendationsByEntities(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const entityIds = excludeUnsafeGraphNodes(context.currentPage?.entityNodeIds ?? []);
  if (entityIds.length === 0) return [];

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const results: RecommendationCandidate[] = [];

  for (const item of items) {
    const extracted = entityResolutionService.extractEntitiesFromContent(item);
    const resolved = entityResolutionService.mapContentToEntities(item, extracted);
    if (resolved.some((r) => r.entity && entityIds.includes(r.entity.id))) {
      const candidate = toCandidate(item, "knowledge-graph");
      if (candidate) results.push(candidate);
    }
  }
  return results.slice(0, 10);
}

export async function expandRecommendationsByCluster(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const clusterIds = context.currentPage?.clusterIds ?? [];
  if (clusterIds.length === 0) return [];

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  return items
    .filter((i) => i.clusterId && clusterIds.includes(i.clusterId))
    .slice(0, 8)
    .map((item) => toCandidate(item, "knowledge-graph"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function findNextJourneyNodes(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentItemId = context.currentPage?.contentItemId;
  if (!contentItemId) return [];

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const outgoing = contentGraphService.getOutgoingContentLinks(contentItemId);
  return outgoing
    .map((id) => items.find((i) => i.id === id))
    .map((item) => toCandidate(item ?? null, "knowledge-graph"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function findCommercialDestinationNodes(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentItemId = context.currentPage?.contentItemId;
  if (!contentItemId) return [];

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const results: RecommendationCandidate[] = [];
  for (const item of contentGraphService.getCommercialDestinations(contentItemId, items)) {
    const c = toCandidate(item, "knowledge-graph");
    if (c) results.push({ ...c, type: "service" });
  }
  return results;
}

export function explainGraphRecommendationPath(
  item: RecommendationCandidate,
  _context: RecommendationContext,
): string {
  return recommendationExplanationService.removeSensitiveExplanationSignals(
    `Связь через граф знаний: ${item.title}`,
  );
}

export const knowledgeGraphRecommendationIntegration = {
  getGraphRecommendationCandidates,
  expandRecommendationsByEntities,
  expandRecommendationsByCluster,
  findNextJourneyNodes,
  findCommercialDestinationNodes,
  excludeUnsafeGraphNodes,
  explainGraphRecommendationPath,
};
