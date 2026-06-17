import type { CMSContentItem } from "@/types/content-cms";
import type { UnifiedContentQualityScore } from "@/types/content-quality";

export function getUnifiedContentQualityScore(item: CMSContentItem): UnifiedContentQualityScore {
  const requiredActions: string[] = [];

  if (item.quality.requiresHumanReview) {
    requiredActions.push("Ручная проверка редактора");
  }
  if (item.quality.requiresExpertReview) {
    requiredActions.push("Экспертная проверка");
  }
  if (item.quality.requiresFactCheck) {
    requiredActions.push("Fact-check");
  }
  if (item.quality.requiresSource) {
    requiredActions.push("Добавить источник");
  }
  if (item.quality.requiresFictionNotice && !item.ethics?.fictionNoticePresent) {
    requiredActions.push("Добавить fiction notice");
  }
  if (item.quality.blockers.length) {
    requiredActions.push(`Устранить blockers (${item.quality.blockers.length})`);
  }

  return {
    score: item.quality.score,
    level: item.quality.level,
    warnings: item.quality.warnings,
    blockers: item.quality.blockers,
    canPublish: item.quality.canPublish,
    shouldNoindex: item.quality.shouldNoindex,
    requiredActions,
  };
}
