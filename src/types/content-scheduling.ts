import type { ContentScheduleMode } from "@/types/content-calendar";

export type ContentReadinessStatus = {
  cmsReady: boolean;
  seoReady: boolean;
  visualReady: boolean;
  distributionReady: boolean;
  reviewReady: boolean;
  canSchedule: boolean;
  canPublish: boolean;
  blockers: string[];
  warnings: string[];
  details: {
    status?: string;
    qualityLevel?: string;
    indexable?: boolean;
    hasMetadata?: boolean;
    hasCanonical?: boolean;
    hasCTA?: boolean;
    hasRelatedLinks?: boolean;
    hasCover?: boolean;
    hasOGImage?: boolean;
    hasTeasers?: boolean;
    hasUTM?: boolean;
    requiresFactCheck?: boolean;
    requiresExpertReview?: boolean;
    requiresFictionNotice?: boolean;
  };
};

export type ScheduleValidationResult = {
  valid: boolean;
  warnings: string[];
  blockers: string[];
  flags: {
    readinessPassed: boolean;
    capacityPassed: boolean;
    balancePassed: boolean;
    fullArticleBeforeTeaser: boolean;
    noDraftScheduled: boolean;
    noAIGeneratedScheduled: boolean;
    noMissingVisuals: boolean;
    noMissingUTM: boolean;
  };
  canSchedule: boolean;
};

import type { PublicationType } from "@/types/content-calendar";

export type ScheduleOptions = {
  publicationType?: PublicationType;
  platformId?: string;
  publicationId?: string;
  forceWithWarnings?: boolean;
  priority?: "P1" | "P2" | "P3" | "P4" | "P5";
};

export type SchedulePlan = {
  contentItemId: string;
  fullArticleAt: string;
  teasers?: Array<{ platformId: string; scheduledAt: string; publicationId?: string }>;
};

export type RecommendedDate = {
  date: string;
  time: string;
  score: number;
  reasons: string[];
};

export type ContentCapacityRules = {
  mode: ContentScheduleMode;
  maxSitePublicationsPerDay: number;
  maxExternalPublicationsPerDay: number;
  maxProgrammaticPagesPerDay: number;
  maxTechnicalArticlesPerDay: number;
  maxEditorialItemsPerDay: number;
  maxNewsItemsPerDay: number;
  maxDigestItemsPerWeek: number;
  minHoursBetweenPublications?: number;
  warnings: {
    sitePublicationWarningThreshold: number;
    externalPublicationWarningThreshold: number;
  };
};

export type ContentBalanceRule = {
  id: string;
  title: string;
  description: string;
  period: "day" | "week" | "month";
  limits: {
    contentKind: string;
    min?: number;
    max?: number;
    recommended?: number;
  }[];
  severity: "info" | "warning" | "blocker";
};
