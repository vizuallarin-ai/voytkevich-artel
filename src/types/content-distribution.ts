import type { TeaserStyle } from "@/types/programmatic-seo";

export type ExternalPublicationStatus =
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "manual-export"
  | "needs-api"
  | "cancelled"
  | "archived";

export type ExternalContentPlatform = {
  id: string;
  title: string;
  category:
    | "site"
    | "social"
    | "blog-platform"
    | "messenger"
    | "email"
    | "rss"
    | "automation"
    | "manual"
    | "future";
  supportsAutoPublish: boolean;
  supportsImages: boolean;
  supportsScheduling: boolean;
  supportsExternalLinks: boolean;
  supportsUTM: boolean;
  contentLengthLimit?: number;
  recommendedLength?: number;
  allowedContentKinds: string[];
  teaserStyles: TeaserStyle[];
  ctaRules: string[];
  utmSource: string;
  adapterStatus: "active" | "needs-api" | "manual" | "future" | "disabled";
  notes?: string;
};

export type ExternalPublication = {
  id: string;
  contentItemId: string;
  teaserVersionId: string;
  platformId: string;
  status: ExternalPublicationStatus;
  scheduledAt?: string;
  publishedAt?: string;
  publishedUrl?: string;
  error?: {
    code?: string;
    message: string;
    raw?: unknown;
  };
  payload: {
    title: string;
    text: string;
    imageIds?: string[];
    hashtags?: string[];
    fullArticleUrl: string;
    utmUrl: string;
  };
  validation: {
    approved: boolean;
    hasUTM: boolean;
    hasImage?: boolean;
    hasCTA: boolean;
    noFakeClaim: boolean;
    noDeceptiveClickbait: boolean;
    linksToFullArticle: boolean;
    notFullDuplicate: boolean;
    fullArticlePublished: boolean;
  };
  attribution: {
    utmSource: string;
    utmMedium: "content_teaser";
    utmCampaign: string;
    utmContent: string;
    utmTerm?: string;
    contentSlug?: string;
    contentKind?: string;
    clusterId?: string;
    rubricId?: string;
  };
  createdAt: string;
  updatedAt?: string;
};

export type PublicationQueueItem = {
  id: string;
  contentItemId: string;
  contentTitle: string;
  contentKind: string;
  contentUrl: string;
  teaserVersionId: string;
  platformId: string;
  status: ExternalPublicationStatus;
  priority: "P1" | "P2" | "P3" | "P4" | "P5";
  scheduledAt?: string;
  blockers: string[];
  warnings: string[];
  canPublish: boolean;
  requiresManualExport: boolean;
  requiresAPI: boolean;
  requiresReview: boolean;
  createdAt: string;
};

export type PublicationValidationResult = {
  valid: boolean;
  warnings: string[];
  blockers: string[];
  flags: {
    hasUTM: boolean;
    hasCTA: boolean;
    linksToFullArticle: boolean;
    fullArticlePublished: boolean;
    noFakeClaim: boolean;
    noDeceptiveClickbait: boolean;
    notFullDuplicate: boolean;
    platformExists: boolean;
    adapterAvailable: boolean;
    manualExportRequired: boolean;
  };
  canApprove: boolean;
  canSchedule: boolean;
  canPublish: boolean;
  requiresManualExport: boolean;
  requiresAPI: boolean;
};

export type PublishResult = {
  success: boolean;
  publishedUrl?: string;
  externalId?: string;
  error?: {
    code?: string;
    message: string;
    raw?: unknown;
  };
};

export type PlatformAdapter = {
  platformId: string;
  canPublish: boolean;
  canSchedule: boolean;
  requiresManualExport: boolean;
  validate(publication: ExternalPublication): Promise<PublicationValidationResult>;
  publish(publication: ExternalPublication): Promise<PublishResult>;
  schedule?(publication: ExternalPublication): Promise<PublishResult>;
};

export type N8NPublicationPayload = {
  publicationId: string;
  platformId: string;
  contentItemId: string;
  title: string;
  text: string;
  imageUrls?: string[];
  fullArticleUrl: string;
  utmUrl: string;
  hashtags?: string[];
  scheduledAt?: string;
};

export type ContentDistributionAttribution = {
  sourcePlatform?: string;
  campaignId?: string;
  contentItemId?: string;
  teaserId?: string;
  publicationId?: string;
  clusterId?: string;
  rubricId?: string;
  originalArticleUrl?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
};

export type DistributionAuditEntry = {
  id: string;
  publicationId: string;
  event: string;
  message?: string;
  at: string;
};

export type DistributionMetrics = {
  totalDrafts: number;
  approved: number;
  scheduled: number;
  published: number;
  failed: number;
  manualExport: number;
  needsApi: number;
  platformsActive: number;
  platformsManual: number;
  platformsNeedsApi: number;
};
