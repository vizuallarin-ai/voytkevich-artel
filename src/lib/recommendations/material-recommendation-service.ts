import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { entityRegistry } from "@/lib/knowledge-graph/entity-registry";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

const MATERIAL_DISCLAIMER =
  "Ознакомьтесь с особенностями материала. Окончательный выбор требует оценки проекта и участка.";

export async function recommendMaterials(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const materialEntities = entityRegistry.listEntities({ type: "material" });
  const prefs = context.preferences.materials;

  let selected = materialEntities;
  if (prefs.length > 0) {
    selected = materialEntities.filter((e) =>
      prefs.some((p) => e.canonicalName.toLowerCase().includes(p.toLowerCase())),
    );
  } else if (context.preferences.technologies.length > 0) {
    const tech = context.preferences.technologies[0].toLowerCase();
    if (tech.includes("каркас")) {
      selected = materialEntities.filter((e) => /брус|каркас/i.test(e.canonicalName));
    }
  }

  const fromRegistry = selected.slice(0, 4).map(
    (e): RecommendationCandidate => ({
      id: `material:${e.id}`,
      type: "material",
      targetUrl: `/blog?material=${encodeURIComponent(e.slug)}`,
      title: e.canonicalName,
      description: `Может подойти. ${MATERIAL_DISCLAIMER}`,
      entityNodeIds: [e.id],
      clusterIds: [],
      source: "taxonomy",
      eligibility: { published: true, indexable: true, canonical: true, available: true },
      createdAt: new Date().toISOString(),
    }),
  );

  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  const articles = items
    .filter(
      (i) =>
        i.kind === "technical-article" &&
        (prefs.length === 0 || prefs.some((p) => i.title.toLowerCase().includes(p.toLowerCase()))),
    )
    .slice(0, 3)
    .map(
      (item): RecommendationCandidate => ({
        id: `material-article:${item.id}`,
        type: "material",
        contentItemId: item.id,
        targetUrl: item.url,
        title: item.title,
        description: `Стоит сравнить материалы. ${MATERIAL_DISCLAIMER}`,
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

  return [...fromRegistry, ...articles].slice(0, 6);
}

export function explainMaterialRecommendation(candidate: RecommendationCandidate): string {
  return recommendationExplanationService.removeSensitiveExplanationSignals(
    candidate.description ?? MATERIAL_DISCLAIMER,
  );
}

export const materialRecommendationService = {
  recommendMaterials,
  explainMaterialRecommendation,
};
