export type ProgrammaticPageTemplateType =
  | "object-category"
  | "material-page"
  | "size-page"
  | "area-page"
  | "floors-page"
  | "feature-page"
  | "location-page"
  | "combination-page";

export type ProgrammaticPageBlock =
  | "breadcrumbs"
  | "hero"
  | "project-grid"
  | "filters"
  | "intro"
  | "cost-factors"
  | "who-it-fits"
  | "how-to-choose"
  | "cta"
  | "lead-magnet"
  | "related-pages"
  | "related-articles"
  | "faq"
  | "seo-text"
  | "final-form"
  | "schema";

export type ProgrammaticPageTemplate = {
  id: string;
  title: string;
  type: ProgrammaticPageTemplateType;
  description: string;
  allowedPageTypes: string[];
  requiredBlocks: ProgrammaticPageBlock[];
  optionalBlocks: ProgrammaticPageBlock[];
  defaultCTA: {
    primary: string;
    secondary?: string;
  };
  defaultLeadMagnet?: string;
  projectMatchingRules: {
    objectTypeRequired?: boolean;
    materialRequired?: boolean;
    sizeRequired?: boolean;
    regionRequired?: boolean;
    featureRequired?: boolean;
    minProjectsCount?: number;
    fallbackStrategy: "show-related" | "show-broader-category" | "show-empty-state" | "noindex";
  };
  seoRules: {
    indexableByDefault: boolean;
    requiresUniqueIntro: boolean;
    requiresFAQ: boolean;
    requiresSEOText: boolean;
    requiresCanonicalCheck: boolean;
    requiresHumanReview: boolean;
  };
  analytics: {
    pageType: string;
    defaultEventName: string;
  };
};

export type ProgrammaticPageData = {
  id: string;
  slug: string;
  url: string;
  templateType: ProgrammaticPageTemplateType;
  h1: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  robots: {
    index: boolean;
    follow: boolean;
  };
  taxonomy: {
    objectTypeId?: string;
    materialId?: string;
    sizeId?: string;
    featureId?: string;
    regionId?: string;
    intentId?: string;
  };
  content: {
    intro: string;
    costFactors?: string[];
    whoItFits?: string[];
    howToChoose?: string[];
    seoText?: string;
    disclaimer?: string;
  };
  projects: {
    matched: import("@/types").Project[];
    related: import("@/types").Project[];
    fallbackUsed: boolean;
    fallbackReason?: string;
  };
  faq: { question: string; answer: string }[];
  cta: {
    primary: string;
    secondary?: string;
    sourceCTA: string;
  };
  leadMagnet?: {
    id: string;
    title: string;
    description: string;
  };
  related: {
    pages: { title: string; url: string; relation: string }[];
    articles: { title: string; url: string; relation: string }[];
    projects: { title: string; url: string; relation: string }[];
  };
  filterLinks: { label: string; href: string }[];
  schema: Record<string, unknown>[];
  analytics: {
    pageType: string;
    pageSlug: string;
    templateType: ProgrammaticPageTemplateType;
    clusterId?: string;
  };
  blocks: ProgrammaticPageBlock[];
};

export type ProgrammaticLeadContext = {
  pageType: string;
  pageSlug: string;
  pageUrl: string;
  h1: string;
  objectTypeId?: string;
  materialId?: string;
  sizeId?: string;
  featureId?: string;
  regionId?: string;
  intentId?: string;
  templateType?: ProgrammaticPageTemplateType;
  matchedProjectsCount?: number;
  selectedProjectId?: string;
  sourceCTA: string;
  sourceSection?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
};
