import type { ContentStatus } from "@/types/content-workflow";
import type { ContentQualityLevel } from "@/types/content-quality";
import type { FactCheckStatus } from "@/types/content-source";

export type CMSContentKind =
  | "programmatic-page"
  | "technical-article"
  | "editorial-content"
  | "news"
  | "digest"
  | "landing-page"
  | "lead-magnet"
  | "future-ai-draft";

export type CMSContentItem = {
  id: string;
  kind: CMSContentKind;
  slug: string;
  url: string;
  title: string;
  h1?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: ContentStatus;
  contentType?: string;
  clusterId?: string;
  rubricId?: string;
  authorId?: string;
  source: {
    origin: "manual" | "import" | "ai" | "trend-radar" | "taxonomy" | "programmatic";
    originId?: string;
    createdBy?: string;
  };
  indexing: {
    indexable: boolean;
    canonicalUrl?: string;
    noindexReason?: string;
    sitemap: boolean;
    robots: { index: boolean; follow: boolean };
  };
  quality: {
    score: number;
    level: ContentQualityLevel;
    warnings: string[];
    blockers: string[];
    canPublish: boolean;
    shouldNoindex: boolean;
    requiresHumanReview: boolean;
    requiresExpertReview?: boolean;
    requiresFactCheck?: boolean;
    requiresSource?: boolean;
    requiresFictionNotice?: boolean;
  };
  workflow: {
    assignedTo?: string;
    reviewedBy?: string;
    approvedBy?: string;
    rejectedBy?: string;
    scheduledAt?: string;
    publishedAt?: string;
    updatedAt?: string;
    reviewNotes?: string;
    rejectionReason?: string;
  };
  seo: {
    targetKeyword?: string;
    secondaryKeywords?: string[];
    searchDemand?: "high" | "medium" | "low" | "unknown";
    priority?: "P1" | "P2" | "P3" | "P4" | "P5";
    cannibalizationRisk?: "high" | "medium" | "low";
    thinContentRisk?: "high" | "medium" | "low";
  };
  distribution: {
    teaserReady: boolean;
    allowExternalTeasers: boolean;
    platforms: string[];
    canonicalFullArticleUrl?: string;
    utmCampaignId?: string;
  };
  related: {
    projects?: string[];
    projectCategories?: string[];
    technicalArticles?: string[];
    editorialContent?: string[];
    programmaticPages?: string[];
    leadMagnets?: string[];
  };
  ethics?: {
    isFictionalized?: boolean;
    fictionNoticeRequired?: boolean;
    fictionNoticePresent?: boolean;
    fakeClaimRisk?: "high" | "medium" | "low";
    authorIsFictional?: boolean;
  };
  factCheck?: {
    status: FactCheckStatus;
    sourceIds?: string[];
  };
  createdAt: string;
  updatedAt?: string;
};

export type ContentFilters = {
  kind?: CMSContentKind[];
  status?: ContentStatus[];
  qualityLevel?: ContentQualityLevel[];
  priority?: ("P1" | "P2" | "P3" | "P4" | "P5")[];
  indexable?: boolean;
  sitemap?: boolean;
  requiresHumanReview?: boolean;
  requiresExpertReview?: boolean;
  requiresFactCheck?: boolean;
  requiresSource?: boolean;
  requiresFictionNotice?: boolean;
  teaserReady?: boolean;
  authorId?: string;
  rubricId?: string;
  clusterId?: string;
  search?: string;
  hasBlockers?: boolean;
  hasWarnings?: boolean;
};
