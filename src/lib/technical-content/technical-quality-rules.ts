import type { TechnicalArticle, TechnicalContentQualityScore } from "@/types/technical-content";

const DANGEROUS_PATTERNS = [
  /сделайте сами без/i,
  /можно не вызывать специалист/i,
  /точно подойдёт любой фундамент/i,
  /снип\s*\d+/i,
  /гост\s*\d+/i,
];

function countWords(article: TechnicalArticle): number {
  const parts = [
    article.content.shortAnswer,
    article.content.intro,
    article.content.howItWorks,
    article.content.howUsuallyDone,
    ...(article.content.mistakes ?? []),
    ...(article.content.whenToCallExpert ?? []),
    ...(article.content.checklist ?? []),
  ];
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export function calculateTechnicalContentQualityScore(
  article: TechnicalArticle,
): TechnicalContentQualityScore {
  const warnings: string[] = [];
  const blockers: string[] = [];
  let score = 0;

  if (article.content.shortAnswer?.length > 40) score += 15;
  else blockers.push("Нет короткого ответа");

  if (article.content.disclaimerId) score += 15;
  else blockers.push("Нет дисклеймера");

  if (article.faq.length >= 2) score += 10;
  else warnings.push("Мало FAQ");

  if (article.cta.primary) score += 10;
  else blockers.push("Нет CTA");

  const relatedCount =
    article.related.articles.length +
    article.related.programmaticPages.length +
    article.related.projectCategories.length;
  if (relatedCount >= 2) score += 10;
  else warnings.push("Мало перелинковки");

  if ((article.content.whenToCallExpert?.length ?? 0) > 0) score += 10;
  else warnings.push("Нет блока «когда нужен специалист»");

  if ((article.content.mistakes?.length ?? 0) > 0) score += 10;
  else warnings.push("Нет блока ошибок");

  const words = countWords(article);
  if (words >= 400) score += 10;
  else warnings.push(`Мало текста (${words} слов)`);

  if (article.status === "published" || article.status === "approved") score += 10;

  const fullText = JSON.stringify(article.content);
  if (DANGEROUS_PATTERNS.some((p) => p.test(fullText))) {
    blockers.push("Возможны опасные или нормативные формулировки");
    score -= 20;
  }

  if (article.quality.requiresTechnicalReview && article.status === "needs-expert-review") {
    blockers.push("Требуется экспертная проверка");
  }

  if (article.status === "planned" || article.status === "ai-generated") {
    blockers.push(`Статус: ${article.status}`);
  }

  const level: TechnicalContentQualityScore["level"] =
    score >= 80 ? "strong" : score >= 65 ? "good" : score >= 45 ? "acceptable" : "poor";

  return {
    score: Math.max(0, Math.min(100, score)),
    level,
    warnings,
    blockers,
    canPublish: blockers.length === 0 && level !== "poor",
    shouldNoindex: blockers.length > 0 || level === "poor" || level === "acceptable",
    requiresExpertReview: article.quality.requiresTechnicalReview,
  };
}
