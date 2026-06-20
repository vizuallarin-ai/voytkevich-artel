import type { ContentPriorityLevel } from "@/types/content-prioritization";

export type IndexabilityStatus = "indexable" | "noindex" | "blocked" | "pending";

export type IndexabilityReason =
  | "published-ok"
  | "approved-awaiting-publish"
  | "status-idea"
  | "status-planned"
  | "status-draft"
  | "status-ai-generated"
  | "status-review"
  | "status-noindex"
  | "status-archived"
  | "status-rejected"
  | "status-needs-keyword-data"
  | "status-needs-source"
  | "status-needs-fact-check"
  | "status-needs-expert-review"
  | "status-needs-project-data"
  | "status-needs-update"
  | "quality-blocker"
  | "quality-noindex-flag"
  | "quality-poor"
  | "missing-metadata"
  | "missing-canonical"
  | "canonical-conflict"
  | "cannibalization-high"
  | "cannibalization-medium"
  | "thin-content-high"
  | "thin-content-medium"
  | "page-type-noindex-default"
  | "region-keyword-validation"
  | "manual-noindex"
  | "priority-deferred"
  | "fiction-notice-missing"
  | "fact-check-failed"
  | "unknown";

export type IndexabilityDecision = {
  status: IndexabilityStatus;
  indexable: boolean;
  sitemap: boolean;
  reasons: IndexabilityReason[];
  primaryReason?: IndexabilityReason;
  message: string;
  canonicalUrl?: string;
  robots: {
    index: boolean;
    follow: boolean;
  };
  warnings: string[];
  blockers: string[];
  priorityLevel?: ContentPriorityLevel;
  evaluatedAt: string;
};
