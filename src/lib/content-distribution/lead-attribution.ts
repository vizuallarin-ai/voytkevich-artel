import type { ContentDistributionAttribution } from "@/types/content-distribution";
import type { Lead, LeadAnalytics } from "@/types/lead";
import { parseContentUTM } from "@/lib/content-distribution/utm-builder";

export function parseContentDistributionFromUtm(
  utm?: LeadAnalytics["utm"],
): ContentDistributionAttribution | null {
  if (!utm || utm.medium !== "content_teaser") return null;
  return {
    sourcePlatform: utm.source,
    campaignId: utm.campaign,
    contentItemId: utm.content,
    teaserId: utm.content,
    clusterId: utm.term,
    utm: {
      source: utm.source,
      medium: utm.medium,
      campaign: utm.campaign,
      content: utm.content,
      term: utm.term,
    },
  };
}

export function parseContentDistributionFromUrl(url: string): ContentDistributionAttribution | null {
  try {
    const parsed = parseContentUTM(url);
    if (parsed.utm_medium !== "content_teaser") return null;
    return {
      sourcePlatform: parsed.utm_source,
      campaignId: parsed.utm_campaign,
      contentItemId: parsed.utm_content,
      teaserId: parsed.utm_content,
      clusterId: parsed.utm_term,
      originalArticleUrl: url.split("?")[0],
      utm: {
        source: parsed.utm_source,
        medium: parsed.utm_medium,
        campaign: parsed.utm_campaign,
        content: parsed.utm_content,
        term: parsed.utm_term,
      },
    };
  } catch {
    return null;
  }
}

export function enrichLeadWithContentAttribution(lead: Lead): Lead {
  const dist = parseContentDistributionFromUtm(lead.analytics.utm);
  if (!dist) return lead;

  return {
    ...lead,
    context: {
      ...lead.context,
      contentDistribution: dist,
    },
    request: {
      ...lead.request,
      title: dist.campaignId
        ? `Заявка из teaser (${dist.sourcePlatform}): ${dist.campaignId}`
        : lead.request.title,
    },
  };
}

export function formatContentAttributionForCrm(dist: ContentDistributionAttribution): string {
  const parts = [
    dist.sourcePlatform ? `Платформа: ${dist.sourcePlatform}` : null,
    dist.campaignId ? `Campaign: ${dist.campaignId}` : null,
    dist.contentItemId ? `Материал: ${dist.contentItemId}` : null,
    dist.teaserId ? `Teaser: ${dist.teaserId}` : null,
    dist.clusterId ? `Кластер: ${dist.clusterId}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}
