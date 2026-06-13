export type LeadMagnetType =
  | "pdf"
  | "checklist"
  | "consultation"
  | "selection"
  | "audit"
  | "comparison"
  | "calculator-result"
  | "planner-review";

export type LeadMagnetStatus = "active" | "draft" | "needs-content" | "noindex";

export type LeadMagnetPageType =
  | "home"
  | "service-page"
  | "blog"
  | "blog-post"
  | "catalog"
  | "project-page"
  | "calculator"
  | "planner"
  | "case-page"
  | "objects-map";

export type LeadMagnetIntent =
  | "cost"
  | "land"
  | "project-selection"
  | "planning"
  | "materials"
  | "mistakes"
  | "mortgage"
  | "estimate"
  | "case-like";

export type LeadMagnetFormFields = {
  name: boolean;
  phone: boolean;
  messenger?: boolean;
  comment?: boolean;
  landLocation?: boolean;
  budget?: boolean;
  area?: boolean;
  material?: boolean;
  projectType?: boolean;
  hasLand?: boolean;
  planningScenario?: boolean;
};

export type LeadMagnet = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  type: LeadMagnetType;
  status: LeadMagnetStatus;
  clusterIds: string[];
  pageTypes: LeadMagnetPageType[];
  intent: LeadMagnetIntent;
  valuePromise: string;
  highlights: string[];
  cta: {
    primaryLabel: string;
    secondaryLabel?: string;
    formTitle: string;
    formDescription: string;
    successTitle: string;
    successMessage: string;
  };
  formFields: LeadMagnetFormFields;
  payloadDefaults: {
    leadMagnetId: string;
    leadMagnetType: string;
    defaultSource: string;
  };
  relatedPages: string[];
  file?: {
    hasFile: boolean;
    fileUrl?: string;
    fileName?: string;
    generationStatus: "ready" | "manual" | "future";
  };
  legalNote?: string;
  analytics: {
    viewEvent: string;
    openEvent: string;
    submitEvent: string;
  };
};

export type LeadMagnetPlacement = {
  id: string;
  leadMagnetId: string;
  pageType: LeadMagnetPageType;
  pageSlug?: string;
  clusterId?: string;
  position: "hero" | "inline" | "after-intro" | "middle" | "sidebar" | "after-content" | "final";
  priority: "high" | "medium" | "low";
  displayMode: "card" | "inline" | "banner" | "modal" | "section";
  rules?: {
    showAfterScrollPercent?: number;
    showAfterResult?: boolean;
    showOnlyIfNoLeadSubmitted?: boolean;
  };
};

export type LeadMagnetUserInput = {
  name: string;
  phone: string;
  messenger?: string;
  comment?: string;
  budget?: string;
  area?: string;
  material?: string;
  hasLand?: string;
  landLocation?: string;
  planningScenario?: string;
};

export type LeadMagnetContextPayload = {
  projectSlug?: string;
  projectTitle?: string;
  calculatorResult?: Record<string, unknown>;
  plannerSummary?: Record<string, unknown>;
  caseSlug?: string;
  caseTitle?: string;
  serviceSlug?: string;
  serviceTitle?: string;
  blogPostSlug?: string;
  objectSlug?: string;
  areaSlug?: string;
  activeFilters?: Record<string, unknown>;
};

export type LeadMagnetSubmitContext = {
  pageType: LeadMagnetPageType;
  pageSlug?: string;
  clusterId?: string;
  currentUrl?: string;
  selectedCTA?: string;
  context?: LeadMagnetContextPayload;
};
