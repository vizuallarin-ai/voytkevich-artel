export type SeoPriority = "high" | "medium" | "low";

export type SearchIntent =
  | "commercial"
  | "informational"
  | "comparison"
  | "local"
  | "transactional";

export type FunnelStage = "cold" | "warm" | "hot";

export type SeoPageType =
  | "service"
  | "category"
  | "article"
  | "case"
  | "calculator"
  | "planner"
  | "project"
  | "home"
  | "about"
  | "process"
  | "faq"
  | "catalog";

export type SeoPageStatus =
  | "exists"
  | "created"
  | "missing"
  | "needs-content"
  | "needs-expansion"
  | "future"
  | "future-after-cases"
  | "noindex"
  | "avoid"
  | "planned"
  | "draft"
  | "published"
  | "needs-update";

export type SeoCluster = {
  clusterId: string;
  title: string;
  description: string;
  businessGoal: string;
  searchIntent: SearchIntent[];
  funnelStage: FunnelStage[];
  priority: SeoPriority;
  primaryPage: string;
  supportingPages: string[];
  relatedPages?: string[];
  futurePages?: string[];
  targetQueries: string[];
  pageTypes: SeoPageType[];
  internalLinksFrom: SeoPageType[];
  internalLinksTo: SeoPageType[];
  conversionCTA: string;
  conversionPath: string;
  status: SeoPageStatus;
  notes?: string;
};

export type InternalLinkTargetRule = {
  targetType: SeoPageType | "service-page" | "blog-article" | "catalog-category";
  condition: "sameCluster" | "always" | "relatedCluster" | "conversion";
  maxLinks?: number;
  anchorGroup?: string;
};

export type InternalLinkRule = {
  sourceType: SeoPageType | "service-page" | "blog-article" | "catalog-category" | "project-page" | "case-page";
  targets: InternalLinkTargetRule[];
  requiredTargets?: string[];
};

export type AnchorGroup = {
  id: string;
  label: string;
  anchors: string[];
};

export type ContentRoadmapItem = {
  id: string;
  title: string;
  url: string;
  clusterId: string;
  pageType: "article" | "service" | "category" | "case" | "guide";
  intent: SearchIntent;
  priority: SeoPriority;
  funnelStage: FunnelStage;
  queue: 1 | 2 | 3;
  primaryCTA: string;
  relatedPages: string[];
  status: "missing" | "planned" | "draft" | "published" | "needs-update" | "exists" | "future-after-cases";
  businessValue: string;
  notes?: string;
};

export type PageMapEntry = {
  url: string;
  pageType: SeoPageType;
  clusterId: string;
  intent: SearchIntent[];
  priority: SeoPriority;
  status: SeoPageStatus;
  primaryCTA: string;
  notes?: string;
};

export type CannibalizationRisk = {
  topic: string;
  primaryPage: string;
  supportingPages: string[];
  risk: "high" | "medium" | "low";
  solution: string;
};
