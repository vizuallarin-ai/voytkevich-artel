import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPriorityScore } from "@/types/content-prioritization";

export function explainPriorityScore(score: ContentPriorityScore, contentItem: CMSContentItem): string {
  const parts: string[] = [];

  const prefix = score.heuristic ? `${score.level} heuristic` : score.level;
  parts.push(`${prefix}: «${contentItem.title}» — score ${score.score}/100, confidence ${score.confidence}.`);

  if (score.inputs.commercialIntentScore >= 75) {
    parts.push("Высокий коммерческий интент.");
  }
  if (score.inputs.leadPotentialScore >= 75) {
    parts.push("Высокий лид-потенциал.");
  }
  if (score.inputs.localDemandScore >= 75) {
    parts.push("Сильная локальная привязка (Иркутск/область).");
  }
  if (score.inputs.seasonalityScore >= 60) {
    parts.push("Сезонный boost для текущего периода.");
  }
  if (!score.dataAvailability.hasSearchVolume) {
    parts.push("Частотность не импортирована — не утверждаем high demand.");
  }
  if (score.inputs.cannibalizationPenalty > 10) {
    parts.push("Штраф за каннибализацию — нужен canonical/merge.");
  }

  return parts.join(" ");
}

export function explainWhyP1(score: ContentPriorityScore): string {
  if (score.level !== "P1") return "Не P1";
  return score.heuristic
    ? "P1 heuristic: высокий коммерческий/лид-потенциал без подтверждённой частотности."
    : "P1 data-driven: подтверждённый спрос и коммерческая ценность.";
}

export function explainWhyNotP1(score: ContentPriorityScore): string {
  if (score.level === "P1") return "";
  const reasons: string[] = [];
  if (score.inputs.readinessScore < 50) reasons.push("низкая readiness");
  if (score.inputs.cannibalizationPenalty > 15) reasons.push("каннибализация");
  if (score.inputs.commercialIntentScore < 50) reasons.push("слабый коммерческий интент");
  if (score.score < 80) reasons.push(`score ${score.score} < 80`);
  return reasons.length ? `Не P1: ${reasons.join(", ")}` : "Не P1: общий score ниже порога";
}

export function explainMissingData(score: ContentPriorityScore): string[] {
  const missing: string[] = [];
  if (!score.dataAvailability.hasSearchVolume) missing.push("search volume");
  if (!score.dataAvailability.hasKeywordDifficulty) missing.push("keyword difficulty");
  if (!score.dataAvailability.hasGSCData) missing.push("GSC impressions/clicks");
  if (!score.dataAvailability.hasYandexData) missing.push("Yandex Wordstat/Webmaster");
  return missing;
}

export function recommendedActionFromScore(
  score: ContentPriorityScore,
  contentItem: CMSContentItem,
): string {
  if (score.warnings.some((w) => w.includes("каннибализац"))) {
    return "Решить canonical/merge перед публикацией";
  }
  if (!score.dataAvailability.hasSearchVolume) {
    return "Импортировать CSV семантики / Wordstat";
  }
  if (contentItem.status === "approved" && score.inputs.readinessScore >= 80) {
    return "Добавить в календарь публикаций";
  }
  if (contentItem.status === "draft" || contentItem.status === "idea") {
    return "Отправить в AI-контент-завод или на review";
  }
  if (score.level === "P1" || score.level === "P2") {
    return "Приоритетная разработка контента";
  }
  return "Держать в очереди P3+";
}

export function explainRecommendedNextAction(score: ContentPriorityScore): string {
  return score.recommendedAction || recommendedActionFromScore(score, { id: score.contentItemId } as CMSContentItem);
}
