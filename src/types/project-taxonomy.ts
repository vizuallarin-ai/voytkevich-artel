import type { PriorityTier } from "@/types/programmatic-seo";

export type TaxonomyObjectCategory =
  | "house"
  | "bathhouse"
  | "cottage"
  | "country-house"
  | "guest-house"
  | "dacha"
  | "utility"
  | "future";

export type TaxonomyMaterialCategory =
  | "wood"
  | "frame"
  | "block"
  | "brick"
  | "combined"
  | "future";

export type TaxonomySizeType =
  | "dimensions"
  | "area-range"
  | "exact-area"
  | "floors"
  | "rooms"
  | "bedrooms";

export type TaxonomyFeatureCategory =
  | "layout"
  | "comfort"
  | "engineering"
  | "exterior"
  | "utility"
  | "lifestyle"
  | "future";

export type TaxonomyIntentType =
  | "project"
  | "build"
  | "turnkey"
  | "price"
  | "cost"
  | "order"
  | "choose"
  | "calculate"
  | "compare"
  | "how-to"
  | "mistakes"
  | "example"
  | "local";

export type TaxonomyCombinationPageType =
  | "project-category"
  | "project-material-page"
  | "project-size-page"
  | "project-feature-page"
  | "project-location-page"
  | "project-combination-page"
  | "filter-only";

export type TaxonomyCombinationStatus =
  | "candidate"
  | "planned"
  | "needs-keyword-data"
  | "needs-project-data"
  | "draft"
  | "approved"
  | "published"
  | "noindex"
  | "filter-only"
  | "rejected";

export type TaxonomyRiskLevel = "high" | "medium" | "low";

export type ProjectObjectType = {
  id: string;
  slug: string;
  title: string;
  pluralTitle: string;
  category: TaxonomyObjectCategory;
  description: string;
  /** URL segment: proekty-{segment} or stroitelstvo-{segment} */
  urlSegment: string;
  defaultIntent: "commercial" | "transactional" | "informational" | "local" | "comparison";
  allowedMaterials: string[];
  allowedSizes: string[];
  allowedFeatures: string[];
  allowedPageTypes: TaxonomyCombinationPageType[];
  indexableByDefault: boolean;
  requiresRealProjects: boolean;
  requiresKeywordValidation: boolean;
  priority: PriorityTier;
  status?: "active" | "future";
  notes?: string;
};

export type ProjectMaterial = {
  id: string;
  slug: string;
  title: string;
  category: TaxonomyMaterialCategory;
  description: string;
  applicableObjectTypes: string[];
  seoSynonyms: string[];
  userSynonyms: string[];
  commercialIntent: "high" | "medium" | "low";
  contentDifficulty: "high" | "medium" | "low";
  indexableByDefault: boolean;
  requiresDisclaimer?: boolean;
  requiresTechnicalReview?: boolean;
  status?: "active" | "future";
  notes?: string;
};

export type ProjectSize = {
  id: string;
  slug: string;
  title: string;
  type: TaxonomySizeType;
  dimensions?: { width: number; length: number; unit: "m" };
  area?: { min?: number; max?: number; exact?: number; unit: "m2" };
  floors?: number;
  rooms?: number;
  bedrooms?: number;
  applicableObjectTypes: string[];
  indexableByDefault: boolean;
  needsKeywordValidation: boolean;
  priority: PriorityTier;
  notes?: string;
  catalogCategorySlug?: string;
};

export type ProjectFeature = {
  id: string;
  slug: string;
  title: string;
  category: TaxonomyFeatureCategory;
  description: string;
  applicableObjectTypes: string[];
  indexableByDefault: boolean;
  needsKeywordValidation: boolean;
  /** Если true — только фильтр каталога, не отдельная SEO-страница */
  filterOnly?: boolean;
  priority: PriorityTier;
  notes?: string;
  catalogCategorySlug?: string;
};

export type ProjectSearchIntent = {
  id: string;
  slug: string;
  title: string;
  type: TaxonomyIntentType;
  funnelStage: "cold" | "warm" | "hot";
  commercialIntent: "high" | "medium" | "low";
  defaultCTA: string;
  defaultLeadMagnet?: string;
  allowedPageTypes: TaxonomyCombinationPageType[];
  notes?: string;
};

export type TaxonomyCombinationLevel = 1 | 2 | 3 | 4;

export type TaxonomyMatrixRule = {
  id: string;
  level: TaxonomyCombinationLevel;
  dimensions: Array<
    "objectType" | "material" | "size" | "feature" | "region" | "intent"
  >;
  pageType: TaxonomyCombinationPageType;
  defaultStatus: TaxonomyCombinationStatus;
  allowIndexable: boolean;
  description: string;
};

export type TaxonomyPageRule = {
  id: string;
  rule:
    | "indexable"
    | "noindex"
    | "canonical"
    | "filter-only"
    | "needs-keyword-data"
    | "needs-project-data"
    | "needs-human-review";
  condition: string;
  action: string;
};

export type TaxonomyCombination = {
  id: string;
  level: TaxonomyCombinationLevel;
  objectTypeId?: string;
  materialId?: string;
  sizeId?: string;
  featureId?: string;
  regionId?: string;
  intentId?: string;
  pageType: TaxonomyCombinationPageType;
  slug: string;
  url: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  status: TaxonomyCombinationStatus;
  indexing: {
    indexable: boolean;
    canonicalUrl?: string;
    noindexReason?: string;
    sitemap: boolean;
  };
  priority: {
    publishPriority: PriorityTier;
    reason: string;
  };
  requirements: {
    requiresRealProjects: boolean;
    minProjectsCount?: number;
    requiresUniqueIntro: boolean;
    requiresFAQ: boolean;
    requiresCTA: boolean;
    requiresLeadMagnet: boolean;
    requiresHumanReview: boolean;
  };
  risks: {
    thinContentRisk: TaxonomyRiskLevel;
    cannibalizationRisk: TaxonomyRiskLevel;
    duplicateRisk: TaxonomyRiskLevel;
  };
  relatedCombinations?: string[];
  catalogCategorySlug?: string;
  notes?: string;
};

export type TaxonomyValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type TaxonomyStats = {
  total: number;
  byStatus: Record<string, number>;
  indexable: number;
  filterOnly: number;
  needsKeywordData: number;
  byLevel: Record<number, number>;
  byPriority: Record<string, number>;
};
