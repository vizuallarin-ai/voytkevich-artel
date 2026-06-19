import type { CMSContentItem } from "@/types/content-cms";
import type { ContentReadinessStatus } from "@/types/content-scheduling";
import { validateBeforeScheduling } from "@/lib/content-cms/content-workflow";
import { validateContentItem } from "@/lib/content-cms/content-validation";
import { contentScheduleRules } from "@/data/content-schedule-rules";
import { getVisualReadinessForSchedule } from "@/lib/content-calendar/visual-readiness-integration";
import { getDistributionReadinessForSchedule } from "@/lib/content-calendar/distribution-schedule-integration";

export async function getReviewReadiness(item: CMSContentItem): Promise<{
  ready: boolean;
  blockers: string[];
  warnings: string[];
}> {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (contentScheduleRules.blockedStatuses.includes(item.status as (typeof contentScheduleRules.blockedStatuses)[number])) {
    blockers.push(`Статус ${item.status} не допускает планирование`);
  }

  if (item.status === "ai-generated") {
    blockers.push("AI-generated требует review перед планированием");
  }

  if (item.quality.requiresExpertReview && item.status !== "approved" && item.status !== "scheduled") {
    blockers.push("Требуется expert review");
  }

  if (item.quality.requiresFactCheck && item.factCheck?.status !== "passed") {
    blockers.push("Требуется fact-check");
  }

  if (item.quality.requiresSource && !item.factCheck?.sourceIds?.length) {
    blockers.push("Требуется source");
  }

  if (item.ethics?.fictionNoticeRequired && !item.ethics?.fictionNoticePresent) {
    blockers.push("Требуется fiction notice");
  }

  if (item.kind === "news" && !item.factCheck?.sourceIds?.length) {
    blockers.push("News без source");
  }

  const sched = validateBeforeScheduling(item);
  if (!sched.ok) blockers.push(...sched.reasons);

  return { ready: blockers.length === 0, blockers, warnings };
}

export function getSEOReadiness(item: CMSContentItem): {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  details: ContentReadinessStatus["details"];
} {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const hasMetadata = Boolean(item.seoTitle || item.title) && Boolean(item.seoDescription);
  const hasCanonical = Boolean(item.indexing.canonicalUrl || item.url);
  const hasCTA = item.quality.level !== "poor";
  const hasRelatedLinks =
    Boolean(item.related?.technicalArticles?.length) ||
    Boolean(item.related?.programmaticPages?.length) ||
    Boolean(item.related?.editorialContent?.length) ||
    item.kind === "programmatic-page";

  if (!hasMetadata) blockers.push("Нет SEO metadata");
  if (!hasCanonical && item.indexing.indexable) warnings.push("Нет canonical URL");
  if (!hasCTA) warnings.push("Слабый CTA / quality");
  if (!hasRelatedLinks) warnings.push("Нет related links");

  if (item.indexing.indexable && item.quality.shouldNoindex) {
    warnings.push("Конфликт indexable и shouldNoindex");
  }

  const validation = validateContentItem(item);
  blockers.push(...validation.errors);

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    details: {
      hasMetadata,
      hasCanonical,
      hasCTA,
      hasRelatedLinks,
      indexable: item.indexing.indexable,
      qualityLevel: item.quality.level,
    },
  };
}

export async function getVisualReadiness(item: CMSContentItem) {
  return getVisualReadinessForSchedule(item);
}

export async function getDistributionReadiness(item: CMSContentItem) {
  return getDistributionReadinessForSchedule(item);
}

export async function getContentReadiness(contentItem: CMSContentItem): Promise<ContentReadinessStatus> {
  const review = await getReviewReadiness(contentItem);
  const seo = getSEOReadiness(contentItem);
  const visual = await getVisualReadiness(contentItem);
  const distribution = await getDistributionReadiness(contentItem);

  const cmsReady =
    contentScheduleRules.schedulableStatuses.includes(
      contentItem.status as (typeof contentScheduleRules.schedulableStatuses)[number],
    ) && review.ready;

  const blockers = [
    ...review.blockers,
    ...seo.blockers,
    ...visual.blockers,
    ...distribution.blockers,
  ];
  const warnings = [
    ...review.warnings,
    ...seo.warnings,
    ...visual.warnings,
    ...distribution.warnings,
  ];

  const canSchedule = cmsReady && seo.ready && visual.ready && blockers.length === 0;
  const canPublish =
    canSchedule &&
    contentItem.quality.canPublish &&
    !contentItem.quality.blockers.length;

  return {
    cmsReady,
    seoReady: seo.ready,
    visualReady: visual.ready,
    distributionReady: distribution.ready,
    reviewReady: review.ready,
    canSchedule,
    canPublish,
    blockers,
    warnings,
    details: {
      status: contentItem.status,
      qualityLevel: contentItem.quality.level,
      indexable: contentItem.indexing.indexable,
      hasMetadata: seo.details.hasMetadata,
      hasCanonical: seo.details.hasCanonical,
      hasCTA: seo.details.hasCTA,
      hasRelatedLinks: seo.details.hasRelatedLinks,
      hasCover: visual.details.hasCover,
      hasOGImage: visual.details.hasOGImage,
      hasTeasers: distribution.details.hasTeasers,
      hasUTM: distribution.details.hasUTM,
      requiresFactCheck: contentItem.quality.requiresFactCheck,
      requiresExpertReview: contentItem.quality.requiresExpertReview,
      requiresFictionNotice: contentItem.ethics?.fictionNoticeRequired,
    },
  };
}

export function explainReadinessBlockers(contentItem: CMSContentItem, readiness: ContentReadinessStatus): string[] {
  const explanations: string[] = [...readiness.blockers];
  if (!readiness.cmsReady) explanations.push(`CMS: статус ${contentItem.status}`);
  if (!readiness.seoReady) explanations.push("SEO: metadata/canonical/validation");
  if (!readiness.visualReady) explanations.push("Visual: cover/OG/alt");
  if (!readiness.distributionReady) explanations.push("Distribution: teaser/UTM");
  return explanations;
}
