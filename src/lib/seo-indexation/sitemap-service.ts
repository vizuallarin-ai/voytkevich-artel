import type { MetadataRoute } from "next";
import type { IndexabilityDecision } from "@/types/seo-indexation";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import {
  ALL_SITEMAP_SEGMENTS,
  SITEMAP_MAX_URLS_PER_FILE,
  SITEMAP_SEGMENT_FILENAMES,
  type SitemapEntry,
  type SitemapSegment,
} from "@/lib/seo-indexation/sitemap-registry";
import { mapUrlToSitemapSegment } from "@/lib/seo-indexation/sitemap-segmentation";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";
import { staticRouteToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { SITE_URL } from "@/lib/seo";
import { sitemapPriorityByContentPriority } from "@/data/seo-indexation-rules";

export type SitemapIndexEntry = {
  url: string;
  segment: SitemapSegment;
  lastModified?: Date;
};

export type SitemapStats = {
  totalEntries: number;
  indexableEntries: number;
  excludedEntries: number;
  bySegment: Record<SitemapSegment, number>;
  duplicatesRemoved: number;
};

function safeLastModified(value?: string | Date): Date {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function extractPath(url: string): string {
  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url.startsWith("/") ? url : `/${url}`;
}

export function validateSitemapEntry(entry: SitemapEntry): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!entry.url) issues.push("Пустой URL");
  if (!entry.path) issues.push("Пустой path");
  if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) {
    issues.push("Priority вне диапазона 0..1");
  }

  try {
    new URL(entry.url);
  } catch {
    issues.push("Невалидный URL");
  }

  return { valid: issues.length === 0, issues };
}

export function deduplicateSitemapEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  const result: SitemapEntry[] = [];

  for (const entry of entries) {
    const key = entry.url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result;
}

export function excludeNonIndexableEntries(
  entries: SitemapEntry[],
  decisions: Map<string, IndexabilityDecision>,
): SitemapEntry[] {
  return entries.filter((entry) => {
    const key = entry.pageId ?? entry.contentItemId ?? entry.url;
    const decision = decisions.get(key);
    return decision?.sitemap ?? true;
  });
}

export function splitLargeSitemap(entries: SitemapEntry[], maxUrls = SITEMAP_MAX_URLS_PER_FILE): SitemapEntry[][] {
  if (entries.length <= maxUrls) return [entries];

  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < entries.length; i += maxUrls) {
    chunks.push(entries.slice(i, i + maxUrls));
  }
  return chunks;
}

export function calculateLastModified(entry: SitemapEntry): Date {
  return safeLastModified(entry.lastModified);
}

export function metadataEntryToSitemapEntry(entry: MetadataRoute.Sitemap[number]): SitemapEntry {
  const path = extractPath(entry.url);
  return {
    url: entry.url,
    path,
    segment: mapUrlToSitemapSegment(path),
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    pageId: `static:${path}`,
  };
}

export function sitemapEntryToMetadataEntry(entry: SitemapEntry): MetadataRoute.Sitemap[number] {
  return {
    url: entry.url,
    lastModified: calculateLastModified(entry),
    changeFrequency: entry.changeFrequency ?? "weekly",
    priority: entry.priority ?? 0.5,
  };
}

export function getIndexableSitemapEntries(
  rawEntries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const sitemapEntries = rawEntries.map(metadataEntryToSitemapEntry);
  const deduped = deduplicateSitemapEntries(sitemapEntries);
  const decisions = new Map<string, IndexabilityDecision>();

  for (const entry of deduped) {
    const page = staticRouteToIndexablePage({
      path: entry.path,
      title: entry.path,
      pageType: undefined,
      lastModified:
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : typeof entry.lastModified === "string"
            ? entry.lastModified
            : undefined,
    });

    if (entry.priority !== undefined) {
      page.seo.priority =
        entry.priority >= 0.9 ? "P1" : entry.priority >= 0.8 ? "P2" : entry.priority >= 0.7 ? "P3" : "P4";
    }

    const decision = evaluateIndexability(page);
    decisions.set(entry.pageId ?? entry.url, decision);

    if (decision.priorityLevel && entry.priority === undefined) {
      entry.priority = sitemapPriorityByContentPriority[decision.priorityLevel];
    }
  }

  const filtered = excludeNonIndexableEntries(deduped, decisions);
  return filtered.map(sitemapEntryToMetadataEntry);
}

export function buildSitemapSegment(
  segment: SitemapSegment,
  entries: SitemapEntry[],
): MetadataRoute.Sitemap {
  return entries
    .filter((e) => e.segment === segment)
    .map(sitemapEntryToMetadataEntry);
}

export function buildSitemapIndex(entries: SitemapEntry[]): SitemapIndexEntry[] {
  const segments = new Set<SitemapSegment>();

  for (const entry of entries) {
    segments.add(entry.segment);
  }

  return [...segments].map((segment) => ({
    url: `${SITE_URL}/${SITEMAP_SEGMENT_FILENAMES[segment]}`,
    segment,
    lastModified: new Date(),
  }));
}

export function getSitemapStats(
  allEntries: SitemapEntry[],
  indexableEntries: SitemapEntry[],
): SitemapStats {
  const bySegment = Object.fromEntries(
    ALL_SITEMAP_SEGMENTS.map((segment) => [segment, 0]),
  ) as Record<SitemapSegment, number>;

  for (const entry of indexableEntries) {
    bySegment[entry.segment] = (bySegment[entry.segment] ?? 0) + 1;
  }

  return {
    totalEntries: allEntries.length,
    indexableEntries: indexableEntries.length,
    excludedEntries: allEntries.length - indexableEntries.length,
    bySegment,
    duplicatesRemoved: allEntries.length - deduplicateSitemapEntries(allEntries).length,
  };
}

export function buildAllSegmentSitemaps(entries: SitemapEntry[]): Record<SitemapSegment, MetadataRoute.Sitemap> {
  const result = Object.fromEntries(
    ALL_SITEMAP_SEGMENTS.map((segment) => [segment, [] as MetadataRoute.Sitemap]),
  ) as Record<SitemapSegment, MetadataRoute.Sitemap>;

  for (const segment of ALL_SITEMAP_SEGMENTS) {
    result[segment] = buildSitemapSegment(segment, entries);
  }

  return result;
}
