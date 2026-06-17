export type EditorialContentType =
  | "editorial-story"
  | "scenario-story"
  | "fictionalized-story"
  | "author-column"
  | "construction-diary"
  | "local-story"
  | "news"
  | "news-analysis"
  | "weekly-digest"
  | "monthly-digest"
  | "question-roundup"
  | "trend-review"
  | "opinion";

export type EditorialRubricType =
  | "stories"
  | "local"
  | "news"
  | "digest"
  | "opinion"
  | "client-scenarios"
  | "construction-life"
  | "mistakes"
  | "future";

export type EditorialRubric = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: EditorialRubricType;
  defaultContentTypes: EditorialContentType[];
  allowedAuthors: string[];
  defaultCTA: string;
  defaultLeadMagnet?: string;
  relatedTechnicalClusters: string[];
  relatedProjectCategories: string[];
  priority: "P1" | "P2" | "P3" | "P4" | "P5";
  indexingPolicy: {
    indexableByDefault: boolean;
    requiresHumanReview: boolean;
    requiresSource?: boolean;
    requiresFictionNotice?: boolean;
  };
};

export type EditorialAuthorType =
  | "real-expert"
  | "editorial-persona"
  | "brand-editorial"
  | "anonymous-editorial";

export type EditorialAuthor = {
  id: string;
  slug: string;
  name: string;
  type: EditorialAuthorType;
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
  allowedContentTypes: EditorialContentType[];
  allowedRubrics: string[];
  teaserStyle?: {
    hookStyle: string;
    preferredOpenLoops: string[];
    avoid: string[];
  };
  status: "active" | "draft" | "disabled";
};

export type EditorialContentStatus =
  | "planned"
  | "draft"
  | "ai-generated"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "noindex"
  | "needs-source"
  | "needs-fact-check"
  | "needs-human-review"
  | "needs-update"
  | "rejected";

export type EditorialContentItem = {
  id: string;
  slug: string;
  url: string;
  type: EditorialContentType;
  rubricId: string;
  authorId: string;
  title: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  targetKeyword?: string;
  secondaryKeywords?: string[];
  status: EditorialContentStatus;
  readTimeMinutes?: number;
  storyMeta: {
    isFictionalized: boolean;
    isBasedOnRealClient: boolean;
    hasClientPermission: boolean;
    isCompositeScenario: boolean;
    fictionNoticeRequired: boolean;
    sourceRequired: boolean;
    sourceUrls?: string[];
    sourceNotes?: string;
    factCheckStatus?: "pending" | "passed" | "failed";
  };
  content: {
    intro: string;
    hook: string;
    storyBody?: string;
    situation?: string;
    conflict?: string;
    turningPoint?: string;
    takeaways?: string[];
    practicalAdvice?: string[];
    localContext?: string;
    newsSummary?: string;
    digestItems?: {
      title: string;
      summary: string;
      sourceUrl?: string;
      sourceLabel?: string;
    }[];
    conclusion: string;
  };
  related: {
    projects: string[];
    projectCategories: string[];
    technicalArticles: string[];
    programmaticPages: string[];
    leadMagnets: string[];
    calculators: string[];
  };
  cta: {
    primary: string;
    secondary?: string;
    sourceCTA: string;
    leadMagnetId?: string;
  };
  faq?: { question: string; answer: string }[];
  blocks: string[];
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
    teaserStyle?: string;
  };
  quality: {
    requiresHumanReview: boolean;
    requiresFactCheck: boolean;
    requiresFictionNotice: boolean;
    hasClearCTA: boolean;
    hasRelatedLinks: boolean;
    fakeClaimRisk: "high" | "medium" | "low";
    thinContentRisk: "high" | "medium" | "low";
    clickbaitRisk: "high" | "medium" | "low";
  };
  createdAt: string;
  updatedAt?: string;
};

export type EditorialContentQueueItem = {
  id: string;
  slug: string;
  type: EditorialContentType;
  rubricId: string;
  authorId: string;
  title: string;
  h1: string;
  targetKeyword?: string;
  status: EditorialContentStatus;
  priority: "P1" | "P2" | "P3" | "P4" | "P5" | "P6";
  isCompositeScenario?: boolean;
  sourceRequired?: boolean;
};

export type EditorialContentQualityScore = {
  score: number;
  level: "poor" | "acceptable" | "good" | "strong";
  warnings: string[];
  blockers: string[];
  canPublish: boolean;
  shouldNoindex: boolean;
  requiresFactCheck: boolean;
  requiresFictionNotice: boolean;
};

export type EditorialLeadContext = {
  pageType: "editorial-content";
  contentSlug: string;
  contentTitle: string;
  contentType: string;
  rubricId: string;
  authorId: string;
  currentUrl: string;
  isFictionalized: boolean;
  isCompositeScenario: boolean;
  sourceCTA: string;
  sourceSection?: string;
  leadMagnetId?: string;
  relatedProjectCategory?: string;
  relatedMaterial?: string;
  relatedRegion?: string;
  relatedTechnicalCluster?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
};

export type EditorialStoryTemplate = {
  id: string;
  type: EditorialContentType;
  title: string;
  description: string;
  requiredBlocks: string[];
  fictionNoticeRequired: boolean;
};

export type EditorialNewsTemplate = {
  id: string;
  type: EditorialContentType;
  title: string;
  requiresSource: boolean;
  requiresFactCheck: boolean;
  requiredBlocks: string[];
};

export type EditorialDigestTemplate = {
  id: string;
  type: EditorialContentType;
  title: string;
  minItems: number;
  maxItems: number;
  requiredBlocks: string[];
};
