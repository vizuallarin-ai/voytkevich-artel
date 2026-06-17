import type { CMSContentItem, CMSContentKind } from "@/types/content-cms";
import type { ContentStatus } from "@/types/content-workflow";
import type { ProgrammaticSEOPage } from "@/types/programmatic-seo";
import type { TechnicalArticle } from "@/types/technical-content";
import type { EditorialContentItem } from "@/types/editorial-content";
import { calculateContentQualityScore } from "@/lib/seo/content-quality-rules";
import { calculateTechnicalContentQualityScore } from "@/lib/technical-content/technical-quality-rules";
import { calculateEditorialContentQualityScore } from "@/lib/editorial-content/editorial-quality-rules";
import { getEditorialAuthorById } from "@/data/editorial-authors";
import { requiresFictionNotice } from "@/data/editorial-ethics-rules";

export function normalizeContentStatus(status: string): ContentStatus {
  const map: Record<string, ContentStatus> = {
    "needs-human-review": "review",
    "needs-expert-review": "needs-expert-review",
    "needs-keyword-data": "needs-keyword-data",
    "needs-source": "needs-source",
    "needs-fact-check": "needs-fact-check",
    "needs-project-data": "needs-project-data",
    "needs-update": "needs-update",
    "ai-generated": "ai-generated",
    noindex: "noindex",
  };
  if (map[status]) return map[status];
  const allowed: ContentStatus[] = [
    "idea",
    "planned",
    "draft",
    "review",
    "approved",
    "scheduled",
    "published",
    "archived",
    "rejected",
  ];
  return allowed.includes(status as ContentStatus) ? (status as ContentStatus) : "planned";
}

function resolveEditorialKind(item: EditorialContentItem): CMSContentKind {
  if (item.type === "news" || item.type === "news-analysis" || item.type === "trend-review") {
    return "news";
  }
  if (
    item.type === "weekly-digest" ||
    item.type === "monthly-digest" ||
    item.type === "question-roundup"
  ) {
    return "digest";
  }
  return "editorial-content";
}

export function mapProgrammaticToCMS(page: ProgrammaticSEOPage): CMSContentItem {
  const q = calculateContentQualityScore(page);
  const status = normalizeContentStatus(page.status);

  return {
    id: `prog:${page.id}`,
    kind: "programmatic-page",
    slug: page.slug,
    url: page.url,
    title: page.title,
    h1: page.h1,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    status,
    contentType: page.pageType,
    clusterId: page.clusterId,
    authorId: page.authorId,
    source: { origin: "programmatic", originId: page.id },
    indexing: {
      indexable: page.indexing.indexable && status === "published",
      canonicalUrl: page.indexing.canonicalUrl,
      noindexReason: page.indexing.noindexReason,
      sitemap: page.indexing.sitemap && status === "published",
      robots: { index: page.indexing.indexable && status === "published", follow: true },
    },
    quality: {
      score: q.score,
      level: q.level,
      warnings: q.warnings,
      blockers: q.blockers,
      canPublish: q.canPublish,
      shouldNoindex: q.shouldNoindex,
      requiresHumanReview: page.contentRequirements.requiresHumanReview,
    },
    workflow: { updatedAt: page.updatedAt ?? page.createdAt },
    seo: {
      targetKeyword: page.targetKeyword,
      secondaryKeywords: page.secondaryKeywords,
      searchDemand: page.priority.searchDemand,
      priority: page.priority.publishPriority,
      cannibalizationRisk: page.priority.cannibalizationRisk,
      thinContentRisk: page.priority.uniquenessRisk,
    },
    distribution: {
      teaserReady: page.distribution.teaserRequired && q.level !== "poor",
      allowExternalTeasers: page.distribution.allowExternalTeasers,
      platforms: page.distribution.platforms,
      canonicalFullArticleUrl: page.distribution.canonicalFullArticleUrl,
      utmCampaignId: page.distribution.utmCampaignId,
    },
    related: {
      projects: page.relatedProjects,
      programmaticPages: page.relatedPages,
      leadMagnets: page.relatedLeadMagnets,
    },
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

export function mapTechnicalToCMS(article: TechnicalArticle): CMSContentItem {
  const q = calculateTechnicalContentQualityScore(article);
  const status = normalizeContentStatus(article.status);

  return {
    id: `tech:${article.id}`,
    kind: "technical-article",
    slug: article.slug,
    url: article.url,
    title: article.title,
    h1: article.h1,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    status,
    contentType: article.type,
    clusterId: article.clusterId,
    authorId: article.authorId,
    source: { origin: "manual", originId: article.id },
    indexing: {
      indexable: article.indexing.indexable,
      canonicalUrl: article.indexing.canonicalUrl ?? article.url,
      noindexReason: article.indexing.noindexReason,
      sitemap: article.indexing.sitemap,
      robots: { index: article.indexing.indexable, follow: true },
    },
    quality: {
      score: q.score,
      level: q.level,
      warnings: q.warnings,
      blockers: q.blockers,
      canPublish: q.canPublish,
      shouldNoindex: q.shouldNoindex,
      requiresHumanReview: article.quality.requiresHumanReview,
      requiresExpertReview: article.quality.requiresTechnicalReview,
    },
    workflow: { updatedAt: article.updatedAt ?? article.createdAt },
    seo: {
      targetKeyword: article.targetKeyword,
      secondaryKeywords: article.secondaryKeywords,
      priority: "P2",
      thinContentRisk: article.quality.thinContentRisk,
    },
    distribution: {
      teaserReady: article.distribution.teaserReady,
      allowExternalTeasers: article.distribution.allowExternalTeasers,
      platforms: article.distribution.platforms,
      canonicalFullArticleUrl: article.distribution.canonicalFullArticleUrl,
      utmCampaignId: article.distribution.utmCampaignId,
    },
    related: {
      projectCategories: article.related.projectCategories,
      technicalArticles: article.related.articles,
      programmaticPages: article.related.programmaticPages,
      leadMagnets: article.related.leadMagnets,
    },
    factCheck: { status: "not-required" },
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

export function mapEditorialToCMS(item: EditorialContentItem): CMSContentItem {
  const q = calculateEditorialContentQualityScore(item);
  const status = normalizeContentStatus(item.status);
  const author = getEditorialAuthorById(item.authorId);
  const fictionRequired = requiresFictionNotice(item);

  return {
    id: `edit:${item.id}`,
    kind: resolveEditorialKind(item),
    slug: item.slug,
    url: item.url,
    title: item.title,
    h1: item.h1,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
    status,
    contentType: item.type,
    rubricId: item.rubricId,
    authorId: item.authorId,
    source: { origin: "manual", originId: item.id },
    indexing: {
      indexable: item.indexing.indexable,
      canonicalUrl: item.indexing.canonicalUrl ?? item.url,
      noindexReason: item.indexing.noindexReason,
      sitemap: item.indexing.sitemap,
      robots: { index: item.indexing.indexable, follow: true },
    },
    quality: {
      score: q.score,
      level: q.level,
      warnings: q.warnings,
      blockers: q.blockers,
      canPublish: q.canPublish,
      shouldNoindex: q.shouldNoindex,
      requiresHumanReview: item.quality.requiresHumanReview,
      requiresFactCheck: item.quality.requiresFactCheck,
      requiresSource: item.storyMeta.sourceRequired,
      requiresFictionNotice: fictionRequired,
    },
    workflow: { updatedAt: item.updatedAt ?? item.createdAt },
    seo: {
      targetKeyword: item.targetKeyword,
      secondaryKeywords: item.secondaryKeywords,
      priority: "P2",
      thinContentRisk: item.quality.thinContentRisk,
    },
    distribution: {
      teaserReady: item.distribution.teaserReady,
      allowExternalTeasers: item.distribution.allowExternalTeasers,
      platforms: item.distribution.platforms,
      canonicalFullArticleUrl: item.distribution.canonicalFullArticleUrl,
      utmCampaignId: item.distribution.utmCampaignId,
    },
    related: {
      projects: item.related.projects,
      projectCategories: item.related.projectCategories,
      technicalArticles: item.related.technicalArticles,
      programmaticPages: item.related.programmaticPages,
      leadMagnets: item.related.leadMagnets,
    },
    ethics: {
      isFictionalized: item.storyMeta.isFictionalized,
      fictionNoticeRequired: fictionRequired,
      fictionNoticePresent: item.storyMeta.fictionNoticeRequired,
      fakeClaimRisk: item.quality.fakeClaimRisk,
      authorIsFictional: author?.isFictional,
    },
    factCheck: {
      status: item.storyMeta.sourceRequired
        ? item.storyMeta.factCheckStatus === "passed"
          ? "passed"
          : "pending"
        : "not-required",
      sourceIds: item.storyMeta.sourceUrls,
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
