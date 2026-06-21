import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate, RecommendationType } from "@/types/recommendation";
import type { RecommendationPolicy } from "@/lib/recommendations/recommendation-policy-registry";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { knowledgeGraphRecommendationIntegration } from "@/lib/recommendations/knowledge-graph-recommendation-integration";
import { searchRecommendationIntegration } from "@/lib/recommendations/search-recommendation-integration";
import { recommendationEligibilityService } from "@/lib/recommendations/recommendation-eligibility-service";
import { coldStartService } from "@/lib/recommendations/cold-start-service";
import { sessionRecommendationService } from "@/lib/recommendations/session-recommendation-service";
import { cmsRecommendationIntegration } from "@/lib/recommendations/cms-recommendation-integration";

function cmsItemToCandidate(item: CMSContentItem, type: RecommendationType, source: RecommendationCandidate["source"]): RecommendationCandidate {
  return {
    id: `cand:${item.id}:${type}`,
    type,
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

function inferType(item: CMSContentItem): RecommendationType {
  if (item.kind === "programmatic-page" && item.contentType?.includes("project")) return "project";
  if (item.url.includes("/uslugi") || item.contentType?.includes("service")) return "service";
  if (item.contentType?.includes("comparison")) return "comparison";
  if (item.contentType?.includes("faq")) return "faq";
  if (item.contentType?.includes("location")) return "location";
  return "related-content";
}

export async function getGraphCandidates(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  return knowledgeGraphRecommendationIntegration.getGraphRecommendationCandidates(context);
}

export async function getTaxonomyCandidates(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const clusterIds = new Set(context.currentPage?.clusterIds ?? []);
  if (clusterIds.size === 0) return [];

  return items
    .filter((item) => item.clusterId && clusterIds.has(item.clusterId))
    .slice(0, 12)
    .map((item) => cmsItemToCandidate(item, inferType(item), "taxonomy"));
}

export async function getSearchCandidates(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  if (!context.search?.query) return [];
  return searchRecommendationIntegration.recommendAfterSearchResultClick(context);
}

export async function getSessionCandidates(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  if (!context.sessionId) return [];
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const base = items.slice(0, 20).map((item) => cmsItemToCandidate(item, inferType(item), "session"));
  return sessionRecommendationService.recommendFromSession(context.sessionId, base);
}

export async function getPopularCandidates(_context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  return items
    .filter((i) => i.seo.priority === "P1" || i.seo.priority === "P2")
    .slice(0, 10)
    .map((item) => cmsItemToCandidate(item, inferType(item), "popular"));
}

export async function getManualRuleCandidates(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const contentItemId = context.currentPage?.contentItemId;
  if (!contentItemId) return [];
  const settings = cmsRecommendationIntegration.getCMSRecommendationSettings(contentItemId);
  const items = await contentRepository.listContent({ status: ["published"] });
  const itemMap = new Map(items.map((i) => [i.id, i]));

  return settings.pinnedTargets
    .map((targetId) => {
      const item = itemMap.get(targetId);
      if (!item) return null;
      return cmsItemToCandidate(item, inferType(item), "manual-rule");
    })
    .filter((c): c is RecommendationCandidate => Boolean(c));
}

export function mergeRecommendationCandidates(groups: RecommendationCandidate[][]): RecommendationCandidate[] {
  return groups.flat();
}

export function deduplicateRecommendationCandidates(candidates: RecommendationCandidate[]): RecommendationCandidate[] {
  const seen = new Set<string>();
  const result: RecommendationCandidate[] = [];
  for (const candidate of candidates) {
    const key = candidate.contentItemId ?? candidate.targetUrl ?? candidate.id;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

export async function excludeIneligibleCandidates(
  candidates: RecommendationCandidate[],
  context: RecommendationContext,
  allowedTypes?: RecommendationType[],
): Promise<RecommendationCandidate[]> {
  const items = await contentRepository.listContent();
  const cmsMap = new Map(items.map((i) => [i.id, i]));
  return recommendationEligibilityService.filterEligibleCandidates(candidates, context, {
    cmsItems: cmsMap,
    allowedTypes,
  });
}

export async function generateRecommendationCandidates(
  context: RecommendationContext,
  policy: RecommendationPolicy,
): Promise<RecommendationCandidate[]> {
  const groups: RecommendationCandidate[][] = [];

  if (policy.allowedSources.includes("knowledge-graph")) {
    groups.push(await getGraphCandidates(context));
  }
  if (policy.allowedSources.includes("taxonomy")) {
    groups.push(await getTaxonomyCandidates(context));
  }
  if (policy.allowedSources.includes("search")) {
    groups.push(await getSearchCandidates(context));
  }
  if (policy.allowedSources.includes("session") && context.sessionId) {
    groups.push(await getSessionCandidates(context));
  }
  if (policy.allowedSources.includes("manual-rule")) {
    groups.push(await getManualRuleCandidates(context));
  }
  if (policy.allowedSources.includes("popular") || policy.allowedSources.includes("cold-start")) {
    if (coldStartService.detectColdStart(context)) {
      groups.push(await coldStartService.buildColdStartRecommendations(context));
    } else {
      groups.push(await getPopularCandidates(context));
    }
  }

  let merged = deduplicateRecommendationCandidates(mergeRecommendationCandidates(groups));
  merged = await excludeIneligibleCandidates(merged, context, policy.allowedTypes);
  return merged;
}

export const recommendationCandidateService = {
  generateRecommendationCandidates,
  getGraphCandidates,
  getTaxonomyCandidates,
  getSearchCandidates,
  getSessionCandidates,
  getPopularCandidates,
  getManualRuleCandidates,
  mergeRecommendationCandidates,
  deduplicateRecommendationCandidates,
  excludeIneligibleCandidates,
};
