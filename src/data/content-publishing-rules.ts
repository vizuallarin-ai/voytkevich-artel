import type { CMSContentItem } from "@/types/content-cms";
import type { ContentStatus } from "@/types/content-workflow";
import { DIRECT_PUBLISH_FORBIDDEN } from "@/data/content-statuses";

export const contentPublishingRules = {
  canPublishStatuses: ["approved", "scheduled"] as ContentStatus[],
  forbiddenDirectPublish: DIRECT_PUBLISH_FORBIDDEN,
  minQualityLevels: ["good", "strong"] as const,
  acceptableWithManualApproval: "acceptable" as const,
};

export function canPublishByRules(item: CMSContentItem): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!contentPublishingRules.canPublishStatuses.includes(item.status)) {
    reasons.push(`Статус «${item.status}» не допускает публикацию`);
  }
  if (item.quality.blockers.length > 0) {
    reasons.push(`Есть blockers: ${item.quality.blockers.length}`);
  }
  if (!item.quality.canPublish) {
    reasons.push("quality.canPublish = false");
  }
  if (item.quality.level === "poor") {
    reasons.push("Quality level: poor");
  }
  if (item.quality.requiresSource && item.status === "needs-source") {
    reasons.push("Требуется источник");
  }
  if (item.quality.requiresFactCheck && item.factCheck?.status !== "passed") {
    reasons.push("Fact-check не пройден");
  }
  if (item.ethics?.fictionNoticeRequired && !item.ethics.fictionNoticePresent) {
    reasons.push("Отсутствует fiction notice");
  }
  if (item.ethics?.fakeClaimRisk === "high") {
    reasons.push("Высокий риск фейковых утверждений");
  }
  if (!item.seoTitle || !item.seoDescription) {
    reasons.push("Неполные metadata");
  }

  return { ok: reasons.length === 0, reasons };
}
