import { randomUUID } from "crypto";
import type { CMSContentItem, CMSContentKind } from "@/types/content-cms";
import type {
  ContentAnalyticsPeriod,
  ContentDataCompleteness,
  ContentPerformanceSnapshot,
  ContentType,
} from "@/types/content-analytics";
import type { StoredAnalyticsEvent } from "@/types/analytics";
import type { StoredLead, LeadStatus } from "@/types/lead";
import { getAnalyticsEvents } from "@/lib/analytics/analytics-storage";
import { getAllLeads } from "@/lib/leads/lead-repository";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";
import { isInDateRange } from "@/lib/analytics/date-range";
import { calculateDataCompleteness, safeRate } from "@/lib/content-analytics/analytics-normalizer";
import { getIngestedRecords } from "@/lib/content-analytics/analytics-ingestion-service";
import { getConnectedSources } from "@/lib/content-analytics/analytics-source-registry";
import { evaluateConfidenceSignal } from "@/data/content-analytics-confidence-rules";

export const QUALIFIED_LEAD_STATUSES: LeadStatus[] = ["qualified", "won"];
export const DEAL_LEAD_STATUSES: LeadStatus[] = ["won"];

export function isQualifiedLead(status: LeadStatus): boolean {
  return QUALIFIED_LEAD_STATUSES.includes(status);
}

export function isDealLead(status: LeadStatus): boolean {
  return DEAL_LEAD_STATUSES.includes(status);
}

export function cmsKindToContentType(kind: CMSContentKind, contentType?: string): ContentType {
  if (kind === "programmatic-page") {
    const ct = (contentType ?? "").toLowerCase();
    if (ct.includes("location") || ct.includes("geo")) return "location";
    if (ct.includes("material")) return "material";
    if (ct.includes("comparison") || ct.includes("compare")) return "comparison";
    if (ct.includes("category")) return "category";
    if (ct.includes("project")) return "project";
    if (ct.includes("service")) return "service";
    return "programmatic";
  }
  if (kind === "technical-article") return "technical";
  if (kind === "editorial-content" || kind === "news" || kind === "digest") return "editorial";
  if (kind === "landing-page") return "service";
  if (kind === "lead-magnet") return "knowledge";
  return "other";
}

function normalizePath(url: string): string {
  try {
    if (url.startsWith("http")) return new URL(url).pathname;
  } catch {
    /* keep */
  }
  return url.startsWith("/") ? url : `/${url}`;
}

function matchLeadToContent(lead: StoredLead, item: CMSContentItem): boolean {
  const leadPath = normalizePath(lead.meta.currentUrl ?? lead.source.currentUrl ?? "");
  const itemPath = normalizePath(item.url);
  if (leadPath === itemPath) return true;
  if (lead.source.pageSlug && lead.source.pageSlug === item.slug) return true;
  if (lead.context.blog?.slug === item.slug) return true;
  if (lead.context.programmatic?.pageSlug === item.slug) return true;
  if (lead.context.technical?.articleSlug === item.slug) return true;
  if (lead.context.editorial?.contentSlug === item.slug) return true;
  return false;
}

function matchEventsToContent(events: StoredAnalyticsEvent[], item: CMSContentItem): StoredAnalyticsEvent[] {
  const itemPath = normalizePath(item.url);
  return events.filter((e) => {
    const path = e.page?.path ?? e.page?.currentUrl;
    if (path && normalizePath(path) === itemPath) return true;
    if (e.page?.pageSlug === item.slug) return true;
    if (e.context?.blogPostSlug === item.slug) return true;
    if (e.context?.serviceSlug === item.slug) return true;
    return false;
  });
}

function computeTrafficFromEvents(events: StoredAnalyticsEvent[]): ContentPerformanceSnapshot["traffic"] {
  const views = events.filter((e) => e.name === "page_viewed" || e.name === "content_viewed").length;
  const sessions = new Set(events.map((e) => e.sessionId).filter(Boolean)).size;

  return {
    pageViews: views > 0 ? views : null,
    sessions: sessions > 0 ? sessions : null,
    users: null,
    engagedSessions: null,
    averageEngagementTime: null,
    bounceRate: null,
  };
}

function computeConversionsFromEvents(
  events: StoredAnalyticsEvent[],
  leads: StoredLead[],
): ContentPerformanceSnapshot["conversions"] {
  const ctaClicks = events.filter(
    (e) => e.name === "cta_clicked" || e.name === "content_cta_clicked",
  ).length;
  const formStarts = events.filter(
    (e) => e.name === "form_started" || e.name === "content_form_started",
  ).length;
  const formSubmissions = events.filter((e) =>
    ["form_submitted", "form_success", "content_form_submitted"].includes(e.name),
  ).length;

  const leadCount = leads.length;
  const qualifiedCount = leads.filter((l) => isQualifiedLead(l.status)).length;
  const dealCount = leads.filter((l) => isDealLead(l.status)).length;

  return {
    ctaClicks: ctaClicks > 0 ? ctaClicks : null,
    formStarts: formStarts > 0 ? formStarts : null,
    formSubmissions: formSubmissions > 0 ? formSubmissions : null,
    chatStarts: null,
    phoneClicks: null,
    messengerClicks: null,
    leads: leadCount > 0 ? leadCount : null,
    qualifiedLeads: qualifiedCount > 0 ? qualifiedCount : null,
    deals: dealCount > 0 ? dealCount : null,
  };
}

function resolveDataCompleteness(
  traffic: ContentPerformanceSnapshot["traffic"],
  search: ContentPerformanceSnapshot["search"],
  conversions: ContentPerformanceSnapshot["conversions"],
): ContentDataCompleteness {
  const ingested = getIngestedRecords();
  if (ingested.length > 0) return calculateDataCompleteness(ingested);

  const hasTraffic = traffic.pageViews != null || traffic.sessions != null;
  const hasConversions =
    conversions.leads != null || conversions.ctaClicks != null || conversions.formSubmissions != null;
  const hasSearch =
    search.impressions != null || search.clicks != null || search.indexed != null;

  if (hasTraffic && hasConversions && hasSearch) return "good";
  if (hasTraffic && hasConversions) return "partial";
  if (hasTraffic || hasConversions) return "low";
  return "none";
}

export async function buildContentPerformanceSnapshot(
  item: CMSContentItem,
  period: ContentAnalyticsPeriod,
): Promise<ContentPerformanceSnapshot> {
  const range = {
    key: "30d" as const,
    from: new Date(period.from),
    to: new Date(period.to),
    label: "custom",
  };

  const [allEvents, allLeads, calendarItems] = await Promise.all([
    getAnalyticsEvents({ from: period.from, to: period.to }),
    getAllLeads(true),
    calendarRepository.getByContentItemId(item.id),
  ]);

  const events = matchEventsToContent(
    allEvents.filter((e) => !e.meta?.debug && isInDateRange(e.timestamp, range)),
    item,
  );

  const leads = allLeads.filter(
    (l) =>
      !l.isDemo &&
      isInDateRange(l.meta.createdAt, range) &&
      matchLeadToContent(l, item),
  );

  const traffic = computeTrafficFromEvents(events);
  const conversions = computeConversionsFromEvents(events, leads);

  const search: ContentPerformanceSnapshot["search"] = {
    impressions: null,
    clicks: null,
    ctr: null,
    averagePosition: null,
    indexed: null,
  };

  const ingested = getIngestedRecords({ contentItemId: item.id });
  for (const record of ingested) {
    if (record.metrics.impressions != null) search.impressions = record.metrics.impressions;
    if (record.metrics.clicks != null) search.clicks = record.metrics.clicks;
    if (record.metrics.ctr != null) search.ctr = record.metrics.ctr;
    if (record.metrics.averagePosition != null) search.averagePosition = record.metrics.averagePosition;
  }

  if (search.clicks != null && search.impressions != null && search.ctr == null) {
    search.ctr = safeRate(search.clicks, search.impressions);
  }

  const pageViews = traffic.pageViews;
  const calculated = {
    conversionRate: safeRate(conversions.leads, pageViews),
    leadRate: safeRate(conversions.leads, pageViews),
    qualifiedLeadRate: safeRate(conversions.qualifiedLeads, pageViews),
    leadToDealRate: safeRate(conversions.deals, conversions.leads),
    costPerLead: null,
    costPerQualifiedLead: null,
    roi: null,
  };

  const plannedAt = calendarItems[0]?.scheduledAt ?? null;
  const sources = getConnectedSources().filter((s) => s === "internal" || s === "crm");

  return {
    id: randomUUID(),
    contentItemId: item.id,
    url: item.url,
    contentType: cmsKindToContentType(item.kind, item.contentType),
    period,
    publication: {
      plannedAt,
      createdAt: item.createdAt ?? null,
      approvedAt: item.workflow.approvedBy ? item.workflow.updatedAt ?? null : null,
      publishedAt: item.workflow.publishedAt ?? null,
      indexedAt: null,
      lastMeaningfulUpdateAt: item.workflow.updatedAt ?? item.updatedAt ?? null,
    },
    traffic,
    search,
    conversions,
    business: {
      attributedRevenue: null,
      attributedGrossProfit: null,
      contentCost: null,
      distributionCost: null,
    },
    calculated,
    sources,
    dataCompleteness: resolveDataCompleteness(traffic, search, conversions),
    calculatedAt: new Date().toISOString(),
  };
}

export async function buildContentPerformanceSnapshots(
  period: ContentAnalyticsPeriod,
  filters?: { contentItemIds?: string[] },
): Promise<ContentPerformanceSnapshot[]> {
  const items = await contentRepository.listContent();
  const filtered = filters?.contentItemIds
    ? items.filter((i) => filters.contentItemIds!.includes(i.id))
    : items;

  return Promise.all(filtered.map((item) => buildContentPerformanceSnapshot(item, period)));
}

export function getSnapshotConfidence(snapshot: ContentPerformanceSnapshot): ReturnType<
  typeof evaluateConfidenceSignal
> {
  const publishedAt = snapshot.publication.publishedAt;
  const daysSincePublication = publishedAt
    ? Math.floor(
        (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const observationDays = Math.floor(
    (new Date(snapshot.period.to).getTime() - new Date(snapshot.period.from).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return evaluateConfidenceSignal({
    observationDays,
    daysSincePublication,
    impressions: snapshot.search.impressions,
    clicks: snapshot.search.clicks,
    sessions: snapshot.traffic.sessions,
    pageViews: snapshot.traffic.pageViews,
    leads: snapshot.conversions.leads,
    qualifiedLeads: snapshot.conversions.qualifiedLeads,
    deals: snapshot.conversions.deals,
  });
}

export const contentPerformanceSnapshotService = {
  buildSnapshot: buildContentPerformanceSnapshot,
  buildSnapshots: buildContentPerformanceSnapshots,
  getConfidence: getSnapshotConfidence,
};
