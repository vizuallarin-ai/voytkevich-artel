import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { getActiveConfidencePreset } from "@/data/content-analytics-confidence-rules";
import { getSnapshotConfidence } from "@/lib/content-analytics/content-performance-snapshot-service";

export type ContentDecayResult = {
  detected: boolean;
  severity: "none" | "low" | "medium" | "high";
  signals: string[];
  confidence: "low" | "medium" | "high";
  recommendation: string;
};

function daysSince(date?: string | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

export function detectTrafficDecay(
  current: ContentPerformanceSnapshot,
  previous: ContentPerformanceSnapshot,
): boolean {
  const curr = current.traffic.pageViews;
  const prev = previous.traffic.pageViews;
  if (curr == null || prev == null || prev < 10) return false;
  return curr < prev * 0.6;
}

export function detectSearchVisibilityDecay(
  current: ContentPerformanceSnapshot,
  previous: ContentPerformanceSnapshot,
): boolean {
  const curr = current.search.impressions;
  const prev = previous.search.impressions;
  if (curr == null || prev == null || prev < 50) return false;
  return curr < prev * 0.6;
}

export function detectConversionDecay(
  current: ContentPerformanceSnapshot,
  previous: ContentPerformanceSnapshot,
): boolean {
  const curr = current.conversions.leads;
  const prev = previous.conversions.leads;
  if (curr == null || prev == null || prev < 2) return false;
  return curr < prev * 0.5;
}

export function detectIndexationDecay(current: ContentPerformanceSnapshot): boolean {
  return current.search.indexed === false;
}

export function explainDecayReasons(result: ContentDecayResult): string[] {
  return result.signals;
}

export function recommendDecayAction(result: ContentDecayResult): string {
  if (!result.detected) return "Мониторинг без изменений";
  if (result.severity === "high") return "Приоритетное обновление контента и SEO-review";
  if (result.severity === "medium") return "Запланировать обновление и проверить internal links";
  return "Продолжить наблюдение, собрать больше данных";
}

export function calculateDecaySeverity(signals: string[]): ContentDecayResult["severity"] {
  if (signals.length >= 3) return "high";
  if (signals.length === 2) return "medium";
  if (signals.length === 1) return "low";
  return "none";
}

export function detectContentDecay(
  current: ContentPerformanceSnapshot,
  previous?: ContentPerformanceSnapshot,
): ContentDecayResult {
  const preset = getActiveConfidencePreset();
  const age = daysSince(current.publication.publishedAt);
  const confidenceSignal = getSnapshotConfidence(current);

  if (age != null && age < preset.minimumDaysSincePublication) {
    return {
      detected: false,
      severity: "none",
      signals: ["Страница слишком молодая для оценки decay"],
      confidence: "low",
      recommendation: "Дождаться накопления данных",
    };
  }

  if (confidenceSignal === "needs-more-observation-time" || confidenceSignal === "insufficient-data") {
    return {
      detected: false,
      severity: "none",
      signals: ["Недостаточно данных для decay detection"],
      confidence: "low",
      recommendation: "Продолжить наблюдение",
    };
  }

  const signals: string[] = [];
  if (previous) {
    if (detectTrafficDecay(current, previous)) signals.push("traffic-decline");
    if (detectSearchVisibilityDecay(current, previous)) signals.push("search-visibility-decline");
    if (detectConversionDecay(current, previous)) signals.push("conversion-decline");
  }
  if (detectIndexationDecay(current)) signals.push("indexation-lost");

  const severity = calculateDecaySeverity(signals);
  const detected = severity !== "none";

  const result: ContentDecayResult = {
    detected,
    severity,
    signals,
    confidence: signals.length >= 2 ? "medium" : "low",
    recommendation: "",
  };
  result.recommendation = recommendDecayAction(result);
  return result;
}

export const contentDecayService = {
  detectContentDecay,
  calculateDecaySeverity,
  detectTrafficDecay,
  detectSearchVisibilityDecay,
  detectConversionDecay,
  detectIndexationDecay,
  explainDecayReasons,
  recommendDecayAction,
};
