import type { Metadata } from "next";
import type { TechnicalArticle, TechnicalContentQualityScore } from "@/types/technical-content";
import { pageMetadata } from "@/lib/seo";

const NOINDEX_STATUSES = new Set([
  "planned",
  "draft",
  "ai-generated",
  "review",
  "noindex",
  "needs-expert-review",
  "needs-keyword-data",
  "rejected",
]);

export function resolveTechnicalIndexing(
  article: TechnicalArticle,
  qualityScore?: TechnicalContentQualityScore,
): TechnicalArticle["indexing"] {
  if (NOINDEX_STATUSES.has(article.status)) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: `status: ${article.status}`,
    };
  }

  if (article.status !== "published" && article.status !== "approved") {
    return { indexable: false, sitemap: false, noindexReason: "not published" };
  }

  if (!article.content.disclaimerId) {
    return { indexable: false, sitemap: false, noindexReason: "missing disclaimer" };
  }

  if (qualityScore && !qualityScore.canPublish) {
    return {
      indexable: false,
      sitemap: false,
      noindexReason: qualityScore.blockers[0] ?? "quality score too low",
    };
  }

  if (qualityScore?.shouldNoindex) {
    return { indexable: false, sitemap: false, noindexReason: "quality should noindex" };
  }

  return {
    indexable: true,
    sitemap: true,
    canonicalUrl: article.indexing.canonicalUrl ?? article.url,
  };
}

export function generateTechnicalArticleRobots(article: TechnicalArticle) {
  return {
    index: article.indexing.indexable,
    follow: true,
  };
}

export function generateTechnicalArticleCanonical(article: TechnicalArticle): string | undefined {
  return article.indexing.canonicalUrl ?? article.url;
}

export function generateTechnicalArticleMetadata(article: TechnicalArticle): Metadata {
  const meta = pageMetadata({
    title: article.seoTitle,
    description: article.seoDescription,
    path: article.url,
    noindex: !article.indexing.indexable,
  });

  return {
    ...meta,
    robots: generateTechnicalArticleRobots(article),
    alternates: {
      canonical: generateTechnicalArticleCanonical(article),
    },
  };
}
