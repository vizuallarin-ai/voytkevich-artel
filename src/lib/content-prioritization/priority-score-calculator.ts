import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPriorityScore, PriorityConfidence } from "@/types/content-prioritization";
import type { KeywordDemandItem } from "@/types/keyword-demand";
import { priorityScoringWeights, scoreToPriorityLevel } from "@/data/priority-scoring-rules";
import { scoreCommercialIntent } from "@/data/commercial-intent-scoring";
import { scoreSearchIntent } from "@/data/search-intent-scoring";
import { scoreLocalDemand } from "@/data/local-demand-rules";
import { getSeasonalityBoost } from "@/data/seasonality-rules";
import { getContentDifficulty } from "@/data/content-difficulty-rules";
import { getCannibalizationPenalty } from "@/lib/content-prioritization/cannibalization-priority-check";
import { explainPriorityScore, recommendedActionFromScore } from "@/lib/content-prioritization/priority-explainer";
import { getContentReadiness } from "@/lib/content-calendar/content-readiness";

export type PriorityCalculationContext = {
  keywordData?: KeywordDemandItem | null;
  allItems?: CMSContentItem[];
  date?: Date;
};

export function calculateSearchDemandScore(keywordData?: KeywordDemandItem | null): number {
  if (!keywordData?.metrics.searchVolume && keywordData?.metrics.searchVolume !== 0) {
    return 45;
  }
  const vol = keywordData.metrics.searchVolume ?? 0;
  if (vol >= 1000) return 95;
  if (vol >= 300) return 80;
  if (vol >= 100) return 65;
  if (vol >= 30) return 50;
  return 35;
}

export function calculateCommercialIntentScore(
  contentItem: CMSContentItem,
  keywordData?: KeywordDemandItem | null,
): number {
  const text = `${contentItem.title} ${contentItem.seo.targetKeyword ?? ""} ${contentItem.seoDescription ?? ""}`;
  let score = scoreCommercialIntent(text);
  if (keywordData?.intent === "commercial" || keywordData?.intent === "transactional") {
    score = Math.max(score, 85);
  }
  if (contentItem.kind === "programmatic-page" || contentItem.kind === "landing-page") {
    score = Math.max(score, 75);
  }
  return score;
}

export function calculateLeadPotentialScore(contentItem: CMSContentItem): number {
  const commercial = calculateCommercialIntentScore(contentItem);
  if (contentItem.kind === "programmatic-page" || contentItem.kind === "landing-page") {
    return Math.min(95, commercial + 10);
  }
  if (contentItem.kind === "technical-article") return Math.min(70, commercial);
  if (contentItem.kind === "lead-magnet") return 85;
  if (contentItem.kind === "editorial-content" || contentItem.kind === "news") return 40;
  return 50;
}

export function calculateStrategicValueScore(contentItem: CMSContentItem): number {
  const p = contentItem.seo.priority;
  if (p === "P1") return 90;
  if (p === "P2") return 75;
  if (p === "P3") return 55;
  if (p === "P4") return 35;
  return 50;
}

export function calculateLocalDemandScore(contentItem: CMSContentItem): number {
  const text = `${contentItem.title} ${contentItem.seo.targetKeyword ?? ""} ${contentItem.url}`;
  return scoreLocalDemand(text).score;
}

export function calculateSeasonalityScore(contentItem: CMSContentItem, date = new Date()): number {
  const boost = getSeasonalityBoost(contentItem.clusterId, date);
  return 50 + boost;
}

export async function calculateReadinessScore(contentItem: CMSContentItem): Promise<number> {
  const readiness = await getContentReadiness(contentItem);
  if (readiness.canSchedule) return 90;
  if (readiness.canPublish) return 85;
  if (readiness.blockers.length) return 30;
  if (readiness.warnings.length) return 55;
  return 60;
}

export function calculateCompetitionScore(keywordData?: KeywordDemandItem | null): number {
  if (!keywordData?.metrics.keywordDifficulty && !keywordData?.metrics.competition) return 50;
  const diff = keywordData.metrics.keywordDifficulty;
  if (diff != null) {
    if (diff >= 70) return 30;
    if (diff >= 40) return 50;
    return 70;
  }
  const comp = keywordData.metrics.competition;
  if (comp === "high") return 30;
  if (comp === "medium") return 50;
  if (comp === "low") return 75;
  return 50;
}

export function calculateContentDifficultyScore(contentItem: CMSContentItem): number {
  const text = `${contentItem.title} ${contentItem.seo.targetKeyword ?? ""}`;
  const d = getContentDifficulty(contentItem.kind, text);
  if (d.difficulty === "high") return 75;
  if (d.difficulty === "medium") return 50;
  return 25;
}

export function calculateThinContentPenalty(contentItem: CMSContentItem): number {
  const risk =
    contentItem.seo.thinContentRisk ??
    (contentItem.quality.blockers.some((b) => /thin|коротк|мало контента/i.test(b))
      ? "high"
      : contentItem.quality.warnings.some((w) => /thin|коротк/i.test(w))
        ? "medium"
        : undefined);
  if (risk === "high") return 20;
  if (risk === "medium") return 10;
  return 0;
}

export function calculatePriorityConfidence(inputs: {
  hasSearchVolume: boolean;
  hasKeywordDifficulty: boolean;
  hasGSCData: boolean;
  heuristic: boolean;
}): PriorityConfidence {
  if (inputs.hasSearchVolume && (inputs.hasKeywordDifficulty || inputs.hasGSCData)) return "high";
  if (inputs.hasSearchVolume || inputs.hasGSCData) return "medium";
  return "low";
}

export function assignPriorityLevel(score: number, confidence: PriorityConfidence): {
  level: ContentPriorityScore["level"];
  heuristic: boolean;
} {
  const level = scoreToPriorityLevel(score);
  return { level, heuristic: confidence === "low" };
}

export async function calculateContentPriorityScore(
  contentItem: CMSContentItem,
  context: PriorityCalculationContext = {},
): Promise<ContentPriorityScore> {
  const keywordData = context.keywordData;
  const allItems = context.allItems ?? [];
  const date = context.date ?? new Date();

  const searchDemandScore = calculateSearchDemandScore(keywordData);
  const commercialIntentScore = calculateCommercialIntentScore(contentItem, keywordData);
  const leadPotentialScore = calculateLeadPotentialScore(contentItem);
  const strategicValueScore = calculateStrategicValueScore(contentItem);
  const localDemandScore = calculateLocalDemandScore(contentItem);
  const seasonalityScore = calculateSeasonalityScore(contentItem, date);
  const readinessScore = await calculateReadinessScore(contentItem);
  const competitionScore = calculateCompetitionScore(keywordData);
  const contentDifficultyScore = calculateContentDifficultyScore(contentItem);
  const cannibalizationPenalty = getCannibalizationPenalty(contentItem, allItems);
  const thinContentPenalty = calculateThinContentPenalty(contentItem);

  const w = priorityScoringWeights;
  const raw =
    searchDemandScore * w.searchDemand +
    commercialIntentScore * w.commercialIntent +
    leadPotentialScore * w.leadPotential +
    strategicValueScore * w.strategicValue +
    localDemandScore * w.localDemand +
    seasonalityScore * w.seasonality +
    readinessScore * w.readiness +
    competitionScore * w.competition +
    contentDifficultyScore * w.contentDifficulty -
    cannibalizationPenalty * Math.abs(w.cannibalizationPenalty) -
    thinContentPenalty * Math.abs(w.thinContentPenalty);

  const score = Math.round(Math.max(0, Math.min(100, raw * 1.2)));

  const hasSearchVolume = keywordData?.metrics.searchVolume != null;
  const hasKeywordDifficulty = keywordData?.metrics.keywordDifficulty != null;
  const hasGSCData =
    keywordData?.metrics.impressions != null || keywordData?.metrics.clicks != null;
  const hasYandexData = keywordData?.source === "yandex-wordstat" || keywordData?.source === "yandex-webmaster";
  const hasAnalyticsData = false;

  const heuristic = !hasSearchVolume && !hasGSCData;
  const confidence = calculatePriorityConfidence({
    hasSearchVolume,
    hasKeywordDifficulty,
    hasGSCData,
    heuristic,
  });

  const { level, heuristic: isHeuristic } = assignPriorityLevel(score, confidence);

  const warnings: string[] = [];
  if (!hasSearchVolume) warnings.push("Нет данных частотности — heuristic mode");
  if (confidence === "low" && level === "P1") warnings.push("P1 heuristic — импортируйте Wordstat/GSC");
  if (cannibalizationPenalty > 15) warnings.push("Высокий риск каннибализации");
  if (thinContentPenalty > 10) warnings.push("Thin content risk");

  const intent = scoreSearchIntent(`${contentItem.title} ${contentItem.seo.targetKeyword ?? ""}`);
  void intent;

  const partial: ContentPriorityScore = {
    contentItemId: contentItem.id,
    score,
    level,
    confidence,
    heuristic: isHeuristic || heuristic,
    inputs: {
      searchDemandScore,
      commercialIntentScore,
      leadPotentialScore,
      strategicValueScore,
      contentDifficultyScore,
      competitionScore,
      localDemandScore,
      seasonalityScore,
      readinessScore,
      cannibalizationPenalty,
      thinContentPenalty,
    },
    dataAvailability: {
      hasSearchVolume,
      hasKeywordDifficulty,
      hasGSCData,
      hasYandexData,
      hasAnalyticsData,
    },
    warnings,
    explanation: "",
    recommendedAction: "",
    calculatedAt: new Date().toISOString(),
  };

  partial.explanation = explainPriorityScore(partial, contentItem);
  partial.recommendedAction = recommendedActionFromScore(partial, contentItem);

  return partial;
}
