export type TechnicalClusterCategory =
  | "roof"
  | "walls"
  | "floor"
  | "foundation"
  | "insulation"
  | "vapor-barrier"
  | "ventilation"
  | "engineering"
  | "materials"
  | "bathhouse"
  | "frame-house"
  | "timber-house"
  | "gas-concrete"
  | "land-plot"
  | "estimate"
  | "mistakes"
  | "contract"
  | "quality-control"
  | "future";

export type TechnicalClusterIntent =
  | "informational"
  | "how-to"
  | "comparison"
  | "mistakes"
  | "checklist"
  | "cost"
  | "local";

export type TechnicalContentCluster = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: TechnicalClusterCategory;
  primaryIntent: TechnicalClusterIntent;
  relatedProjectCategories: string[];
  relatedLeadMagnets: string[];
  relatedCTAs: string[];
  priority: "P1" | "P2" | "P3" | "P4" | "P5";
  requiresTechnicalReview: boolean;
  requiresDisclaimer: boolean;
};

export type TechnicalArticleType =
  | "how-to"
  | "guide"
  | "checklist"
  | "mistakes"
  | "comparison"
  | "cost-explainer"
  | "process-explainer"
  | "material-explainer"
  | "local-technical-guide"
  | "opinion";

export type TechnicalArticleBlock =
  | "breadcrumbs"
  | "hero"
  | "short-answer"
  | "disclaimer"
  | "where-used"
  | "how-it-works"
  | "how-it-is-usually-done"
  | "materials"
  | "steps"
  | "mistakes"
  | "risks"
  | "when-to-call-expert"
  | "example-situation"
  | "checklist"
  | "cost-factors"
  | "comparison"
  | "related-projects"
  | "related-articles"
  | "lead-magnet"
  | "faq"
  | "final-cta"
  | "schema";

export type TechnicalArticleTemplate = {
  id: string;
  type: TechnicalArticleType;
  title: string;
  description: string;
  requiredBlocks: TechnicalArticleBlock[];
  optionalBlocks: TechnicalArticleBlock[];
  defaultDisclaimerId: string;
  defaultCTA: string;
  defaultLeadMagnet?: string;
  seoRules: {
    indexableByDefault: boolean;
    requiresHumanReview: boolean;
    requiresFAQ: boolean;
    requiresSchema: boolean;
    requiresRelatedLinks: boolean;
    requiresTechnicalDisclaimer: boolean;
  };
  qualityRules: {
    minWords: number;
    mustHaveShortAnswer: boolean;
    mustHaveMistakesBlock: boolean;
    mustHaveExpertBlock: boolean;
    mustAvoidDangerousInstructions: boolean;
  };
};

export type TechnicalArticleStatus =
  | "planned"
  | "draft"
  | "ai-generated"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "noindex"
  | "needs-expert-review"
  | "needs-keyword-data"
  | "needs-update"
  | "rejected";

export type TechnicalArticle = {
  id: string;
  slug: string;
  url: string;
  type: TechnicalArticleType;
  clusterId: string;
  title: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  targetKeyword: string;
  secondaryKeywords?: string[];
  status: TechnicalArticleStatus;
  authorId?: string;
  readTimeMinutes?: number;
  content: {
    shortAnswer: string;
    disclaimerId: string;
    intro: string;
    whereUsed?: string;
    howItWorks?: string;
    howUsuallyDone?: string;
    materials?: string[];
    steps?: string[];
    mistakes?: string[];
    risks?: string[];
    whenToCallExpert?: string[];
    exampleSituation?: string;
    checklist?: string[];
    costFactors?: string[];
    conclusion?: string;
  };
  related: {
    projectCategories: string[];
    projects: string[];
    articles: string[];
    leadMagnets: string[];
    calculators: string[];
    programmaticPages: string[];
  };
  cta: {
    primary: string;
    secondary?: string;
    sourceCTA: string;
    leadMagnetId?: string;
  };
  faq: { question: string; answer: string }[];
  blocks: TechnicalArticleBlock[];
  schema?: Record<string, unknown>[];
  indexing: {
    indexable: boolean;
    canonicalUrl?: string;
    noindexReason?: string;
    sitemap: boolean;
  };
  distribution: {
    teaserReady: boolean;
    allowExternalTeasers: boolean;
    platforms: string[];
    canonicalFullArticleUrl: string;
    utmCampaignId?: string;
  };
  quality: {
    requiresHumanReview: boolean;
    requiresTechnicalReview: boolean;
    hasDisclaimer: boolean;
    hasFAQ: boolean;
    hasCTA: boolean;
    hasRelatedLinks: boolean;
    dangerousInstructionRisk: "high" | "medium" | "low";
    thinContentRisk: "high" | "medium" | "low";
  };
  createdAt: string;
  updatedAt?: string;
};

export type TechnicalContentQueueItem = {
  id: string;
  slug: string;
  clusterId: string;
  type: TechnicalArticleType;
  title: string;
  h1: string;
  targetKeyword: string;
  secondaryKeywords?: string[];
  status: TechnicalArticleStatus;
  priority: "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8";
  authorId?: string;
};

export type TechnicalContentQualityScore = {
  score: number;
  level: "poor" | "acceptable" | "good" | "strong";
  warnings: string[];
  blockers: string[];
  canPublish: boolean;
  shouldNoindex: boolean;
  requiresExpertReview: boolean;
};

export type TechnicalDisclaimer = {
  id: string;
  title: string;
  text: string;
  appliesTo: TechnicalClusterCategory[] | "all";
};

export type TechnicalAuthorType = "editorial-persona" | "brand-voice" | "real-expert";

export type TechnicalAuthor = {
  id: string;
  name: string;
  type: TechnicalAuthorType;
  publicLabel: string;
  role: string;
  style: string[];
  limitations?: string;
  default?: boolean;
};

export type TechnicalLeadContext = {
  pageType: "technical-article";
  articleSlug: string;
  articleTitle: string;
  articleType: string;
  clusterId: string;
  currentUrl: string;
  sourceCTA: string;
  sourceSection?: string;
  leadMagnetId?: string;
  relatedProjectCategory?: string;
  relatedMaterial?: string;
  relatedObjectType?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
};
