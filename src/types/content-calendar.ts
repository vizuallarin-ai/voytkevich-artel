import type { ContentReadinessStatus } from "@/types/content-scheduling";

export type ContentCalendarView =
  | "day"
  | "week"
  | "month"
  | "queue"
  | "platform"
  | "content-kind";

export type ContentScheduleMode = "cautious" | "working" | "aggressive" | "manual";

export type CalendarItemStatus =
  | "unscheduled"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "cancelled"
  | "rescheduled";

export type PublicationType =
  | "site-full-article"
  | "external-teaser"
  | "rss"
  | "email"
  | "manual-export"
  | "future";

export type ContentCalendarItem = {
  id: string;
  contentItemId: string;
  contentTitle: string;
  contentKind: string;
  contentUrl?: string;
  status: CalendarItemStatus;
  scheduledAt: string;
  publishedAt?: string;
  publicationType: PublicationType;
  platformId?: string;
  publicationId?: string;
  priority: "P1" | "P2" | "P3" | "P4" | "P5";
  readiness: ContentReadinessStatus;
  warnings: string[];
  blockers: string[];
  createdAt: string;
  updatedAt?: string;
};

export type PublicationSlotStatus =
  | "empty"
  | "reserved"
  | "scheduled"
  | "published"
  | "failed"
  | "cancelled";

export type PublicationSlot = {
  id: string;
  date: string;
  time: string;
  publicationType: Exclude<PublicationType, "future">;
  platformId?: string;
  status: PublicationSlotStatus;
  contentItemId?: string;
  publicationId?: string;
  recommendedContentKinds: string[];
  blockedContentKinds?: string[];
  capacityUsed: boolean;
  createdAt: string;
};

export type ContentCalendarMetrics = {
  totalScheduled: number;
  totalPublished: number;
  unscheduledApproved: number;
  todaySiteCount: number;
  todayExternalCount: number;
  capacityWarning: boolean;
  balanceWarnings: number;
  blockersCount: number;
};

export type CalendarSettings = {
  mode: ContentScheduleMode;
  timezone: string;
  maxSitePublicationsPerDay: number;
  maxExternalPublicationsPerDay: number;
  allowedPublicationDays: number[];
  preferredPublicationHours: number[];
  aggressiveModeConfirmed: boolean;
  manualApprovalRequired: boolean;
  externalTeaserDelayHours: number;
  defaultPlatforms: string[];
};
