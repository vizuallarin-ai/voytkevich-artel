import type { EditorialContentItem, EditorialContentQualityScore } from "@/types/editorial-content";
import {
  requiresFactCheck,
  requiresFictionNotice,
  validateNoFakeClientClaims,
} from "@/data/editorial-ethics-rules";
import { passesFactCheck } from "@/data/editorial-fact-check-rules";

function countWords(item: EditorialContentItem): number {
  const parts = [
    item.content.intro,
    item.content.hook,
    item.content.storyBody,
    item.content.situation,
    item.content.conflict,
    item.content.turningPoint,
    item.content.conclusion,
    item.content.localContext,
    item.content.newsSummary,
    ...(item.content.takeaways ?? []),
    ...(item.content.practicalAdvice ?? []),
    ...(item.content.digestItems?.map((d) => d.summary) ?? []),
  ];
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export function calculateEditorialContentQualityScore(
  item: EditorialContentItem,
): EditorialContentQualityScore {
  const warnings: string[] = [];
  const blockers: string[] = [];
  let score = 0;

  if (item.content.hook?.length > 30) score += 10;
  else warnings.push("Слабый hook");

  if (item.content.situation || item.content.intro) score += 10;
  else warnings.push("Нет ситуации");

  if ((item.content.takeaways?.length ?? 0) >= 2 || item.content.conclusion) score += 10;
  else warnings.push("Нет практических выводов");

  if (item.cta.primary) score += 10;
  else blockers.push("Нет CTA");

  const relatedCount =
    item.related.technicalArticles.length +
    item.related.projectCategories.length +
    item.related.programmaticPages.length;
  if (relatedCount >= 2) score += 10;
  else blockers.push("Нет related links");

  if (item.cta.leadMagnetId) score += 5;

  if (requiresFictionNotice(item)) {
    if (item.storyMeta.fictionNoticeRequired) score += 10;
    else blockers.push("Вымышленная история без маркировки");
  } else {
    score += 5;
  }

  if (requiresFactCheck(item)) {
    if (passesFactCheck(item)) score += 10;
    else blockers.push("Требуется fact-check или источник");
  }

  const fakeErrors = validateNoFakeClientClaims(item.content);
  if (fakeErrors.length) {
    blockers.push(...fakeErrors);
    score -= 15;
  }

  if (item.quality.fakeClaimRisk === "high") {
    blockers.push("Высокий риск фейковых утверждений");
    score -= 20;
  }

  const words = countWords(item);
  if (words >= 350) score += 10;
  else {
    warnings.push(`Мало текста (${words} слов)`);
    if (words < 150) blockers.push("Thin content");
  }

  if (item.quality.clickbaitRisk === "high") {
    warnings.push("Риск кликбейта");
    score -= 10;
  }

  if (item.status === "published" || item.status === "approved") score += 10;

  if (item.status === "planned" || item.status === "ai-generated") {
    blockers.push(`Статус: ${item.status}`);
  }

  const level: EditorialContentQualityScore["level"] =
    score >= 80 ? "strong" : score >= 65 ? "good" : score >= 45 ? "acceptable" : "poor";

  return {
    score: Math.max(0, Math.min(100, score)),
    level,
    warnings,
    blockers,
    canPublish: blockers.length === 0 && level !== "poor",
    shouldNoindex: blockers.length > 0 || level === "poor" || level === "acceptable",
    requiresFactCheck: requiresFactCheck(item) && !passesFactCheck(item),
    requiresFictionNotice: requiresFictionNotice(item) && !item.storyMeta.fictionNoticeRequired,
  };
}
