import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";

export function detectColdStart(context: RecommendationContext): boolean {
  const hasHistory =
    context.viewedContentIds.length > 1 ||
    context.preferences.technologies.length > 0 ||
    context.preferences.materials.length > 0 ||
    context.preferences.areas.length > 0 ||
    Boolean(context.search?.query);
  return !hasHistory;
}

async function loadIndexableItems() {
  return cmsIndexationIntegration.getCMSItemsByIndexability(true);
}

function itemToCandidate(
  item: Awaited<ReturnType<typeof loadIndexableItems>>[number],
  source: RecommendationCandidate["source"],
  type: RecommendationCandidate["type"] = "related-content",
): RecommendationCandidate {
  return {
    id: `cold:${item.id}`,
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

export async function getContextualColdStartCandidates(
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const items = await loadIndexableItems();
  const clusterId = context.currentPage?.clusterIds[0];
  const contentType = context.currentPage?.contentType;

  let filtered = items;
  if (clusterId) {
    filtered = items.filter((i) => i.clusterId === clusterId);
  } else if (contentType) {
    filtered = items.filter((i) => i.kind === contentType || i.contentType === contentType);
  }

  if (filtered.length < 3) filtered = items.slice(0, 12);
  return filtered.slice(0, 8).map((item) => itemToCandidate(item, "cold-start"));
}

export async function getPopularColdStartCandidates(
  _context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const items = await loadIndexableItems();
  const popular = items
    .filter((i) => i.seo.priority === "P1" || i.seo.priority === "P2")
    .slice(0, 10);
  return popular.map((item) => itemToCandidate(item, "popular"));
}

export async function getDiverseColdStartCandidates(
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const items = await loadIndexableItems();
  const byKind = new Map<string, typeof items>();
  for (const item of items) {
    const list = byKind.get(item.kind) ?? [];
    list.push(item);
    byKind.set(item.kind, list);
  }

  const diverse: RecommendationCandidate[] = [];
  for (const [, group] of byKind) {
    if (group[0]) diverse.push(itemToCandidate(group[0], "cold-start"));
    if (diverse.length >= 8) break;
  }

  if (context.currentPage?.contentItemId) {
    return diverse.filter((c) => c.contentItemId !== context.currentPage?.contentItemId);
  }
  return diverse;
}

export async function getEditorialColdStartCandidates(
  _context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const items = await contentRepository.listContent({ kind: ["editorial-content", "technical-article"], status: ["published"] });
  const indexable = items.filter((i) => i.indexing.indexable);
  return indexable.slice(0, 6).map((item) => itemToCandidate(item, "manual-rule", "related-content"));
}

export async function buildColdStartRecommendations(
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  if (!detectColdStart(context) && context.currentPage?.contentItemId) {
    const contextual = await getContextualColdStartCandidates(context);
    if (contextual.length >= 3) return contextual;
  }

  const contextual = await getContextualColdStartCandidates(context);
  if (contextual.length >= 3) return contextual;

  const diverse = await getDiverseColdStartCandidates(context);
  if (diverse.length >= 3) return diverse;

  const editorial = await getEditorialColdStartCandidates(context);
  if (editorial.length >= 2) return editorial;

  return getPopularColdStartCandidates(context);
}

export const coldStartService = {
  detectColdStart,
  getContextualColdStartCandidates,
  getPopularColdStartCandidates,
  getDiverseColdStartCandidates,
  getEditorialColdStartCandidates,
  buildColdStartRecommendations,
};
