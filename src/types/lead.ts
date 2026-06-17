export type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "in_discussion"
  | "estimate_requested"
  | "proposal_sent"
  | "won"
  | "lost"
  | "spam";

export type LeadSourceType =
  | "home"
  | "catalog"
  | "catalog-category"
  | "project-page"
  | "calculator"
  | "planner"
  | "service-page"
  | "blog"
  | "blog-post"
  | "lead-magnet"
  | "case-page"
  | "objects-map"
  | "process"
  | "about"
  | "faq"
  | "programmatic-seo"
  | "unknown";

export type LeadCtaPosition =
  | "hero"
  | "inline"
  | "middle"
  | "sidebar"
  | "final"
  | "modal"
  | "sticky"
  | "unknown";

export type LeadRequestType =
  | "callback"
  | "consultation"
  | "project-estimate"
  | "calculator-result"
  | "planner-review"
  | "lead-magnet"
  | "project-selection"
  | "case-like"
  | "object-map"
  | "service-page"
  | "unknown";

export type LeadReadiness = "cold" | "warm" | "hot" | "unknown";

export type LeadSource = {
  sourceType: LeadSourceType;
  sourceName?: string;
  pageSlug?: string;
  pageType?: string;
  currentUrl?: string;
  referrer?: string;
  formId?: string;
  formName?: string;
  ctaId?: string;
  ctaLabel?: string;
  ctaPosition?: LeadCtaPosition;
  entryPoint?: string;
};

export type LeadContext = {
  project?: {
    slug?: string;
    title?: string;
    area?: number;
    material?: string;
    floors?: number;
    priceFrom?: number;
    categorySlugs?: string[];
  };
  calculator?: {
    area?: number;
    floors?: number;
    material?: string;
    packageType?: string;
    foundation?: string;
    finish?: string;
    utilities?: boolean;
    plotPrep?: boolean;
    total?: number;
    perSqm?: number;
    buildMonths?: number;
    breakdown?: { label: string; amount: number }[];
    totalMin?: number;
    totalMax?: number;
    pricePerM2Min?: number;
    pricePerM2Max?: number;
    durationMinMonths?: number;
    durationMaxMonths?: number;
    hasLand?: string;
    landLocation?: string;
  };
  planner?: {
    scenario?: string | null;
    targetArea?: number;
    totalArea?: number;
    livingArea?: number;
    floors?: number;
    residents?: string;
    hasLand?: string;
    landLocation?: string;
    priority?: string;
    rooms?: { type: string; name: string; area: number; required?: boolean }[];
    recommendations?: string[];
    customized?: boolean;
    calculatorTotal?: number;
  };
  leadMagnet?: {
    id?: string;
    title?: string;
    type?: string;
    clusterIds?: string[];
    fileStatus?: "ready" | "manual" | "future" | "none";
  };
  service?: {
    slug?: string;
    title?: string;
    serviceType?: string;
  };
  blog?: {
    slug?: string;
    title?: string;
    categorySlug?: string;
    clusterId?: string;
    leadMagnetId?: string;
  };
  case?: {
    slug?: string;
    title?: string;
    area?: number;
    material?: string;
    floors?: number;
    locationLabel?: string;
  };
  objectMap?: {
    objectSlug?: string;
    areaSlug?: string;
    locationLabel?: string;
    material?: string;
    floors?: number;
    area?: number;
  };
  catalog?: {
    categorySlug?: string;
    activeFilters?: Record<string, unknown>;
    sort?: string;
    visibleProjectSlugs?: string[];
  };
  programmatic?: import("@/types/programmatic-page-template").ProgrammaticLeadContext;
};

export type LeadQualification = {
  budget?: {
    raw?: string;
    min?: number;
    max?: number;
    currency?: "RUB";
  };
  desiredArea?: number;
  desiredMaterial?: string;
  desiredFloors?: number;
  hasLand?: "yes" | "no" | "searching" | "unknown";
  landLocation?: string;
  landStatus?: string;
  timeline?: {
    start?: "now" | "1-3-months" | "3-6-months" | "6-12-months" | "later" | "unknown";
    raw?: string;
  };
  mortgage?: {
    interested?: boolean;
    raw?: string;
  };
  readiness: LeadReadiness;
  leadScore?: number;
  notes?: string[];
};

export type LeadAnalytics = {
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  traffic?: {
    referrer?: string;
    landingPage?: string;
    currentPage?: string;
    previousPage?: string;
  };
  session?: {
    sessionId?: string;
    firstVisitAt?: string;
    lastVisitAt?: string;
    pagesViewed?: number;
  };
  events?: {
    name: string;
    timestamp: string;
    payload?: Record<string, unknown>;
  }[];
  attribution?: {
    firstTouch?: string;
    lastTouch?: string;
    conversionPage?: string;
  };
};

export type Lead = {
  id?: string;
  status: LeadStatus;
  source: LeadSource;
  contact: {
    name: string;
    phone: string;
    messenger?: string;
    email?: string;
    preferredContactMethod?: "phone" | "whatsapp" | "telegram" | "email" | "any";
  };
  request: {
    type: LeadRequestType;
    title: string;
    comment?: string;
    selectedCTA?: string;
  };
  context: LeadContext;
  qualification: LeadQualification;
  analytics: LeadAnalytics;
  meta: {
    createdAt: string;
    updatedAt?: string;
    userAgent?: string;
    referrer?: string;
    currentUrl?: string;
    pageTitle?: string;
    language?: string;
  };
  privacy?: {
    consent?: boolean;
    consentText?: string;
    policyVersion?: string;
  };
  /** CRM fields (Stage 15) */
  comments?: LeadComment[];
  timeline?: LeadTimelineEvent[];
  nextAction?: LeadNextAction;
  assignedTo?: string;
  lostReason?: LeadLostReason;
  isDemo?: boolean;
  automation?: LeadAutomation;
};

export type LeadLostReason =
  | "no_answer"
  | "too_expensive"
  | "no_land"
  | "postponed"
  | "competitor"
  | "not_target"
  | "spam"
  | "other";

export type LeadNextActionType =
  | "call"
  | "message"
  | "prepare-estimate"
  | "send-proposal"
  | "send-project-selection"
  | "review-calculator"
  | "review-planner"
  | "send-lead-magnet"
  | "clarify-land"
  | "clarify-budget"
  | "mortgage-consultation"
  | "follow-up"
  | "meeting"
  | "no-action";

export type LeadNextAction = {
  type: LeadNextActionType;
  title?: string;
  description?: string;
  at?: string;
  dueAt?: string;
  comment?: string;
  status?: "open" | "done" | "cancelled" | "overdue";
  createdAt?: string;
  createdBy?: "system" | string;
};

export type LeadPriority = "urgent" | "high" | "normal" | "low";

export type LeadSLA = {
  priority: LeadPriority;
  responseDeadlineAt: string;
  targetResponseMinutes: number;
  isOverdue?: boolean;
  overdueMinutes?: number;
};

export type LeadAutomationNotification = {
  channel: "telegram" | "email" | "webhook" | "mock";
  success: boolean;
  sentAt?: string;
  error?: string;
};

export type LeadAutomation = {
  priority?: LeadPriority;
  sla?: LeadSLA;
  recommendedAction?: LeadNextAction;
  notifications?: LeadAutomationNotification[];
  lastAutomationAt?: string;
  processingType?: LeadProcessingType;
};

export type LeadProcessingType =
  | "calculator"
  | "project"
  | "planner"
  | "lead-magnet"
  | "service-page"
  | "blog"
  | "case-like"
  | "objects-map"
  | "callback"
  | "unknown";

export type LeadAutomationResult = {
  success: boolean;
  leadId?: string;
  priority: LeadPriority;
  recommendedAction?: LeadNextAction;
  sla?: LeadSLA;
  notifications: LeadAutomationNotification[];
  message: string;
};

export type LeadTask = {
  id?: string;
  leadId: string;
  type: LeadNextActionType;
  title: string;
  description?: string;
  status: "open" | "done" | "cancelled" | "overdue";
  dueAt?: string;
  createdAt: string;
  createdBy?: "system" | string;
};

export type LeadComment = {
  id: string;
  leadId: string;
  text: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
};

export type LeadTimelineEvent = {
  id: string;
  leadId: string;
  type:
    | "created"
    | "status_changed"
    | "comment_added"
    | "next_action_set"
    | "manager_assigned"
    | "lead_updated"
    | "automation_started"
    | "notification_sent"
    | "notification_failed"
    | "sla_assigned"
    | "sla_overdue";
  title: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
};

export type StoredLead = Lead & { id: string };

export type LeadListParams = {
  status?: LeadStatus | LeadStatus[];
  readiness?: LeadReadiness | LeadReadiness[];
  sourceType?: LeadSourceType | LeadSourceType[];
  requestType?: LeadRequestType | LeadRequestType[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  hasBudget?: boolean;
  hasLand?: boolean;
  hasProject?: boolean;
  hasCalculator?: boolean;
  hasPlanner?: boolean;
  priority?: LeadPriority | LeadPriority[];
  overdue?: boolean;
  nextActionType?: LeadNextActionType;
  page?: number;
  limit?: number;
  sort?: "newest" | "score" | "hot" | "status" | "next_action";
};

export type LeadListResult = {
  leads: StoredLead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type LeadFormContact = {
  name: string;
  phone: string;
  messenger?: string;
  email?: string;
  area?: string;
  comment?: string;
  budget?: string;
  material?: string;
  hasLand?: string;
  landLocation?: string;
};

export type LeadFormInput = {
  contact: LeadFormContact;
  request: {
    type: LeadRequestType;
    title: string;
    comment?: string;
    selectedCTA?: string;
  };
  source: LeadSource;
  context?: LeadContext;
  qualification?: Partial<LeadQualification>;
  analytics?: Partial<LeadAnalytics>;
  privacy?: Lead["privacy"];
  meta?: {
    currentUrl?: string;
    pageTitle?: string;
    formOpenedAt?: number;
    language?: string;
  };
  honeypot?: string;
  conversionGoal?: string;
};

export type LeadSubmitResult = {
  success: boolean;
  leadId?: string;
  message: string;
  errorCode?: string;
};

/** @deprecated Legacy flat payload — normalized server-side */
export type LegacyLeadPayload = {
  name: string;
  phone: string;
  area?: string;
  comment?: string;
  source?: string;
  website?: string;
  messenger?: string;
};
