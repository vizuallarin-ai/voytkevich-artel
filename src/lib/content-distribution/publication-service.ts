import type { CMSContentItem } from "@/types/content-cms";
import type { ContentTeaserVersion } from "@/types/programmatic-seo";
import type { ExternalPublication } from "@/types/content-distribution";
import { getExternalPlatform } from "@/data/external-content-platforms";
import { buildContentUTMUrl, stripUtmFromUrl } from "@/lib/content-distribution/utm-builder";
import { validatePublication, isFullArticlePublished } from "@/lib/content-distribution/publication-validator";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";
import { getAdapterForPlatform } from "@/lib/content-distribution/platform-adapters";
import {
  markManualPublicationAsPublished,
  markPublicationAsManualExport,
} from "@/lib/content-distribution/manual-export";
import { logDistributionEvent } from "@/lib/content-distribution/distribution-audit-log";
import {
  trackPublicationApproved,
  trackPublicationCancelled,
  trackPublicationDraftCreated,
  trackPublicationFailed,
  trackPublicationMarkedPublishedManually,
  trackPublicationPublishStarted,
  trackPublicationPublished,
  trackPublicationScheduled,
  trackPublicationValidated,
} from "@/lib/content-distribution/publication-analytics";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { SITE_URL } from "@/lib/seo";

export type CreatePublicationInput = {
  contentItem: CMSContentItem;
  teaser: Pick<
    ContentTeaserVersion,
    | "id"
    | "title"
    | "hook"
    | "body"
    | "openLoop"
    | "readMoreCTA"
    | "fullArticleUrl"
    | "utmUrl"
    | "hashtags"
    | "validation"
  >;
  platformId: string;
};

function buildTeaserText(teaser: CreatePublicationInput["teaser"]): string {
  return [teaser.hook, teaser.body, teaser.openLoop, teaser.readMoreCTA].filter(Boolean).join("\n\n");
}

export async function createPublicationDraft(
  input: CreatePublicationInput,
): Promise<ExternalPublication> {
  const { contentItem, teaser, platformId } = input;
  const platform = getExternalPlatform(platformId);
  if (!platform) throw new Error(`Unknown platform: ${platformId}`);
  if (platformId === "site-full-article") {
    throw new Error("site-full-article — не внешняя публикация");
  }

  const fullArticleUrl = stripUtmFromUrl(
    contentItem.distribution.canonicalFullArticleUrl ??
      contentItem.indexing.canonicalUrl ??
      `${SITE_URL}${contentItem.url}`,
  );

  const utmUrl =
    teaser.utmUrl ||
    buildContentUTMUrl({
      baseUrl: fullArticleUrl,
      platformId,
      campaignId: contentItem.distribution.utmCampaignId ?? contentItem.clusterId ?? contentItem.slug,
      contentItemId: contentItem.id,
      clusterId: contentItem.clusterId,
      rubricId: contentItem.rubricId,
      teaserId: teaser.id,
    });

  const published = isFullArticlePublished(contentItem);

  const publication: ExternalPublication = {
    id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    contentItemId: contentItem.id,
    teaserVersionId: teaser.id,
    platformId,
    status: "draft",
    payload: {
      title: teaser.title || contentItem.title,
      text: buildTeaserText(teaser),
      hashtags: teaser.hashtags,
      fullArticleUrl,
      utmUrl,
    },
    validation: {
      approved: false,
      hasUTM: utmUrl.includes("utm_medium=content_teaser"),
      hasCTA: teaser.validation.hasClearCTA,
      noFakeClaim: teaser.validation.noFakeClaim,
      noDeceptiveClickbait: teaser.validation.noDeceptiveClickbait,
      linksToFullArticle: teaser.validation.linksToFullArticle,
      notFullDuplicate: true,
      fullArticlePublished: published,
    },
    attribution: {
      utmSource: platform.utmSource,
      utmMedium: "content_teaser",
      utmCampaign: contentItem.distribution.utmCampaignId ?? contentItem.clusterId ?? contentItem.slug,
      utmContent: teaser.id,
      utmTerm: contentItem.clusterId ?? contentItem.rubricId,
      contentSlug: contentItem.slug,
      contentKind: contentItem.kind,
      clusterId: contentItem.clusterId,
      rubricId: contentItem.rubricId,
    },
    createdAt: new Date().toISOString(),
  };

  await publicationRepository.save(publication);
  logDistributionEvent(publication.id, "draft_created");
  trackPublicationDraftCreated({
    publicationId: publication.id,
    contentItemId: contentItem.id,
    platformId,
    teaserId: teaser.id,
  });
  return publication;
}

export async function validatePublicationById(publicationId: string) {
  const publication = await publicationRepository.getById(publicationId);
  if (!publication) throw new Error("Publication not found");
  const content = await contentRepository.getContentById(publication.contentItemId);
  const result = validatePublication(publication, content);
  trackPublicationValidated({
    publicationId,
    blockersCount: result.blockers.length,
    warningsCount: result.warnings.length,
  });
  return { publication, validation: result };
}

export async function approvePublication(publicationId: string) {
  const { publication, validation } = await validatePublicationById(publicationId);
  if (!validation.canApprove) {
    throw new Error(validation.blockers.join("; ") || "Cannot approve");
  }
  const updated: ExternalPublication = {
    ...publication,
    status: "approved",
    validation: { ...publication.validation, approved: true },
    updatedAt: new Date().toISOString(),
  };
  await publicationRepository.save(updated);
  logDistributionEvent(publicationId, "approved");
  trackPublicationApproved({ publicationId, platformId: publication.platformId });
  return updated;
}

export async function schedulePublication(publicationId: string, scheduledAt: string) {
  const pub = await publicationRepository.getById(publicationId);
  if (!pub) throw new Error("Publication not found");
  if (pub.status !== "approved" && pub.status !== "scheduled") {
    throw new Error("Только approved можно планировать");
  }
  const updated: ExternalPublication = {
    ...pub,
    status: "scheduled",
    scheduledAt,
    updatedAt: new Date().toISOString(),
  };
  await publicationRepository.save(updated);
  logDistributionEvent(publicationId, "scheduled", scheduledAt);
  trackPublicationScheduled({ publicationId, scheduledAt });
  return updated;
}

export async function publishPublication(publicationId: string) {
  const pub = await publicationRepository.getById(publicationId);
  if (!pub) throw new Error("Publication not found");

  const content = await contentRepository.getContentById(pub.contentItemId);
  const validation = validatePublication(pub, content);
  if (!validation.canPublish) {
    if (validation.requiresManualExport) {
      return markPublicationAsManualExportById(publicationId);
    }
    throw new Error(validation.blockers.join("; ") || "Cannot publish");
  }

  const adapter = getAdapterForPlatform(pub.platformId);
  if (!adapter.canPublish) {
    return markPublicationAsManualExportById(publicationId);
  }

  const publishing: ExternalPublication = {
    ...pub,
    status: "publishing",
    updatedAt: new Date().toISOString(),
  };
  await publicationRepository.save(publishing);
  trackPublicationPublishStarted({ publicationId, platformId: pub.platformId });

  const result = await adapter.publish(pub);
  if (!result.success) {
    const failed: ExternalPublication = {
      ...publishing,
      status: "failed",
      error: result.error,
      updatedAt: new Date().toISOString(),
    };
    await publicationRepository.save(failed);
    logDistributionEvent(publicationId, "failed", result.error?.message);
    trackPublicationFailed({ publicationId, errorCode: result.error?.code });
    return failed;
  }

  const published: ExternalPublication = {
    ...publishing,
    status: "published",
    publishedAt: new Date().toISOString(),
    publishedUrl: result.publishedUrl,
    updatedAt: new Date().toISOString(),
  };
  await publicationRepository.save(published);
  logDistributionEvent(publicationId, "published", result.publishedUrl);
  trackPublicationPublished({ publicationId, platformId: pub.platformId });
  return published;
}

export async function markPublicationAsManualExportById(publicationId: string) {
  const pub = await publicationRepository.getById(publicationId);
  if (!pub) throw new Error("Publication not found");
  const updated = markPublicationAsManualExport(pub);
  await publicationRepository.save(updated);
  logDistributionEvent(publicationId, "manual_export");
  return updated;
}

export async function markManualPublicationAsPublishedById(
  publicationId: string,
  publishedUrl: string,
) {
  const pub = await publicationRepository.getById(publicationId);
  if (!pub) throw new Error("Publication not found");
  const updated = markManualPublicationAsPublished(pub, publishedUrl);
  await publicationRepository.save(updated);
  logDistributionEvent(publicationId, "marked_published_manually", publishedUrl);
  trackPublicationMarkedPublishedManually({ publicationId, publishedUrl });
  return updated;
}

export async function cancelPublication(publicationId: string) {
  const pub = await publicationRepository.getById(publicationId);
  if (!pub) throw new Error("Publication not found");
  const updated: ExternalPublication = {
    ...pub,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  };
  await publicationRepository.save(updated);
  logDistributionEvent(publicationId, "cancelled");
  trackPublicationCancelled({ publicationId });
  return updated;
}

export async function retryFailedPublication(publicationId: string) {
  const pub = await publicationRepository.getById(publicationId);
  if (!pub) throw new Error("Publication not found");
  if (pub.status !== "failed") throw new Error("Retry только для failed");
  const reset: ExternalPublication = {
    ...pub,
    status: "approved",
    error: undefined,
    updatedAt: new Date().toISOString(),
  };
  await publicationRepository.save(reset);
  return publishPublication(publicationId);
}

export async function sendPublicationToReview(publicationId: string) {
  const pub = await publicationRepository.getById(publicationId);
  if (!pub) throw new Error("Publication not found");
  const updated: ExternalPublication = { ...pub, status: "review", updatedAt: new Date().toISOString() };
  await publicationRepository.save(updated);
  logDistributionEvent(publicationId, "sent_to_review");
  return updated;
}
