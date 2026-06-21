import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { searchStore } from "@/lib/search/search-store";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { nextBestActionService } from "@/lib/recommendations/next-best-action-service";
import type { NextBestAction } from "@/types/next-best-action";

function searchResultToCandidate(
  result: Awaited<ReturnType<typeof hybridRetrievalService.searchHybrid>>[number],
  itemMap: Map<string, Awaited<ReturnType<typeof cmsIndexationIntegration.getCMSItemsByIndexability>>[number]>,
): RecommendationCandidate | null {
  const cmsItem = result.contentItemId ? itemMap.get(result.contentItemId) : undefined;
  if (!cmsItem) return null;
  return {
    id: `search:${cmsItem.id}`,
    type: "related-content",
    contentItemId: cmsItem.id,
    targetUrl: result.canonicalUrl,
    title: result.title,
    description: result.snippet,
    entityNodeIds: [],
    clusterIds: cmsItem.clusterId ? [cmsItem.clusterId] : [],
    source: "search",
    eligibility: {
      published: cmsItem.status === "published",
      indexable: cmsItem.indexing.indexable,
      canonical: true,
      available: true,
    },
    createdAt: new Date().toISOString(),
  };
}

export async function buildRecommendationsFromSearchJourney(sessionId: string): Promise<RecommendationCandidate[]> {
  const journey = searchStore.findJourneyBySession(sessionId);
  if (!journey || journey.documentIds.length === 0) return [];

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const itemByDoc = new Map(items.map((i) => [i.id, i]));

  return journey.documentIds
    .map((docId): RecommendationCandidate | null => {
      const item = itemByDoc.get(docId) ?? items.find((i) => i.id === docId);
      if (!item) return null;
      return {
        id: `search-journey:${item.id}`,
        type: "related-content",
        contentItemId: item.id,
        targetUrl: item.url,
        title: item.title,
        description: item.seoDescription,
        entityNodeIds: [],
        clusterIds: item.clusterId ? [item.clusterId] : [],
        source: "search",
        eligibility: {
          published: true,
          indexable: item.indexing.indexable,
          canonical: true,
          available: true,
        },
        createdAt: new Date().toISOString(),
      };
    })
    .filter((c): c is RecommendationCandidate => c !== null);
}

export async function recommendAfterSearchResultClick(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const query = context.search?.query;
  if (!query) return [];

  const results = hybridRetrievalService.searchHybrid(query, { limit: 8 });
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const itemMap = new Map(items.map((i) => [i.id, i]));

  return results
    .map((r) => searchResultToCandidate(r, itemMap))
    .filter((c): c is RecommendationCandidate => c !== null);
}

export async function recommendForZeroResultQuery(
  query: string,
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const q = query.toLowerCase();
  return items
    .filter((item) => item.title.toLowerCase().includes(q.slice(0, 8)) || item.seo.targetKeyword?.toLowerCase().includes(q.slice(0, 8)))
    .slice(0, 5)
    .map(
      (item): RecommendationCandidate => ({
        id: `zero:${item.id}`,
        type: "related-content",
        contentItemId: item.id,
        targetUrl: item.url,
        title: item.title,
        description: "Альтернатива по смежной теме",
        entityNodeIds: [],
        clusterIds: item.clusterId ? [item.clusterId] : [],
        source: "search",
        eligibility: {
          published: true,
          indexable: item.indexing.indexable,
          canonical: true,
          available: true,
        },
        createdAt: new Date().toISOString(),
      }),
    )
    .filter((c) => c.contentItemId !== context.currentPage?.contentItemId);
}

export function recommendRelatedQueries(context: RecommendationContext): string[] {
  const query = context.search?.query;
  if (!query) return [];
  return [`${query} проект`, `${query} стоимость`, `${query} технология`].slice(0, 3);
}

export async function recommendProjectsFromSearchFilters(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const filters = context.search?.filters ?? {};
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  return items
    .filter((i) => i.kind === "programmatic-page")
    .filter((i) => {
      const hay = `${i.title} ${i.seo.targetKeyword ?? ""}`.toLowerCase();
      for (const [key, values] of Object.entries(filters)) {
        if (values.some((v) => hay.includes(v.toLowerCase()) || key.includes(v.toLowerCase()))) return true;
      }
      return Object.keys(filters).length === 0;
    })
    .slice(0, 6)
    .map(
      (item): RecommendationCandidate => ({
        id: `search-project:${item.id}`,
        type: "project",
        contentItemId: item.id,
        targetUrl: item.url,
        title: item.title,
        entityNodeIds: [],
        clusterIds: item.clusterId ? [item.clusterId] : [],
        source: "search",
        eligibility: {
          published: true,
          indexable: item.indexing.indexable,
          canonical: true,
          available: true,
        },
        createdAt: new Date().toISOString(),
      }),
    );
}

export function recommendNextActionFromSearchIntent(context: RecommendationContext): NextBestAction[] {
  const intent = context.search?.intent;
  if (intent === "consultation" || intent === "cost") {
    return nextBestActionService.recommendNextBestAction({
      ...context,
      journeyStage: intent === "consultation" ? "consultation-intent" : "calculation-intent",
    });
  }
  return [];
}

export const searchRecommendationIntegration = {
  buildRecommendationsFromSearchJourney,
  recommendAfterSearchResultClick,
  recommendForZeroResultQuery,
  recommendRelatedQueries,
  recommendProjectsFromSearchFilters,
  recommendNextActionFromSearchIntent,
};
