export type ContentSourceType =
  | "official"
  | "news"
  | "manual-note"
  | "client-provided"
  | "internal"
  | "competitor"
  | "future-trend-radar";

export type ContentSourceReliability = "high" | "medium" | "low" | "unknown";

export type FactCheckStatus =
  | "not-required"
  | "required"
  | "pending"
  | "passed"
  | "failed"
  | "needs-update";

export type ContentSource = {
  id: string;
  title: string;
  url?: string;
  sourceType: ContentSourceType;
  reliability: ContentSourceReliability;
  usedByContentIds: string[];
  notes?: string;
  createdAt: string;
};

export type ContentSourceStatus =
  | "unverified"
  | "verified"
  | "outdated"
  | "conflicting"
  | "unavailable"
  | "rejected";

export type ContentSourceRecord = {
  id: string;
  contentItemId: string;
  updateBriefId?: string;

  title: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
  accessedAt: string;

  sourceType:
    | "official"
    | "regulation"
    | "manufacturer"
    | "expert"
    | "internal"
    | "research"
    | "media"
    | "other";

  status: ContentSourceStatus;
  supportsClaims: string[];
  notes?: string;
};
