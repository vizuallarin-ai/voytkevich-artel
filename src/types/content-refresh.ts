export type ContentRefreshReason =
  | "content-decay"
  | "search-decline"
  | "ctr-decline"
  | "conversion-decline"
  | "outdated-information"
  | "missing-expertise"
  | "weak-search-intent-match"
  | "thin-content"
  | "cannibalization"
  | "broken-internal-links"
  | "weak-internal-linking"
  | "metadata-opportunity"
  | "high-impressions-low-ctr"
  | "high-traffic-low-conversion"
  | "priority-underperformance"
  | "new-semantic-opportunity"
  | "seasonal-refresh"
  | "technical-seo-issue"
  | "visual-outdated"
  | "manual-request";

export type ContentRefreshStatus =
  | "detected"
  | "needs-diagnosis"
  | "ready-for-brief"
  | "brief-created"
  | "drafting"
  | "source-review"
  | "expert-review"
  | "editorial-review"
  | "seo-review"
  | "approved"
  | "scheduled"
  | "published"
  | "monitoring"
  | "completed"
  | "rejected"
  | "cancelled"
  | "rolled-back";

export type ContentRefreshCandidate = {
  id: string;
  contentItemId: string;
  url: string;

  reasons: ContentRefreshReason[];
  status: ContentRefreshStatus;

  priority: {
    score: number;
    level: "critical" | "high" | "medium" | "low";
    confidence: "low" | "medium" | "high";
  };

  evidence: {
    metric: string;
    currentValue?: number | null;
    previousValue?: number | null;
    changePercent?: number | null;
    source: string;
    period?: {
      from: string;
      to: string;
    };
  }[];

  risks: string[];
  blockers: string[];

  recommendedAction: string;
  detectedAt: string;
  updatedAt?: string;
};
