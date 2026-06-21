import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { entityRegistry } from "@/lib/knowledge-graph/entity-registry";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

const TECH_DISCLAIMER =
  "Ознакомьтесь с особенностями технологии. Окончательный выбор требует оценки проекта и участка.";

function buildTechCandidate(entityId: string, name: string): RecommendationCandidate {
  return {
    id: `tech:${entityId}`,
    type: "technology",
    targetUrl: `/blog?tag=${encodeURIComponent(name)}`,
    title: name,
    description: `Может подойти для вашего объекта. ${TECH_DISCLAIMER}`,
    entityNodeIds: [entityId],
    clusterIds: [],
    source: "taxonomy",
    eligibility: { published: true, indexable: true, canonical: true, available: true },
    createdAt: new Date().toISOString(),
  };
}

export async function recommendTechnologies(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const techEntities = entityRegistry.listEntities({ type: "technology" });
  const prefs = context.preferences.technologies;
  const buildingTypes = context.preferences.buildingTypes;

  let selected = techEntities;
  if (prefs.length > 0) {
    selected = techEntities.filter((e) =>
      prefs.some((p) => e.canonicalName.toLowerCase().includes(p.toLowerCase())),
    );
  }

  const candidates = selected.slice(0, 5).map((e) => buildTechCandidate(e.id, e.canonicalName));

  if (buildingTypes.includes("баня") && candidates.length < 3) {
    const extra = techEntities.find((e) => e.canonicalName.toLowerCase().includes("каркас"));
    if (extra) candidates.push(buildTechCandidate(extra.id, extra.canonicalName));
  }

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const comparisons = items
    .filter((i) => i.title.toLowerCase().includes("сравнен") || i.contentType?.includes("comparison"))
    .slice(0, 3)
    .map(
      (item): RecommendationCandidate => ({
        id: `tech-article:${item.id}`,
        type: "comparison",
        contentItemId: item.id,
        targetUrl: item.url,
        title: item.title,
        description: `Стоит сравнить: ${item.title}. ${TECH_DISCLAIMER}`,
        entityNodeIds: [],
        clusterIds: item.clusterId ? [item.clusterId] : [],
        source: "knowledge-graph",
        eligibility: {
          published: true,
          indexable: item.indexing.indexable,
          canonical: true,
          available: true,
        },
        createdAt: new Date().toISOString(),
      }),
    );

  return [...candidates, ...comparisons].slice(0, 6);
}

export function explainTechnologyRecommendation(candidate: RecommendationCandidate): string {
  return recommendationExplanationService.removeSensitiveExplanationSignals(
    candidate.description ?? TECH_DISCLAIMER,
  );
}

export const technologyRecommendationService = {
  recommendTechnologies,
  explainTechnologyRecommendation,
};
