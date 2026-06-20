export type ContentAnalyticsSource =
  | "internal"
  | "yandex-metrica"
  | "google-analytics"
  | "google-search-console"
  | "yandex-webmaster"
  | "crm"
  | "manual-import"
  | "future-api";

export type ContentType =
  | "programmatic"
  | "project"
  | "service"
  | "category"
  | "technical"
  | "editorial"
  | "location"
  | "material"
  | "comparison"
  | "knowledge"
  | "other";

export type ContentDataCompleteness = "none" | "low" | "partial" | "good" | "strong";

export type ContentPerformanceSnapshot = {
  id: string;
  contentItemId: string;
  url: string;
  contentType: ContentType;

  period: {
    from: string;
    to: string;
  };

  publication: {
    plannedAt?: string | null;
    createdAt?: string | null;
    approvedAt?: string | null;
    publishedAt?: string | null;
    indexedAt?: string | null;
    lastMeaningfulUpdateAt?: string | null;
  };

  traffic: {
    pageViews?: number | null;
    sessions?: number | null;
    users?: number | null;
    engagedSessions?: number | null;
    averageEngagementTime?: number | null;
    bounceRate?: number | null;
  };

  search: {
    impressions?: number | null;
    clicks?: number | null;
    ctr?: number | null;
    averagePosition?: number | null;
    indexed?: boolean | null;
  };

  conversions: {
    ctaClicks?: number | null;
    formStarts?: number | null;
    formSubmissions?: number | null;
    chatStarts?: number | null;
    phoneClicks?: number | null;
    messengerClicks?: number | null;
    leads?: number | null;
    qualifiedLeads?: number | null;
    deals?: number | null;
  };

  business: {
    attributedRevenue?: number | null;
    attributedGrossProfit?: number | null;
    contentCost?: number | null;
    distributionCost?: number | null;
  };

  calculated: {
    conversionRate?: number | null;
    leadRate?: number | null;
    qualifiedLeadRate?: number | null;
    leadToDealRate?: number | null;
    costPerLead?: number | null;
    costPerQualifiedLead?: number | null;
    roi?: number | null;
  };

  sources: ContentAnalyticsSource[];
  dataCompleteness: ContentDataCompleteness;
  calculatedAt: string;
};

export type ContentAnalyticsPeriod = {
  from: string;
  to: string;
};
