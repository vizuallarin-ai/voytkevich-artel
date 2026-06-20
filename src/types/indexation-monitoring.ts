import type { ContentPriorityLevel } from "@/types/content-prioritization";

export type SearchEngine = "yandex" | "google" | "bing";

export type IndexationVerificationStatus =
  | "not-checked"
  | "submitted"
  | "discovered"
  | "indexed"
  | "excluded"
  | "blocked-by-robots"
  | "canonical-mismatch"
  | "crawl-error"
  | "unknown";

export type IndexationMonitoringRecord = {
  id: string;
  url: string;
  canonicalUrl?: string;
  searchEngine: SearchEngine;
  status: IndexationVerificationStatus;
  contentItemId?: string;
  priority?: ContentPriorityLevel;
  sitemapIncluded: boolean;
  robotsIndex: boolean;
  lastCheckedAt?: string;
  firstIndexedAt?: string;
  lastCrawledAt?: string;
  coverageIssue?: string;
  notes?: string;
  updatedAt: string;
};
