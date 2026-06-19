import type { AIContentValidationResult } from "@/types/ai-content-validation";
import type { AIGenerationUsage } from "@/types/ai-generation";

export type AIContentGenerationMode =
  | "content-brief"
  | "programmatic-page-draft"
  | "technical-article-draft"
  | "editorial-content-draft"
  | "news-draft"
  | "digest-draft"
  | "faq-only"
  | "metadata-only"
  | "cta-only"
  | "related-links-only"
  | "teaser-package";

export type AIContentGenerationStatus =
  | "idle"
  | "queued"
  | "generating"
  | "validating"
  | "completed"
  | "failed"
  | "saved-to-cms"
  | "rejected";

export type AIContentGenerationRequest = {
  id: string;
  mode: AIContentGenerationMode;
  source:
    | "manual"
    | "cms-item"
    | "taxonomy"
    | "programmatic-page"
    | "technical-cluster"
    | "editorial-rubric"
    | "future-trend-radar";
  sourceId?: string;
  input: {
    topic: string;
    targetKeyword?: string;
    secondaryKeywords?: string[];
    contentKind?: string;
    pageType?: string;
    clusterId?: string;
    rubricId?: string;
    authorId?: string;
    regionId?: string;
    objectTypeId?: string;
    materialId?: string;
    sizeId?: string;
    sourceUrls?: string[];
    sourceNotes?: string;
    additionalContext?: string;
  };
  constraints: {
    language: "ru";
    region: "irkutsk" | "irkutsk-region" | "general";
    toneOfVoice: string;
    requiresDisclaimer: boolean;
    requiresFactCheck: boolean;
    requiresExpertReview: boolean;
    allowFictionalizedStory: boolean;
    allowExternalTeasers: boolean;
    autoPublish: false;
  };
  createdAt: string;
};

export type AIContentBrief = {
  topic: string;
  targetKeyword?: string;
  secondaryKeywords?: string[];
  contentGoal:
    | "seo-traffic"
    | "lead-generation"
    | "education"
    | "trust-building"
    | "comparison"
    | "local-seo"
    | "teaser-distribution";
  audience: string;
  searchIntent:
    | "commercial"
    | "informational"
    | "transactional"
    | "comparison"
    | "local"
    | "editorial";
  recommendedStructure: {
    blockType: string;
    title: string;
    purpose: string;
  }[];
  requiredBlocks: string[];
  requiredCTA: string;
  requiredLeadMagnet?: string;
  requiredDisclaimers?: string[];
  relatedPages: string[];
  relatedArticles: string[];
  relatedProjects: string[];
  qualityRequirements: string[];
  risksToAvoid: string[];
};

export type AIContentTeaser = {
  id: string;
  platformId:
    | "telegram"
    | "vk"
    | "dzen"
    | "vc"
    | "tenchat"
    | "ok"
    | "email"
    | "rss"
    | "manual-export"
    | "future-platform";
  title: string;
  hook: string;
  body: string;
  openLoop: string;
  readMoreCTA: string;
  fullArticleUrl: string;
  utmUrl: string;
  hashtags?: string[];
  teaserStyle:
    | "pain-hook"
    | "mistake-hook"
    | "cost-hook"
    | "checklist-hook"
    | "story-hook"
    | "myth-busting"
    | "question-hook"
    | "local-hook"
    | "case-hook"
    | "digest-hook"
    | "news-hook";
  validation: {
    hasClearCTA: boolean;
    hasUTM: boolean;
    noFakeClaim: boolean;
    noDeceptiveClickbait: boolean;
    linksToFullArticle: boolean;
  };
};

export type AIContentGenerationOutput = {
  id: string;
  requestId: string;
  status: AIContentGenerationStatus;
  result: {
    title: string;
    h1?: string;
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
    contentKind:
      | "programmatic-page"
      | "technical-article"
      | "editorial-content"
      | "news"
      | "digest"
      | "partial";
    brief?: AIContentBrief;
    article?: {
      intro: string;
      body: string;
      blocks: {
        id: string;
        type: string;
        title?: string;
        content: string;
      }[];
      conclusion?: string;
    };
    faq?: { question: string; answer: string }[];
    cta?: {
      primary: string;
      secondary?: string;
      sourceCTA: string;
    };
    relatedLinks?: {
      title: string;
      url: string;
      relation: string;
      type:
        | "project"
        | "category"
        | "technical"
        | "editorial"
        | "programmatic"
        | "lead-magnet"
        | "calculator";
    }[];
    metadata?: {
      title: string;
      description: string;
      canonicalUrl?: string;
      robots: { index: boolean; follow: boolean };
    };
    teasers?: AIContentTeaser[];
    warnings?: string[];
    notes?: string[];
  };
  validation: AIContentValidationResult;
  cms: {
    canSaveToCMS: boolean;
    savedContentId?: string;
    targetStatus: "ai-generated";
    reviewRequired: true;
  };
  usage?: AIGenerationUsage;
  createdAt: string;
  updatedAt?: string;
};
