export type AnalyticsEventCategory =
  | "page"
  | "cta"
  | "form"
  | "lead"
  | "calculator"
  | "planner"
  | "catalog"
  | "project"
  | "blog"
  | "service-page"
  | "lead-magnet"
  | "case"
  | "objects-map"
  | "crm"
  | "automation";

export type AnalyticsEventName =
  | "page_viewed"
  | "page_scrolled"
  | "page_section_viewed"
  | "cta_clicked"
  | "form_viewed"
  | "form_started"
  | "form_submitted"
  | "form_success"
  | "form_error"
  | "lead_created"
  | "lead_qualified"
  | "lead_status_changed"
  | "calculator_started"
  | "calculator_step_completed"
  | "calculator_result_viewed"
  | "calculator_lead_submitted"
  | "calculator_project_clicked"
  | "calculator_reset"
  | "planner_started"
  | "planner_scenario_selected"
  | "planner_room_added"
  | "planner_area_changed"
  | "planner_recommendations_viewed"
  | "planner_calculator_clicked"
  | "planner_lead_submitted"
  | "planner_reset"
  | "catalog_viewed"
  | "catalog_filter_used"
  | "catalog_sort_used"
  | "catalog_project_clicked"
  | "catalog_lead_submitted"
  | "project_viewed"
  | "project_cta_clicked"
  | "project_lead_submitted"
  | "related_project_clicked"
  | "service_page_viewed"
  | "service_page_cta_clicked"
  | "service_page_lead_submitted"
  | "blog_viewed"
  | "blog_category_viewed"
  | "blog_post_viewed"
  | "blog_cta_clicked"
  | "blog_lead_submitted"
  | "related_article_clicked"
  | "lead_magnet_viewed"
  | "lead_magnet_clicked"
  | "lead_magnet_modal_opened"
  | "lead_magnet_form_started"
  | "lead_magnet_submitted"
  | "lead_magnet_success_viewed"
  | "case_viewed"
  | "case_cta_clicked"
  | "case_lead_submitted"
  | "objects_map_viewed"
  | "objects_map_filter_used"
  | "objects_map_object_clicked"
  | "objects_map_case_clicked"
  | "objects_map_lead_submitted"
  | "crm_lead_opened"
  | "crm_status_changed"
  | "crm_comment_added"
  | "crm_next_action_set"
  | "automation_started"
  | "notification_sent"
  | "notification_failed"
  | "sla_assigned"
  | "sla_overdue";

export type AnalyticsEvent = {
  id?: string;
  name: AnalyticsEventName | string;
  category: AnalyticsEventCategory;
  timestamp: string;
  sessionId?: string;
  visitorId?: string;
  leadId?: string;
  page?: {
    pageType?: string;
    pageSlug?: string;
    pageTitle?: string;
    currentUrl?: string;
    referrer?: string;
    path?: string;
  };
  source?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    referrer?: string;
    landingPage?: string;
  };
  context?: {
    projectSlug?: string;
    projectTitle?: string;
    serviceSlug?: string;
    blogPostSlug?: string;
    blogCategorySlug?: string;
    clusterId?: string;
    leadMagnetId?: string;
    caseSlug?: string;
    objectSlug?: string;
    catalogCategorySlug?: string;
    calculatorResultId?: string;
    plannerDraftId?: string;
  };
  action?: {
    ctaId?: string;
    ctaLabel?: string;
    ctaPosition?: string;
    formId?: string;
    formName?: string;
    step?: string;
    value?: string | number | boolean;
  };
  metrics?: {
    leadScore?: number;
    readiness?: "cold" | "warm" | "hot" | "unknown";
    totalMin?: number;
    totalMax?: number;
    area?: number;
    pricePerM2Min?: number;
    pricePerM2Max?: number;
    durationMs?: number;
  };
  meta?: {
    userAgent?: string;
    deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
    viewport?: string;
    debug?: boolean;
  };
};

export type StoredAnalyticsEvent = AnalyticsEvent & { id: string };

export type DateRangeKey = "today" | "7d" | "30d" | "90d" | "all";

export type DateRange = {
  key: DateRangeKey;
  from: Date;
  to: Date;
  label: string;
};

export type AnalyticsEventFilters = {
  from?: string;
  to?: string;
  name?: AnalyticsEventName | string;
  category?: AnalyticsEventCategory;
  sessionId?: string;
  leadId?: string;
  limit?: number;
};

export type PagePerformance = {
  pageType: string;
  pageSlug?: string;
  path: string;
  title?: string;
  views: number;
  uniqueSessions: number;
  ctaClicks: number;
  formStarts: number;
  formSubmits: number;
  leads: number;
  conversionRate: number | null;
  leadQualityAvg: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  topCTAs: { ctaLabel: string; clicks: number; leads: number }[];
  relatedClusterId?: string;
};

export type SourcePerformance = {
  source: string;
  medium?: string;
  campaign?: string;
  sessions?: number;
  leads: number;
  hotLeads: number;
  averageLeadScore: number;
  conversionRate?: number | null;
  topPages: string[];
  topCTAs: string[];
};

export type CTAPerformance = {
  ctaId?: string;
  ctaLabel: string;
  ctaPosition?: string;
  pageType?: string;
  pageSlug?: string;
  clicks: number;
  formStarts: number;
  leads: number;
  clickToLeadRate: number | null;
  averageLeadScore: number;
  hotLeads: number;
};

export type FunnelStep = {
  name: string;
  label: string;
  count: number;
  conversionFromPrev: number | null;
  dropOff: number | null;
};

export type FunnelReport = {
  id: string;
  title: string;
  question: string;
  steps: FunnelStep[];
  overallConversion: number | null;
  hasEnoughData: boolean;
};

export type ToolPerformanceReport = {
  calculator: {
    started: number;
    resultViewed: number;
    leadSubmitted: number;
    conversionToLead: number | null;
    avgArea: number | null;
    topMaterial: string | null;
  };
  planner: {
    started: number;
    recommendationsViewed: number;
    leadSubmitted: number;
    conversionToLead: number | null;
    avgArea: number | null;
    topScenario: string | null;
  };
  leadMagnets: {
    viewed: number;
    clicked: number;
    submitted: number;
    conversion: number | null;
    topMagnets: { id: string; title: string; count: number }[];
    avgLeadScore: number;
  };
  catalog: {
    views: number;
    projectClicks: number;
    leads: number;
  };
};

export type CRMPerformanceReport = {
  total: number;
  byStatus: Record<string, number>;
  hot: number;
  warm: number;
  cold: number;
  overdue: number;
  avgResponseMinutes: number | null;
  medianResponseMinutes: number | null;
  slaHitRate: number | null;
  withoutNextAction: number;
  won: number;
  lost: number;
};

export type AnalyticsKPIs = {
  leads: number;
  hotLeads: number;
  avgLeadScore: number;
  formSubmitRate: number | null;
  overdueSLA: number;
  topSource: string | null;
  topPage: string | null;
  topCTA: string | null;
  pageViews: number;
  ctaClicks: number;
  trends?: {
    leads?: number | null;
    hotLeads?: number | null;
    avgLeadScore?: number | null;
  };
};

export type AnalyticsInsight = {
  id: string;
  type: "success" | "warning" | "action" | "info";
  text: string;
  basedOn: "data" | "recommendation";
};

export type AnalyticsReport = {
  range: DateRange;
  kpis: AnalyticsKPIs;
  funnels: FunnelReport[];
  pages: PagePerformance[];
  sources: SourcePerformance[];
  ctas: CTAPerformance[];
  tools: ToolPerformanceReport;
  crm: CRMPerformanceReport;
  insights: AnalyticsInsight[];
  meta: {
    eventCount: number;
    leadCount: number;
    hasEvents: boolean;
    isDemo: boolean;
    storageEnabled: boolean;
    externalAnalytics: { yandex: boolean; ga: boolean };
  };
};
