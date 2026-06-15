import { SITE_URL } from "@/lib/seo";

type UtmParams = {
  baseUrl: string;
  platformId: string;
  campaignId: string;
  contentItemId: string;
  clusterId: string;
};

export function buildContentUTMUrl({
  baseUrl,
  platformId,
  campaignId,
  contentItemId,
  clusterId,
}: UtmParams): string {
  const url = new URL(baseUrl.startsWith("http") ? baseUrl : `${SITE_URL}${baseUrl}`);
  url.searchParams.set("utm_source", platformId);
  url.searchParams.set("utm_medium", "content_teaser");
  url.searchParams.set("utm_campaign", campaignId);
  url.searchParams.set("utm_content", contentItemId);
  url.searchParams.set("utm_term", clusterId);
  return url.toString();
}

export function parseContentUTM(url: string): Record<string, string> {
  const parsed = new URL(url);
  return {
    utm_source: parsed.searchParams.get("utm_source") ?? "",
    utm_medium: parsed.searchParams.get("utm_medium") ?? "",
    utm_campaign: parsed.searchParams.get("utm_campaign") ?? "",
    utm_content: parsed.searchParams.get("utm_content") ?? "",
    utm_term: parsed.searchParams.get("utm_term") ?? "",
  };
}
