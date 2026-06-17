import type { CMSContentItem } from "@/types/content-cms";

export const contentReviewRules = [
  "AI-generated материалы обязательно проходят review",
  "Новости требуют источника перед approve",
  "Нормативные материалы требуют fact-check",
  "Технические статьи с requiresTechnicalReview — экспертная проверка",
  "Вымышленные истории требуют fiction notice",
  "Материалы с blockers не переходят в approved",
  "High fakeClaimRisk блокирует публикацию",
  "High dangerousInstructionRisk блокирует публикацию technical",
];

export const REVIEW_QUEUE_STATUSES = [
  "review",
  "ai-generated",
  "needs-source",
  "needs-fact-check",
  "needs-expert-review",
] as const;

export function getReviewGroup(item: CMSContentItem): string {
  if (item.status === "needs-expert-review" || item.quality.requiresExpertReview) {
    return "expert";
  }
  if (item.status === "needs-source" || item.quality.requiresSource) return "source";
  if (item.status === "needs-fact-check" || item.quality.requiresFactCheck) return "fact-check";
  if (item.quality.blockers.length > 0) return "blockers";
  if (item.status === "ai-generated") return "ai-review";
  if (item.quality.requiresHumanReview) return "editor";
  return "seo";
}
