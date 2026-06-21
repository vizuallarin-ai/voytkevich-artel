import { randomUUID } from "crypto";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { NextBestAction, NextBestActionType } from "@/types/next-best-action";
import { journeyStageService } from "@/lib/recommendations/journey-stage-service";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

function action(
  type: NextBestActionType,
  title: string,
  options: Partial<NextBestAction> = {},
): NextBestAction {
  return {
    id: randomUUID(),
    type,
    title,
    score: options.score ?? 0.5,
    confidence: options.confidence ?? "medium",
    reasonCodes: options.reasonCodes ?? [type],
    explanation: options.explanation ?? title,
    requiresConsent: options.requiresConsent ?? false,
    requiresConfirmation: options.requiresConfirmation ?? false,
    url: options.url,
    description: options.description,
  };
}

export function detectReadyForCommercialAction(context: RecommendationContext): boolean {
  return (
    context.journeyStage === "calculation-intent" ||
    context.journeyStage === "consultation-intent" ||
    context.viewedContentIds.length >= 4
  );
}

export function detectNeedForMoreEducation(context: RecommendationContext): boolean {
  return context.journeyStage === "exploration" || context.journeyStage === "education";
}

export function detectNeedForComparison(context: RecommendationContext): boolean {
  return context.journeyStage === "comparison" || context.preferences.technologies.length >= 2;
}

export function detectNeedForPreferenceRefinement(context: RecommendationContext): boolean {
  const prefCount =
    context.preferences.areas.length +
    context.preferences.floors.length +
    context.preferences.technologies.length;
  return context.journeyStage === "project-selection" && prefCount < 2;
}

export function detectConsultationIntent(context: RecommendationContext): boolean {
  return (
    context.journeyStage === "consultation-intent" ||
    context.search?.intent === "consultation" ||
    context.search?.query?.toLowerCase().includes("консультац") === true
  );
}

export function rankNextBestActions(actions: NextBestAction[], context: RecommendationContext): NextBestAction[] {
  const allowed = new Set(journeyStageService.recommendActionsForJourneyStage(context.journeyStage));
  return actions
    .filter((a) => allowed.has(a.type) || a.type === "wait")
    .sort((a, b) => b.score - a.score);
}

export function applyActionFrequencyCaps(
  actions: NextBestAction[],
  _context: RecommendationContext,
): NextBestAction[] {
  const consultations = actions.filter((a) => a.type === "request-consultation");
  const others = actions.filter((a) => a.type !== "request-consultation");
  return [...others, ...consultations.slice(0, 1)];
}

export function explainNextBestAction(action: NextBestAction, context: RecommendationContext): string {
  return recommendationExplanationService.explainNextAction(action, context);
}

export function recommendNextBestAction(context: RecommendationContext): NextBestAction[] {
  const actions: NextBestAction[] = [];

  if (detectNeedForMoreEducation(context)) {
    actions.push(
      action("continue-reading", "Продолжить изучение темы", {
        score: 0.75,
        url: context.currentPage?.canonicalUrl,
        explanation: "Ещё есть полезные материалы по этой теме",
      }),
    );
  }

  if (detectNeedForComparison(context)) {
    actions.push(
      action("compare-options", "Сравнить варианты", {
        score: 0.7,
        url: "/blog",
        explanation: "Сравнение поможет выбрать подходящее решение",
      }),
    );
  }

  if (context.journeyStage === "project-selection") {
    actions.push(
      action("view-related-projects", "Посмотреть похожие проекты", {
        score: 0.8,
        url: "/catalog",
        explanation: "Подборка проектов по вашим параметрам",
      }),
    );
  }

  if (detectNeedForPreferenceRefinement(context)) {
    actions.push(
      action("refine-preferences", "Уточнить параметры", {
        score: 0.65,
        explanation: "Уточнение параметров улучшит рекомендации",
      }),
    );
  }

  actions.push(
    action("start-calculation", "Рассчитать ориентир стоимости", {
      score: detectReadyForCommercialAction(context) ? 0.72 : 0.45,
      url: "/calculator",
      explanation: "Калькулятор даст предварительный ориентир",
    }),
  );

  actions.push(
    action("ask-assistant", "Спросить AI-помощника", {
      score: 0.55,
      url: "/search?assistant=1",
      explanation: "Помощник подскажет следующий шаг",
    }),
  );

  if (detectConsultationIntent(context)) {
    actions.push(
      action("request-consultation", "Запросить консультацию", {
        score: 0.6,
        url: "/contacts",
        explanation: "Менеджер поможет с подбором решения",
        requiresConfirmation: true,
      }),
    );
  } else {
    actions.push(action("wait", "Продолжить самостоятельный подбор", { score: 0.4 }));
  }

  let ranked = rankNextBestActions(actions, context);
  ranked = applyActionFrequencyCaps(ranked, context);

  if (ranked.filter((a) => a.type === "request-consultation").length === ranked.length) {
    ranked = [action("continue-reading", "Изучить материалы", { score: 0.7, url: "/blog" })];
  }

  return ranked.slice(0, 3).map((a) => ({
    ...a,
    explanation: explainNextBestAction(a, context),
  }));
}

export const nextBestActionService = {
  recommendNextBestAction,
  detectReadyForCommercialAction,
  detectNeedForMoreEducation,
  detectNeedForComparison,
  detectNeedForPreferenceRefinement,
  detectConsultationIntent,
  rankNextBestActions,
  applyActionFrequencyCaps,
  explainNextBestAction,
};
