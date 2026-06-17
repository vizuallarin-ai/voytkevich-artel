import type { TechnicalArticle, TechnicalLeadContext } from "@/types/technical-content";

export function buildTechnicalLeadContext(
  article: TechnicalArticle,
  sourceCTA: string,
  sourceSection?: string,
): TechnicalLeadContext {
  return {
    pageType: "technical-article",
    articleSlug: article.slug,
    articleTitle: article.h1,
    articleType: article.type,
    clusterId: article.clusterId,
    currentUrl: article.url,
    sourceCTA,
    sourceSection,
    leadMagnetId: article.cta.leadMagnetId,
    relatedProjectCategory: article.related.projectCategories[0],
  };
}

export function formatTechnicalLeadSummary(ctx: TechnicalLeadContext): string {
  return [
    `Статья: «${ctx.articleTitle}»`,
    `URL: ${ctx.currentUrl}`,
    `Кластер: ${ctx.clusterId}`,
    `CTA: «${ctx.sourceCTA}»`,
    ctx.leadMagnetId ? `Лид-магнит: ${ctx.leadMagnetId}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
