import type {
  AttributionModel,
  ContentTouchpoint,
  LeadContentAttribution,
} from "@/types/content-attribution";
import type { StoredLead } from "@/types/lead";
import { contentRepository } from "@/lib/content-cms/content-repository";

const ATTRIBUTION_LIMITATIONS = [
  "Cross-device journeys не отслеживаются без consent-based identity",
  "Last-click не отражает assisted conversions",
  "Отсутствие sessionId снижает точность",
  "CRM статус может измениться после первоначальной атрибуции",
];

function touchpointFromLead(
  lead: StoredLead,
  role: ContentTouchpoint["role"],
  contentItemId: string,
  url: string,
): ContentTouchpoint {
  return {
    contentItemId,
    url,
    sessionId: lead.analytics.session?.sessionId,
    occurredAt: lead.meta.createdAt,
    role,
    source: lead.analytics.utm?.source,
    medium: lead.analytics.utm?.medium,
    campaign: lead.analytics.utm?.campaign,
    referrer: lead.analytics.traffic?.referrer ?? lead.meta.referrer,
  };
}

async function resolveContentForLead(lead: StoredLead): Promise<{ contentItemId: string; url: string } | null> {
  const slug =
    lead.context.blog?.slug ??
    lead.context.programmatic?.pageSlug ??
    lead.context.technical?.articleSlug ??
    lead.context.editorial?.contentSlug ??
    lead.source.pageSlug;

  if (slug) {
    const item = await contentRepository.getContentBySlug(slug);
    if (item) return { contentItemId: item.id, url: item.url };
  }

  const url = lead.meta.currentUrl ?? lead.source.currentUrl;
  if (url) {
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const items = await contentRepository.listContent();
    const match = items.find((i) => i.url === path || i.url.endsWith(path));
    if (match) return { contentItemId: match.id, url: match.url };
  }

  return null;
}

export async function getFirstTouchContent(lead: StoredLead): Promise<ContentTouchpoint | null> {
  const landing = lead.analytics.traffic?.landingPage ?? lead.analytics.attribution?.firstTouch;
  if (!landing) return null;

  const items = await contentRepository.listContent();
  const match = items.find((i) => landing.includes(i.slug) || landing.includes(i.url));
  if (!match) return null;

  return touchpointFromLead(lead, "first-touch", match.id, match.url);
}

export async function getLastTouchContent(lead: StoredLead): Promise<ContentTouchpoint | null> {
  const resolved = await resolveContentForLead(lead);
  if (!resolved) return null;
  return touchpointFromLead(lead, "last-touch", resolved.contentItemId, resolved.url);
}

export async function getConvertingContent(lead: StoredLead): Promise<ContentTouchpoint | null> {
  const resolved = await resolveContentForLead(lead);
  if (!resolved) return null;
  return touchpointFromLead(lead, "direct-conversion", resolved.contentItemId, resolved.url);
}

export async function getAssistedContent(
  lead: StoredLead,
  touchpoints: ContentTouchpoint[],
): Promise<ContentTouchpoint[]> {
  const converting = await getConvertingContent(lead);
  const first = await getFirstTouchContent(lead);
  const exclude = new Set([converting?.url, first?.url].filter(Boolean));

  return touchpoints.filter(
    (tp) => tp.role === "assisted" || (!exclude.has(tp.url) && tp.role !== "direct-conversion"),
  );
}

export function calculateAttributionConfidence(attribution: LeadContentAttribution): "low" | "medium" | "high" {
  const touchCount =
    (attribution.firstTouch ? 1 : 0) +
    (attribution.lastTouch ? 1 : 0) +
    (attribution.convertingTouch ? 1 : 0) +
    attribution.assistedTouches.length;

  if (touchCount >= 3 && attribution.firstTouch?.sessionId) return "high";
  if (touchCount >= 2) return "medium";
  return "low";
}

export function explainLeadAttribution(attribution: LeadContentAttribution): string {
  const parts = [
    `Модель: ${attribution.attributionModel}`,
    `Confidence: ${attribution.confidence}`,
    `Touchpoints: ${attribution.assistedTouches.length + (attribution.firstTouch ? 1 : 0) + (attribution.lastTouch ? 1 : 0)}`,
  ];
  if (attribution.limitations.length) {
    parts.push(`Ограничения: ${attribution.limitations.join("; ")}`);
  }
  return parts.join(". ");
}

export async function attributeLeadToContent(
  lead: StoredLead,
  touchpoints: ContentTouchpoint[],
  model: AttributionModel = "last-touch",
): Promise<LeadContentAttribution> {
  const [firstTouch, lastTouch, convertingTouch] = await Promise.all([
    getFirstTouchContent(lead),
    getLastTouchContent(lead),
    getConvertingContent(lead),
  ]);

  const assistedTouches = await getAssistedContent(lead, touchpoints);

  const attribution: LeadContentAttribution = {
    leadId: lead.id,
    firstTouch,
    lastTouch,
    convertingTouch,
    assistedTouches,
    attributionModel: model,
    confidence: "low",
    limitations: [...ATTRIBUTION_LIMITATIONS],
    calculatedAt: new Date().toISOString(),
  };

  attribution.confidence = calculateAttributionConfidence(attribution);
  return attribution;
}

export const leadAttributionService = {
  attributeLeadToContent,
  getFirstTouchContent,
  getLastTouchContent,
  getConvertingContent,
  getAssistedContent,
  calculateAttributionConfidence,
  explainLeadAttribution,
};
