import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import type { NextBestAction } from "@/types/next-best-action";
import type { Project } from "@/types";
import { escapeHtml } from "@/lib/search/lexical-search-service";

const SENSITIVE_PATTERNS = [
  /доход/i,
  /жив[её]те/i,
  /люди вроде вас/i,
  /определили.*адрес/i,
  /геолокац/i,
];

export function removeSensitiveExplanationSignals(explanation: string): string {
  let safe = explanation;
  for (const pattern of SENSITIVE_PATTERNS) {
    safe = safe.replace(pattern, "[скрыто]");
  }
  return escapeHtml(safe);
}

export function buildSafeReasonCodes(
  item: RecommendationCandidate,
  context: RecommendationContext,
): string[] {
  const codes: string[] = [item.source];
  if (item.clusterIds.length > 0) codes.push("cluster-match");
  if (item.entityNodeIds.length > 0) codes.push("entity-match");
  if (context.preferences.technologies.length > 0) codes.push("preference-signal");
  if (context.journeyStage !== "unknown") codes.push(`journey-${context.journeyStage}`);
  return codes;
}

export function explainContentMatch(
  content: RecommendationCandidate,
  context: RecommendationContext,
): string {
  if (context.currentPage?.contentType.includes("technical")) {
    return removeSensitiveExplanationSignals(
      `Этот материал продолжает тему «${context.currentPage.contentType}», которую вы сейчас изучаете.`,
    );
  }
  if (content.clusterIds.some((id) => context.currentPage?.clusterIds.includes(id))) {
    return removeSensitiveExplanationSignals("Материал из той же тематической группы.");
  }
  return removeSensitiveExplanationSignals(`Рекомендуем: ${content.title}`);
}

export function explainProjectMatch(
  project: Project,
  context: RecommendationContext,
): string {
  const prefs = context.preferences;
  const parts: string[] = [];

  if (prefs.areas.length > 0) {
    parts.push(`площадь около ${prefs.areas[0]} м²`);
  }
  if (prefs.floors.length > 0) {
    parts.push(`${prefs.floors[0]} этаж`);
  }
  if (prefs.technologies.length > 0 && !prefs.technologies.some((t) => project.specs.technology.toLowerCase().includes(t.toLowerCase()))) {
    return removeSensitiveExplanationSignals(
      `Похожий проект «${project.name}» по площади и этажности. Точного совпадения по технологии нет.`,
    );
  }
  if (parts.length > 0) {
    return removeSensitiveExplanationSignals(
      `Рекомендуем «${project.name}», потому что вы выбрали ${parts.join(", ")}.`,
    );
  }
  return removeSensitiveExplanationSignals(
    `Похожий проект «${project.name}» по площади ${project.specs.area} м² и ${project.specs.floors} этаж(а).`,
  );
}

export function explainNextAction(action: NextBestAction, _context: RecommendationContext): string {
  return removeSensitiveExplanationSignals(action.explanation || action.title);
}

export function explainRecommendation(
  item: RecommendationCandidate,
  context: RecommendationContext,
): string {
  if (item.type === "project" && item.description) {
    return removeSensitiveExplanationSignals(item.description);
  }
  return explainContentMatch(item, context);
}

export const recommendationExplanationService = {
  explainRecommendation,
  explainProjectMatch,
  explainContentMatch,
  explainNextAction,
  buildSafeReasonCodes,
  removeSensitiveExplanationSignals,
};
