import type { ContentPriorityLevel } from "@/types/content-prioritization";

export type CrawlPriorityLevel = "critical" | "high" | "medium" | "low" | "deferred";

export type SitemapSegment =
  | "core"
  | "commercial"
  | "programmatic"
  | "editorial"
  | "technical"
  | "local";

export type CrawlBudgetScore = {
  url: string;
  contentItemId?: string;
  level: CrawlPriorityLevel;
  score: number;
  priority?: ContentPriorityLevel;
  sitemapSegment?: SitemapSegment;
  sitemapPriority?: number;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  factors: {
    contentPriorityScore: number;
    pageTypeWeight: number;
    freshnessScore: number;
    indexationUrgency: number;
    internalLinkDepth: number;
  };
  reasons: string[];
  calculatedAt: string;
};
