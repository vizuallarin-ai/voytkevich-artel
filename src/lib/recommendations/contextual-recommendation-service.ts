import type { CMSContentItem } from "@/types/content-cms";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";

function resolveEntityNodeIds(item: CMSContentItem): string[] {
  const extracted = entityResolutionService.extractEntitiesFromContent(item);
  const resolved = entityResolutionService.mapContentToEntities(item, extracted);
  return resolved.filter((r) => r.entity).map((r) => r.entity!.id);
}
function toCandidate(
  item: Awaited<ReturnType<typeof contentRepository.getContentById>>,
  source: RecommendationCandidate["source"],
  type: RecommendationCandidate["type"] = "related-content",
): RecommendationCandidate | null {
  if (!item) return null;
  return {
    id: `ctx:${item.id}`,
    type,
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

async function loadPublishedIndexable() {
  return cmsIndexationIntegration.getCMSItemsByIndexability(true);
}

export async function recommendFromCurrentPage(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentItemId = context.currentPage?.contentItemId;
  if (!contentItemId) return [];
  const items = await loadPublishedIndexable();
  const related = contentGraphService.getRelatedContent(contentItemId, items);
  return related
    .filter((i) => i.id !== contentItemId)
    .map((item) => toCandidate(item, "knowledge-graph"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function recommendByPageEntities(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const entityIds = new Set(context.currentPage?.entityNodeIds ?? []);
  if (entityIds.size === 0) return [];

  const items = await loadPublishedIndexable();
  const results: RecommendationCandidate[] = [];

  for (const item of items) {
    const extracted = entityResolutionService.extractEntitiesFromContent(item);
    const resolved = entityResolutionService.mapContentToEntities(item, extracted);
    if (resolved.some((r) => r.entity && entityIds.has(r.entity.id))) {
      const candidate = toCandidate(item, "knowledge-graph");
      if (candidate && candidate.contentItemId !== context.currentPage?.contentItemId) {
        results.push(candidate);
      }
    }
  }
  return results.slice(0, 10);
}

export async function recommendByCluster(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const clusterIds = context.currentPage?.clusterIds ?? [];
  if (clusterIds.length === 0) return [];
  const items = await loadPublishedIndexable();
  return items
    .filter((i) => i.clusterId && clusterIds.includes(i.clusterId) && i.id !== context.currentPage?.contentItemId)
    .slice(0, 8)
    .map((item) => toCandidate(item, "taxonomy"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function recommendByContentType(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentType = context.currentPage?.contentType;
  if (!contentType) return [];
  const items = await loadPublishedIndexable();
  return items
    .filter((i) => (i.contentType === contentType || i.kind === contentType) && i.id !== context.currentPage?.contentItemId)
    .slice(0, 6)
    .map((item) => toCandidate(item, "taxonomy"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function recommendCommercialDestination(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentItemId = context.currentPage?.contentItemId;
  if (!contentItemId) return [];
  const items = await loadPublishedIndexable();
  const destinations = contentGraphService.getCommercialDestinations(contentItemId, items);
  return destinations
    .map((item) => toCandidate(item, "knowledge-graph", "service"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function recommendSupportingContent(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentItemId = context.currentPage?.contentItemId;
  if (!contentItemId) return [];
  const items = await loadPublishedIndexable();
  const support = contentGraphService.getInformationalSupportPages(contentItemId, items);
  return support
    .map((item) => toCandidate(item, "knowledge-graph", "related-content"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function recommendComparisonContent(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const items = await loadPublishedIndexable();
  return items
    .filter((i) => i.contentType?.includes("comparison") || i.title.toLowerCase().includes("сравнен"))
    .slice(0, 5)
    .map((item) => toCandidate(item, "taxonomy", "comparison"))
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export async function recommendNextJourneyStep(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const stage = context.journeyStage;
  if (stage === "project-selection") {
    const items = await loadPublishedIndexable();
    return items
      .filter((i) => i.kind === "programmatic-page")
      .slice(0, 5)
      .map((item) => toCandidate(item, "session", "project"))
      .filter((c): c is RecommendationCandidate => Boolean(c));
  }
  if (stage === "comparison") {
    return recommendComparisonContent(context);
  }
  return recommendSupportingContent(context);
}

export function excludeUnsafeGraphNodes(nodes: string[]): string[] {
  return nodes.filter((id) => {
    const node = knowledgeGraphStore.getNode(id);
    return node?.status === "active";
  });
}

export const contextualRecommendationService = {
  recommendFromCurrentPage,
  recommendByPageEntities,
  recommendByCluster,
  recommendByContentType,
  recommendCommercialDestination,
  recommendSupportingContent,
  recommendComparisonContent,
  recommendNextJourneyStep,
};
