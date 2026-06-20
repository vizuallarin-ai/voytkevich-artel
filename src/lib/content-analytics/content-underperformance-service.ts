import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { getActiveConfidencePreset } from "@/data/content-analytics-confidence-rules";
import { getSnapshotConfidence } from "@/lib/content-analytics/content-performance-snapshot-service";

export type UnderperformanceCategory =
  | "too-early"
  | "not-indexed"
  | "no-demand"
  | "impressions-no-clicks"
  | "clicks-weak-engagement"
  | "engagement-no-cta"
  | "cta-no-submissions"
  | "leads-low-quality"
  | "high-cost-weak-result"
  | "technical-issue"
  | "cannibalization"
  | "seasonal-decline"
  | "unknown";

export type UnderperformanceResult = {
  category: UnderperformanceCategory;
  reasons: string[];
  confidence: "low" | "medium" | "high";
  recommendedAction: string;
};

export type UnderperformanceContext = {
  daysSincePublication?: number | null;
  indexationKnown?: boolean | null;
  indexed?: boolean | null;
  hasCannibalizationRisk?: boolean;
};

export function getUnderperformanceReasons(result: UnderperformanceResult): string[] {
  return result.reasons;
}

export function calculateUnderperformanceConfidence(
  snapshot: ContentPerformanceSnapshot,
): "low" | "medium" | "high" {
  const signal = getSnapshotConfidence(snapshot);
  if (signal === "high-confidence" || signal === "medium-confidence") return "medium";
  return "low";
}

export function recommendUnderperformanceAction(result: UnderperformanceResult): string {
  switch (result.category) {
    case "too-early":
      return "Дождаться накопления данных";
    case "not-indexed":
      return "Проверить indexability и sitemap (Stage 29)";
    case "no-demand":
      return "Проверить search intent и keyword demand";
    case "impressions-no-clicks":
      return "Обновить title/description для улучшения CTR";
    case "clicks-weak-engagement":
      return "Улучшить контент и структуру страницы";
    case "engagement-no-cta":
      return "Добавить или усилить CTA";
    case "cta-no-submissions":
      return "Проверить форму и friction";
    case "leads-low-quality":
      return "Уточнить intent и квалификацию";
    case "high-cost-weak-result":
      return "Пересмотреть ROI и приоритет";
    case "cannibalization":
      return "Решить каннибализацию через canonical/consolidation";
    case "seasonal-decline":
      return "Учесть сезонность, не спешить с noindex";
    default:
      return "Investigate вручную";
  }
}

export function classifyUnderperformance(
  snapshot: ContentPerformanceSnapshot,
  context: UnderperformanceContext = {},
): UnderperformanceResult {
  const preset = getActiveConfidencePreset();
  const days =
    context.daysSincePublication ??
    (snapshot.publication.publishedAt
      ? Math.floor(
          (Date.now() - new Date(snapshot.publication.publishedAt).getTime()) / (1000 * 60 * 60 * 24),
        )
      : null);

  if (days != null && days < preset.minimumDaysSincePublication) {
    return {
      category: "too-early",
      reasons: ["Страница опубликована недавно"],
      confidence: "low",
      recommendedAction: recommendUnderperformanceAction({ category: "too-early", reasons: [], confidence: "low", recommendedAction: "" }),
    };
  }

  if (context.indexed === false || snapshot.search.indexed === false) {
    return {
      category: "not-indexed",
      reasons: ["Страница не проиндексирована или статус unknown→not-indexed"],
      confidence: "medium",
      recommendedAction: recommendUnderperformanceAction({ category: "not-indexed", reasons: [], confidence: "medium", recommendedAction: "" }),
    };
  }

  if (
    snapshot.search.impressions != null &&
    snapshot.search.impressions === 0 &&
    (snapshot.traffic.pageViews ?? 0) < 5
  ) {
    return {
      category: "no-demand",
      reasons: ["Нет search demand и минимальный трафик"],
      confidence: calculateUnderperformanceConfidence(snapshot),
      recommendedAction: recommendUnderperformanceAction({ category: "no-demand", reasons: [], confidence: "low", recommendedAction: "" }),
    };
  }

  if (
    (snapshot.search.impressions ?? 0) >= preset.minimumImpressions &&
    (snapshot.search.clicks ?? 0) === 0
  ) {
    return {
      category: "impressions-no-clicks",
      reasons: ["Есть impressions, но нет clicks"],
      confidence: "medium",
      recommendedAction: recommendUnderperformanceAction({ category: "impressions-no-clicks", reasons: [], confidence: "medium", recommendedAction: "" }),
    };
  }

  if (
    (snapshot.search.clicks ?? 0) > 0 &&
    (snapshot.traffic.pageViews ?? 0) < (snapshot.search.clicks ?? 0)
  ) {
    return {
      category: "clicks-weak-engagement",
      reasons: ["Клики из search не конвертируются во views/engagement"],
      confidence: "low",
      recommendedAction: recommendUnderperformanceAction({ category: "clicks-weak-engagement", reasons: [], confidence: "low", recommendedAction: "" }),
    };
  }

  if (
    (snapshot.traffic.pageViews ?? 0) >= preset.minimumPageViews &&
    (snapshot.conversions.ctaClicks ?? 0) === 0
  ) {
    return {
      category: "engagement-no-cta",
      reasons: ["Есть трафик, но нет CTA clicks"],
      confidence: "medium",
      recommendedAction: recommendUnderperformanceAction({ category: "engagement-no-cta", reasons: [], confidence: "medium", recommendedAction: "" }),
    };
  }

  if (
    (snapshot.conversions.ctaClicks ?? 0) > 0 &&
    (snapshot.conversions.formSubmissions ?? 0) === 0
  ) {
    return {
      category: "cta-no-submissions",
      reasons: ["CTA clicks без form submissions"],
      confidence: "medium",
      recommendedAction: recommendUnderperformanceAction({ category: "cta-no-submissions", reasons: [], confidence: "medium", recommendedAction: "" }),
    };
  }

  if (
    (snapshot.conversions.leads ?? 0) > 0 &&
    (snapshot.conversions.qualifiedLeads ?? 0) === 0
  ) {
    return {
      category: "leads-low-quality",
      reasons: ["Есть лиды, но нет qualified/won"],
      confidence: "medium",
      recommendedAction: recommendUnderperformanceAction({ category: "leads-low-quality", reasons: [], confidence: "medium", recommendedAction: "" }),
    };
  }

  if (context.hasCannibalizationRisk) {
    return {
      category: "cannibalization",
      reasons: ["Риск каннибализации"],
      confidence: "medium",
      recommendedAction: recommendUnderperformanceAction({ category: "cannibalization", reasons: [], confidence: "medium", recommendedAction: "" }),
    };
  }

  return {
    category: "unknown",
    reasons: ["Не удалось классифицировать underperformance"],
    confidence: "low",
    recommendedAction: recommendUnderperformanceAction({ category: "unknown", reasons: [], confidence: "low", recommendedAction: "" }),
  };
}

export const contentUnderperformanceService = {
  classifyUnderperformance,
  getUnderperformanceReasons,
  calculateUnderperformanceConfidence,
  recommendUnderperformanceAction,
};
