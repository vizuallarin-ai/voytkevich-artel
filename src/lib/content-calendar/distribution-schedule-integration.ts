import type { CMSContentItem } from "@/types/content-cms";
import type { ExternalPublication } from "@/types/content-distribution";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { isFullArticlePublished } from "@/lib/content-distribution/publication-validator";

export async function getDistributionReadinessForSchedule(contentItem: CMSContentItem) {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const publications = (await publicationRepository.list()).filter(
    (p) => p.contentItemId === contentItem.id,
  );

  const hasTeasers = publications.length > 0;
  const hasUTM = publications.some((p) => p.validation.hasUTM);
  const teaserReady = contentItem.distribution.teaserReady;

  if (teaserReady && !hasTeasers) {
    warnings.push("Teaser ready, но нет publication drafts");
  }

  if (hasTeasers && !hasUTM) {
    blockers.push("External teaser без UTM");
  }

  const fullPublished = isFullArticlePublished(contentItem);

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    details: {
      hasTeasers,
      hasUTM,
      fullArticlePublished: fullPublished,
    },
  };
}

export async function getDistributionItemsForCalendar(
  startDate: string,
  endDate: string,
): Promise<ExternalPublication[]> {
  const all = await publicationRepository.list();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return all.filter((p) => {
    const at = p.scheduledAt ?? p.publishedAt ?? p.createdAt;
    const t = new Date(at).getTime();
    return t >= start && t <= end;
  });
}

export async function validateDistributionSchedule(publication: ExternalPublication): Promise<{
  valid: boolean;
  blockers: string[];
  warnings: string[];
}> {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!publication.validation.hasUTM) blockers.push("Нет UTM");
  if (publication.status === "manual-export" && !publication.publishedUrl) {
    warnings.push("Manual export без publishedUrl");
  }

  return { valid: blockers.length === 0, blockers, warnings };
}

export type TeaserSchedulePlan = {
  platformId: string;
  scheduledAt: string;
  delayHours: number;
};

export function scheduleTeaserAfterFullArticle(
  fullArticleAt: string,
  platformId: string,
  delayHours: number,
): TeaserSchedulePlan {
  const at = new Date(fullArticleAt);
  at.setHours(at.getHours() + delayHours);
  return {
    platformId,
    scheduledAt: at.toISOString(),
    delayHours,
  };
}

export function createPublicationPackageSchedule(
  contentItemId: string,
  fullArticleAt: string,
  delayHours: number,
): {
  fullArticleAt: string;
  teasers: TeaserSchedulePlan[];
} {
  const platforms = ["telegram", "vk", "ok"];
  return {
    fullArticleAt,
    teasers: platforms.map((platformId) =>
      scheduleTeaserAfterFullArticle(fullArticleAt, platformId, delayHours),
    ),
  };
}
