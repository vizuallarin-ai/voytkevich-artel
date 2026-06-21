import type { RecommendationContext, UserJourneyStage } from "@/types/recommendation-context";
import type { NextBestActionType } from "@/types/next-best-action";

export function detectJourneyStage(context: RecommendationContext): UserJourneyStage {
  if (context.search?.intent === "consultation" || context.journeyStage === "consultation-intent") {
    return "consultation-intent";
  }
  if (context.search?.intent === "cost" || context.journeyStage === "calculation-intent") {
    return "calculation-intent";
  }

  const viewed = context.viewedContentIds.length;
  const prefs =
    context.preferences.technologies.length +
    context.preferences.materials.length +
    context.preferences.areas.length;

  if (context.currentPage?.contentType.includes("comparison") || prefs >= 2) {
    return "comparison";
  }
  if (viewed >= 3 && (context.preferences.areas.length > 0 || context.preferences.floors.length > 0)) {
    return "project-selection";
  }
  if (context.currentPage?.contentType.includes("service")) {
    return "service-selection";
  }
  if (context.currentPage?.contentType.includes("technical") || context.currentPage?.contentType.includes("editorial")) {
    return "education";
  }
  if (viewed > 0) return "exploration";
  return "unknown";
}

export function calculateJourneyStageConfidence(context: RecommendationContext): "low" | "medium" | "high" {
  const signals =
    context.viewedContentIds.length +
    context.preferences.technologies.length +
    context.preferences.materials.length +
    (context.search?.query ? 1 : 0);
  if (signals >= 4) return "high";
  if (signals >= 2) return "medium";
  return "low";
}

export function detectJourneyStageTransition(
  before: UserJourneyStage,
  after: UserJourneyStage,
): { changed: boolean; direction?: "deeper" | "broader" | "commercial" } {
  if (before === after) return { changed: false };
  const commercial: UserJourneyStage[] = ["calculation-intent", "consultation-intent", "service-selection"];
  if (commercial.includes(after) && !commercial.includes(before)) {
    return { changed: true, direction: "commercial" };
  }
  if (after === "comparison" || after === "project-selection") {
    return { changed: true, direction: "deeper" };
  }
  return { changed: true, direction: "broader" };
}

export function recommendActionsForJourneyStage(stage: UserJourneyStage): NextBestActionType[] {
  switch (stage) {
    case "exploration":
      return ["continue-reading", "view-related-projects", "refine-preferences"];
    case "education":
      return ["continue-reading", "compare-options", "ask-assistant"];
    case "comparison":
      return ["compare-options", "view-related-projects", "apply-filter"];
    case "project-selection":
      return ["view-related-projects", "save-project", "start-calculation"];
    case "service-selection":
      return ["open-service", "start-calculation", "request-consultation"];
    case "calculation-intent":
      return ["start-calculation", "open-service", "request-consultation"];
    case "consultation-intent":
      return ["request-consultation", "ask-assistant", "refine-preferences"];
    default:
      return ["continue-reading", "ask-assistant", "wait"];
  }
}

export function explainJourneyStage(stage: UserJourneyStage, _context: RecommendationContext): string {
  const labels: Record<UserJourneyStage, string> = {
    exploration: "Вы знакомитесь с темой",
    education: "Вы изучаете детали",
    comparison: "Вы сравниваете варианты",
    "project-selection": "Вы подбираете проект",
    "service-selection": "Вы выбираете услугу",
    "calculation-intent": "Вы оцениваете стоимость",
    "consultation-intent": "Вы готовы к консультации",
    unknown: "Этап пути пока не определён",
  };
  return labels[stage];
}

export const journeyStageService = {
  detectJourneyStage,
  calculateJourneyStageConfidence,
  detectJourneyStageTransition,
  recommendActionsForJourneyStage,
  explainJourneyStage,
};
