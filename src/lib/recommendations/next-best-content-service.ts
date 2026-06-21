import { randomUUID } from "crypto";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { contextualRecommendationService } from "@/lib/recommendations/contextual-recommendation-service";
import { relatedContentService } from "@/lib/recommendations/related-content-service";
import { projectRecommendationService } from "@/lib/recommendations/project-recommendation-service";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

export function excludeAlreadyConsumedContent(
  context: RecommendationContext,
  candidates: RecommendationCandidate[],
): RecommendationCandidate[] {
  const viewed = new Set(context.viewedContentIds);
  return candidates.filter((c) => !viewed.has(c.contentItemId ?? ""));
}

export async function recommendEducationalNextStep(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const support = await contextualRecommendationService.recommendSupportingContent(context);
  const comparison = await contextualRecommendationService.recommendComparisonContent(context);
  return [...support, ...comparison].map((c) => ({ ...c, type: "next-content" as const }));
}

export async function recommendComparisonNextStep(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const items = await contextualRecommendationService.recommendComparisonContent(context);
  return items.map((c) => ({ ...c, type: "next-content" as const }));
}

export async function recommendProjectSelectionNextStep(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  return projectRecommendationService.recommendProjects(context).map((c) => ({
    ...c,
    type: "next-content" as const,
  }));
}

export async function recommendCommercialNextStep(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  const commercial = await contextualRecommendationService.recommendCommercialDestination(context);
  return commercial.map((c) => ({ ...c, type: "next-content" as const }));
}

export function explainNextBestContent(
  result: RecommendationCandidate,
  context: RecommendationContext,
): string {
  if (context.journeyStage === "education") {
    return recommendationExplanationService.removeSensitiveExplanationSignals(
      `Следующий шаг в изучении темы: ${result.title}`,
    );
  }
  if (context.journeyStage === "comparison") {
    return recommendationExplanationService.removeSensitiveExplanationSignals(
      `Поможет сравнить варианты: ${result.title}`,
    );
  }
  return recommendationExplanationService.explainRecommendation(result, context);
}

export async function recommendNextBestContent(context: RecommendationContext): Promise<RecommendationCandidate[]> {
  let candidates: RecommendationCandidate[] = [];

  switch (context.journeyStage) {
    case "education":
    case "exploration":
      candidates = await recommendEducationalNextStep(context);
      break;
    case "comparison":
      candidates = await recommendComparisonNextStep(context);
      break;
    case "project-selection":
      candidates = await recommendProjectSelectionNextStep(context);
      break;
    case "calculation-intent":
    case "consultation-intent":
    case "service-selection":
      candidates = await recommendCommercialNextStep(context);
      break;
    default:
      if (context.currentPage?.contentItemId) {
        candidates = await relatedContentService.getRelatedContent(context.currentPage.contentItemId, context);
      } else {
        candidates = await contextualRecommendationService.recommendFromCurrentPage(context);
      }
  }

  candidates = excludeAlreadyConsumedContent(context, candidates);

  if (candidates.length === 0 && context.currentPage?.contentItemId) {
    const journey = await contextualRecommendationService.recommendNextJourneyStep(context);
    candidates = excludeAlreadyConsumedContent(context, journey);
  }

  return candidates.slice(0, 6);
}

export const nextBestContentService = {
  recommendNextBestContent,
  recommendEducationalNextStep,
  recommendComparisonNextStep,
  recommendProjectSelectionNextStep,
  recommendCommercialNextStep,
  excludeAlreadyConsumedContent,
  explainNextBestContent,
};
