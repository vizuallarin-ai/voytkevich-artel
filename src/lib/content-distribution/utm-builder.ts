import { SITE_URL } from "@/lib/seo";
import { getExternalPlatform } from "@/data/external-content-platforms";
import { SITE_HOST } from "@/data/distribution-rules";

export type ContentUTMInput = {
  baseUrl: string;
  platformId: string;
  campaignId: string;
  contentItemId: string;
  clusterId?: string;
  rubricId?: string;
  teaserId?: string;
};

export function buildContentUTMUrl(input: ContentUTMInput): string {
  const platform = getExternalPlatform(input.platformId);
  if (!platform) {
    throw new Error(`Unknown platform: ${input.platformId}`);
  }

  const url = new URL(
    input.baseUrl.startsWith("http") ? input.baseUrl : `${SITE_URL}${input.baseUrl}`,
  );

  if (!url.hostname.includes(SITE_HOST)) {
    throw new Error("baseUrl must point to stroistroy.ru");
  }

  url.searchParams.set("utm_source", platform.utmSource);
  url.searchParams.set("utm_medium", "content_teaser");
  url.searchParams.set("utm_campaign", input.campaignId);
  url.searchParams.set("utm_content", input.teaserId ?? input.contentItemId);
  if (input.clusterId || input.rubricId) {
    url.searchParams.set("utm_term", input.clusterId ?? input.rubricId ?? "");
  }

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

export function stripUtmFromUrl(url: string): string {
  const parsed = new URL(url.startsWith("http") ? url : `${SITE_URL}${url}`);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    parsed.searchParams.delete(key);
  }
  return parsed.toString();
}

/** @deprecated use ContentUTMInput object */
export function buildContentUTMUrlLegacy(params: {
  baseUrl: string;
  platformId: string;
  campaignId: string;
  contentItemId: string;
  clusterId: string;
}): string {
  return buildContentUTMUrl(params);
}
