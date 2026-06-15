export type ProgrammaticPageType =
  | "project-page"
  | "project-category"
  | "project-size-page"
  | "project-material-page"
  | "project-feature-page"
  | "project-location-page"
  | "technical-how-to"
  | "technical-guide"
  | "opinion-article"
  | "editorial-story"
  | "news-digest"
  | "regulation-update"
  | "comparison-page"
  | "faq-page";

export type ProgrammaticSection =
  | "projects"
  | "technical"
  | "blog"
  | "news"
  | "regulations"
  | "comparisons"
  | "faq";

export type ProgrammaticIntent =
  | "commercial"
  | "informational"
  | "transactional"
  | "comparison"
  | "local"
  | "editorial";

export type ProgrammaticPageStatus =
  | "planned"
  | "draft"
  | "ai-generated"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "noindex"
  | "needs-keyword-data"
  | "needs-update"
  | "rejected";

export type PriorityTier = "P1" | "P2" | "P3" | "P4" | "P5";

export type DemandLevel = "high" | "medium" | "low" | "unknown";

export type RiskLevel = "high" | "medium" | "low";

export type ProgrammaticSEOPage = {
  id: string;
  slug: string;
  url: string;

  pageType: ProgrammaticPageType;
  title: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;

  clusterId: string;
  targetKeyword: string;
  secondaryKeywords?: string[];

  intent: ProgrammaticIntent;
  section: ProgrammaticSection;

  region?: string;
  objectType?: string;
  material?: string;
  size?: string;
  area?: number;
  floors?: number;
  rooms?: number;
  features?: string[];

  authorId?: string;
  isFictionalAuthor?: boolean;
  requiresDisclaimer?: boolean;

  status: ProgrammaticPageStatus;

  indexing: {
    indexable: boolean;
    canonicalUrl?: string;
    noindexReason?: string;
    sitemap: boolean;
  };

  distribution: {
    allowExternalTeasers: boolean;
    teaserRequired: boolean;
    platforms: string[];
    canonicalFullArticleUrl: string;
    utmCampaignId?: string;
  };

  priority: {
    searchDemand: DemandLevel;
    commercialIntent: RiskLevel;
    leadPotential: RiskLevel;
    contentDifficulty: RiskLevel;
    uniquenessRisk: RiskLevel;
    cannibalizationRisk: RiskLevel;
    publishPriority: PriorityTier;
  };

  contentRequirements: {
    minWords?: number;
    requiresFAQ: boolean;
    requiresCTA: boolean;
    requiresLeadMagnet: boolean;
    requiresRelatedProjects: boolean;
    requiresDisclaimer: boolean;
    requiresHumanReview: boolean;
    requiresTeasers: boolean;
  };

  relatedPages?: string[];
  relatedLeadMagnets?: string[];
  relatedProjects?: string[];

  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type EditorialAuthor = {
  id: string;
  name: string;
  slug: string;
  type: "real-expert" | "editorial-persona" | "brand-voice" | "anonymous-editorial";
  isFictional: boolean;
  publicLabel: string;
  role: string;
  bio: string;
  disclaimer?: string;
  toneOfVoice: {
    style: string;
    vocabulary: string[];
    avoid: string[];
    typicalStructure: string[];
  };
  topics: string[];
  allowedPageTypes: string[];
  teaserStyle?: {
    hookStyle: string;
    preferredOpenLoops: string[];
    avoid: string[];
  };
  status: "active" | "draft" | "disabled";
};

export type TeaserStyle =
  | "pain-hook"
  | "mistake-hook"
  | "cost-hook"
  | "checklist-hook"
  | "story-hook"
  | "myth-busting"
  | "question-hook"
  | "local-hook"
  | "case-hook"
  | "digest-hook";

export type ContentTeaserVersion = {
  id: string;
  sourceArticleId: string;
  platformId: string;
  title: string;
  hook: string;
  body: string;
  openLoop: string;
  readMoreCTA: string;
  fullArticleUrl: string;
  utmUrl: string;
  imageId?: string;
  hashtags?: string[];
  teaserStyle: TeaserStyle;
  status: "draft" | "review" | "approved" | "scheduled" | "published" | "failed" | "manual-export";
  validation: {
    hasClearCTA: boolean;
    hasUTM: boolean;
    noFakeClaim: boolean;
    noDeceptiveClickbait: boolean;
    linksToFullArticle: boolean;
  };
};

export type ContentQualityLevel = "poor" | "acceptable" | "good" | "strong";

export type ContentQualityScore = {
  score: number;
  level: ContentQualityLevel;
  warnings: string[];
  blockers: string[];
  canPublish: boolean;
  shouldNoindex: boolean;
  canDistributeExternally: boolean;
};

export type RegionTaxonomyItem = {
  id: string;
  title: string;
  slug: string;
  type:
    | "city"
    | "region"
    | "district"
    | "settlement"
    | "tract"
    | "snt"
    | "cottage-village"
    | "future";
  priority: PriorityTier;
  indexableByDefault: boolean;
  needsKeywordValidation: boolean;
  allowedPageTypes: ProgrammaticPageType[];
  notes?: string;
};

export type ExternalContentPlatform = {
  id: string;
  title: string;
  supportsAutoPublish: boolean;
  supportsImages: boolean;
  supportsScheduling: boolean;
  supportsExternalLinks: boolean;
  contentLengthLimit?: number;
  recommendedLength?: number;
  teaserStyle: TeaserStyle[];
  ctaRules: string[];
  utmSource: string;
  adapterStatus: "active" | "needs-api" | "manual" | "future" | "disabled";
  notes?: string;
};

export type SeoPageTypeDefinition = {
  pageType: ProgrammaticPageType;
  title: string;
  description: string;
  urlPattern: string;
  h1Template: string;
  seoTitleTemplate: string;
  descriptionTemplate: string;
  requiredBlocks: string[];
  recommendedBlocks: string[];
  requiredDisclaimer: boolean;
  indexableByDefault: boolean;
  sitemapAllowed: boolean;
  externalTeasersAllowed: boolean;
  canonicalPolicy: "self" | "parent-cluster" | "manual-review";
};

export type ProgrammaticSeoSectionDefinition = {
  id: ProgrammaticSection;
  title: string;
  description: string;
  primaryIntent: ProgrammaticIntent;
  allowedPageTypes: ProgrammaticPageType[];
  defaultCTA: string;
  defaultLeadMagnet?: string;
  defaultIndexingPolicy: "review-before-index" | "noindex-until-approved" | "never-auto-index";
  qualityRequirements: {
    minWords: number;
    requiresFAQ: boolean;
    requiresHumanReview: boolean;
    requiresDisclaimer?: boolean;
  };
  distributionAllowed: boolean;
};
