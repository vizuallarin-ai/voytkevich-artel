import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { InternalLinkPlacement, InternalLinkRecord } from "@/types/internal-link";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { getRedirect } from "@/lib/seo-indexation/redirect-service";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";

type ContentWithBody = CMSContentItem & { body?: string; contentHtml?: string };

const HREF_PATTERN = /href=["'](\/[^"'#?]+)["']/gi;
const MD_LINK_PATTERN = /\[([^\]]*)\]\((\/[^)\s]+)\)/g;

function normalizeUrl(url: string): string {
  const path = url.split("#")[0].split("?")[0];
  return path.replace(/\/$/, "") || "/";
}

function resolveFinalUrl(url: string): string {
  let current = normalizeUrl(url);
  let depth = 0;
  while (depth < 5) {
    const redirect = getRedirect(current);
    if (!redirect?.active) break;
    current = normalizeUrl(redirect.to);
    depth++;
  }
  return current;
}

function extractFromHtml(html: string): Array<{ url: string; anchor: string | null }> {
  const results: Array<{ url: string; anchor: string | null }> = [];
  for (const match of html.matchAll(HREF_PATTERN)) {
    results.push({ url: match[1], anchor: null });
  }
  for (const match of html.matchAll(MD_LINK_PATTERN)) {
    results.push({ url: match[2], anchor: match[1] || null });
  }
  return results;
}

function extractFromRelated(item: CMSContentItem): Array<{ url: string; anchor: string | null; placement: InternalLinkPlacement }> {
  const links: Array<{ url: string; anchor: string | null; placement: InternalLinkPlacement }> = [];
  const relatedGroups = [
    item.related.editorialContent,
    item.related.technicalArticles,
    item.related.programmaticPages,
    item.related.leadMagnets,
    item.related.projects,
  ];

  for (const group of relatedGroups) {
    if (!group?.length) continue;
    for (const ref of group) {
      const url = ref.startsWith("/") ? ref : `/blog/${ref}`;
      links.push({ url, anchor: null, placement: "related-content" });
    }
  }
  return links;
}

export function extractInternalLinks(contentItem: ContentWithBody): InternalLinkRecord[] {
  const now = new Date().toISOString();
  const records: InternalLinkRecord[] = [];
  const seen = new Set<string>();

  const bodyContent = contentItem.body ?? contentItem.contentHtml ?? contentItem.seoDescription ?? "";
  for (const { url, anchor } of extractFromHtml(bodyContent)) {
    const key = `${contentItem.url}|${url}|body`;
    if (seen.has(key)) continue;
    seen.add(key);
    records.push({
      id: randomUUID(),
      sourceContentItemId: contentItem.id,
      sourceUrl: contentItem.url,
      targetUrl: url,
      anchorText: anchor,
      placement: "body",
      status: "active",
      firstDetectedAt: now,
    });
  }

  for (const { url, anchor, placement } of extractFromRelated(contentItem)) {
    const key = `${contentItem.url}|${url}|${placement}`;
    if (seen.has(key)) continue;
    seen.add(key);
    records.push({
      id: randomUUID(),
      sourceContentItemId: contentItem.id,
      sourceUrl: contentItem.url,
      targetUrl: url,
      anchorText: anchor,
      placement,
      status: "active",
      firstDetectedAt: now,
    });
  }

  return records;
}

export async function buildInternalLinkInventory(contentItems: CMSContentItem[]): Promise<InternalLinkRecord[]> {
  const urlToId = new Map(contentItems.map((i) => [normalizeUrl(i.url), i.id]));
  const allLinks: InternalLinkRecord[] = [];

  for (const item of contentItems) {
    const links = extractInternalLinks(item);
    for (const link of links) {
      const finalUrl = resolveFinalUrl(link.targetUrl);
      const targetId = urlToId.get(normalizeUrl(finalUrl));
      const validated = await validateInternalLinkTarget({
        ...link,
        targetUrl: finalUrl,
        targetContentItemId: targetId,
      });
      allLinks.push(validated);
      knowledgeGraphStore.saveLinkRecord(validated);
    }
  }

  return deduplicateInternalLinks(allLinks);
}

export function normalizeInternalLink(link: InternalLinkRecord): InternalLinkRecord {
  return {
    ...link,
    sourceUrl: normalizeUrl(link.sourceUrl),
    targetUrl: normalizeUrl(link.targetUrl),
    anchorText: link.anchorText?.trim() || null,
  };
}

export function deduplicateInternalLinks(links: InternalLinkRecord[]): InternalLinkRecord[] {
  const map = new Map<string, InternalLinkRecord>();
  for (const link of links.map(normalizeInternalLink)) {
    const key = `${link.sourceContentItemId}|${link.targetUrl}|${link.placement}|${link.anchorText ?? ""}`;
    if (!map.has(key)) map.set(key, link);
  }
  return [...map.values()];
}

export function classifyInternalLinkPlacement(link: InternalLinkRecord): InternalLinkPlacement {
  return link.placement;
}

export async function validateInternalLinkTarget(link: InternalLinkRecord): Promise<InternalLinkRecord> {
  const now = new Date().toISOString();
  let status = link.status;
  const finalUrl = resolveFinalUrl(link.targetUrl);

  if (finalUrl !== normalizeUrl(link.targetUrl)) {
    status = "redirected";
  }

  const target = await contentRepository.getContentBySlug(
    finalUrl.replace(/^\//, "").split("/").pop() ?? "",
  );

  if (target) {
    link.targetContentItemId = target.id;
    if (!target.indexing.indexable || target.quality.shouldNoindex) {
      status = "noindex-target";
    }
    if (target.indexing.canonicalUrl && normalizeUrl(target.indexing.canonicalUrl) !== normalizeUrl(target.url)) {
      status = "noncanonical";
    }
    if (target.status === "draft" || target.status === "review") {
      status = "noindex-target";
    }
  } else if (!finalUrl.startsWith("/calculator") && !finalUrl.startsWith("/catalog")) {
    status = "broken";
  }

  return { ...link, targetUrl: finalUrl, status, lastCheckedAt: now };
}

export async function recheckInternalLinks(contentItemId: string): Promise<InternalLinkRecord[]> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return [];
  const links = extractInternalLinks(item);
  const validated: InternalLinkRecord[] = [];
  for (const link of links) {
    const result = await validateInternalLinkTarget(link);
    knowledgeGraphStore.saveLinkRecord(result);
    validated.push(result);
  }
  return validated;
}

export function getInternalLinkInventorySummary(): {
  total: number;
  active: number;
  broken: number;
  redirected: number;
  noindexTarget: number;
} {
  const links = knowledgeGraphStore.listLinkRecords();
  return {
    total: links.length,
    active: links.filter((l) => l.status === "active").length,
    broken: links.filter((l) => l.status === "broken").length,
    redirected: links.filter((l) => l.status === "redirected").length,
    noindexTarget: links.filter((l) => l.status === "noindex-target").length,
  };
}

export const internalLinkInventoryService = {
  extractInternalLinks,
  buildInternalLinkInventory,
  normalizeInternalLink,
  deduplicateInternalLinks,
  classifyInternalLinkPlacement,
  validateInternalLinkTarget,
  recheckInternalLinks,
  getInternalLinkInventorySummary,
};
