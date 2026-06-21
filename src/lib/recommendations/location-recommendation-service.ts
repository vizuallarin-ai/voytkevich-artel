import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

const DEFAULT_LOCATION = "Иркутск";

export function resolveRecommendationLocation(context: RecommendationContext): string | null {
  if (context.preferences.locations.length > 0) {
    return context.preferences.locations[0];
  }
  if (context.search?.filters.location?.[0]) {
    return context.search.filters.location[0];
  }
  if (context.consent.location && context.preferences.locations.length > 0) {
    return context.preferences.locations[0];
  }
  if (context.currentPage?.canonicalUrl.includes("irkutsk")) {
    return DEFAULT_LOCATION;
  }
  return null;
}

export function validateLocationAvailability(
  candidate: RecommendationCandidate,
  location: string | null,
): boolean {
  if (!location) return true;
  const hay = `${candidate.title} ${candidate.description ?? ""} ${candidate.targetUrl ?? ""}`.toLowerCase();
  const loc = location.toLowerCase();
  if (hay.includes(loc)) return true;
  if (loc.includes("иркутск")) return true;
  return candidate.type !== "service";
}

export async function recommendContentForLocation(
  location: string,
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const loc = location.toLowerCase();

  return items
    .filter((item) => {
      const hay = `${item.title} ${item.seoDescription ?? ""} ${item.url}`.toLowerCase();
      return hay.includes(loc) || item.clusterId?.includes("local");
    })
    .slice(0, 6)
    .map(
      (item): RecommendationCandidate => ({
        id: `loc:${item.id}`,
        type: "location",
        contentItemId: item.id,
        targetUrl: item.url,
        title: item.title,
        description: `Актуально для региона: ${location}`,
        entityNodeIds: [],
        clusterIds: item.clusterId ? [item.clusterId] : [],
        source: "taxonomy",
        eligibility: {
          published: true,
          indexable: item.indexing.indexable,
          canonical: true,
          available: true,
        },
        createdAt: new Date().toISOString(),
      }),
    )
    .filter((c) => validateLocationAvailability(c, location) && c.contentItemId !== context.currentPage?.contentItemId);
}

export async function recommendServicesForLocation(
  location: string,
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const items = await recommendContentForLocation(location, context);
  return items.filter((i) => i.type === "service" || (i.targetUrl ?? "").includes("/uslugi"));
}

export async function recommendProjectsForLocation(
  location: string,
  context: RecommendationContext,
): Promise<RecommendationCandidate[]> {
  const content = await recommendContentForLocation(location, context);
  return content.filter((i) => i.type === "project" || (i.targetUrl ?? "").includes("/catalog"));
}

export function explainLocationRecommendation(result: RecommendationCandidate): string {
  return recommendationExplanationService.removeSensitiveExplanationSignals(
    result.description ?? "Рекомендация с учётом выбранного региона",
  );
}

export const locationRecommendationService = {
  resolveRecommendationLocation,
  recommendContentForLocation,
  recommendServicesForLocation,
  recommendProjectsForLocation,
  validateLocationAvailability,
  explainLocationRecommendation,
};
