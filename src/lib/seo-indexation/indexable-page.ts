import type { CMSContentKind } from "@/types/content-cms";
import type { ContentStatus } from "@/types/content-workflow";
import type { ContentQualityLevel } from "@/types/content-quality";
import type { ContentPriorityLevel } from "@/types/content-prioritization";

/**
 * Unified input for indexation evaluation across CMS items,
 * programmatic pages, and static routes.
 */
export type IndexablePageInput = {
  id: string;
  kind: CMSContentKind | "static-page" | "taxonomy-page" | "programmatic-page";
  slug: string;
  url: string;
  title: string;
  status: ContentStatus;
  pageType?: string;
  contentType?: string;
  canonicalUrl?: string;
  explicitNoindex?: boolean;
  explicitIndexable?: boolean;
  noindexReason?: string;
  quality: {
    canPublish: boolean;
    shouldNoindex: boolean;
    blockers: string[];
    warnings: string[];
    level: ContentQualityLevel;
  };
  seo: {
    priority?: ContentPriorityLevel;
    cannibalizationRisk?: "high" | "medium" | "low";
    thinContentRisk?: "high" | "medium" | "low";
    targetKeyword?: string;
  };
  workflow: {
    publishedAt?: string;
    updatedAt?: string;
  };
  source?: {
    origin: "manual" | "import" | "ai" | "trend-radar" | "taxonomy" | "programmatic";
  };
};
