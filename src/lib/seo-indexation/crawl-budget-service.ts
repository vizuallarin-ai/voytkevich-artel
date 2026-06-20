import type { CrawlBudgetScore, CrawlPriorityLevel, SitemapSegment as CrawlSitemapSegment } from "@/types/crawl-budget";
import type { SitemapSegment as RegistrySitemapSegment } from "@/lib/seo-indexation/sitemap-registry";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import type { IndexabilityDecision } from "@/types/seo-indexation";
import {
  crawlPriorityByContentPriority,
  sitemapPriorityByContentPriority,
} from "@/data/seo-indexation-rules";
import { mapUrlToSitemapSegment } from "@/lib/seo-indexation/sitemap-segmentation";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";

function mapRegistrySegmentToCrawlSegment(segment: RegistrySitemapSegment): CrawlSitemapSegment {
  switch (segment) {
    case "static":
    case "services":
      return "core";
    case "projects":
    case "categories":
      return "commercial";
    case "programmatic":
    case "materials":
    case "sizes":
    case "comparisons":
      return "programmatic";
    case "editorial":
    case "knowledge":
    case "technical":
      return "editorial";
    case "locations":
      return "local";
    default:
      return "technical";
  }
}

const PAGE_TYPE_WEIGHTS: Record<string, number> = {
  home: 1,
  catalog: 0.95,
  service: 0.9,
  project: 0.85,
  category: 0.8,
  article: 0.7,
  case: 0.72,
  calculator: 0.88,
  planner: 0.86,
  "project-location-page": 0.74,
};

/**
 * Internal crawl priority score — not real search engine crawl frequency.
 */
export function calculateCrawlBudgetScore(
  page: IndexablePageInput,
  decision?: IndexabilityDecision,
): CrawlBudgetScore {
  const indexDecision = decision ?? evaluateIndexability(page);
  const priority = page.seo.priority ?? "P3";
  const level: CrawlPriorityLevel = crawlPriorityByContentPriority[priority];
  const pageTypeWeight = PAGE_TYPE_WEIGHTS[page.pageType ?? ""] ?? 0.6;
  const contentPriorityScore = sitemapPriorityByContentPriority[priority] * 100;

  const updatedAt = page.workflow.updatedAt ?? page.workflow.publishedAt;
  const freshnessScore = updatedAt
    ? Math.max(0, 100 - Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 50;

  const indexationUrgency = indexDecision.indexable ? (indexDecision.sitemap ? 90 : 60) : 10;
  const internalLinkDepth = page.kind === "static-page" ? 1 : page.kind === "programmatic-page" ? 3 : 2;

  const score = Math.round(
    contentPriorityScore * 0.35 +
      pageTypeWeight * 100 * 0.25 +
      freshnessScore * 0.15 +
      indexationUrgency * 0.15 +
      (6 - internalLinkDepth) * 10 * 0.1,
  );

  const reasons: string[] = [
    `Internal crawl priority: ${level}`,
    `Content priority ${priority}`,
    indexDecision.indexable ? "Indexable" : "Noindex",
  ];

  if (!indexDecision.sitemap) {
    reasons.push("Not in sitemap — lower internal priority");
  }

  return {
    url: page.url,
    contentItemId: page.id,
    level,
    score: Math.min(100, Math.max(0, score)),
    priority,
    sitemapSegment: mapRegistrySegmentToCrawlSegment(mapUrlToSitemapSegment(page.url, page.pageType)),
    sitemapPriority: sitemapPriorityByContentPriority[priority],
    changefreq: page.kind === "static-page" ? "weekly" : "monthly",
    factors: {
      contentPriorityScore,
      pageTypeWeight,
      freshnessScore,
      indexationUrgency,
      internalLinkDepth,
    },
    reasons,
    calculatedAt: new Date().toISOString(),
  };
}

export function buildCrawlPriorityQueue(pages: IndexablePageInput[]): CrawlBudgetScore[] {
  return pages
    .map((page) => calculateCrawlBudgetScore(page))
    .sort((a, b) => b.score - a.score);
}

export function findCrawlWaste(pages: IndexablePageInput[]): CrawlBudgetScore[] {
  return pages
    .map((page) => ({ page, decision: evaluateIndexability(page), score: calculateCrawlBudgetScore(page) }))
    .filter(({ decision }) => !decision.indexable || !decision.sitemap || decision.status === "noindex")
    .map(({ score }) => score);
}

export function getCrawlBudgetSummary(pages: IndexablePageInput[]) {
  const scores = buildCrawlPriorityQueue(pages);
  const waste = findCrawlWaste(pages);

  const byLevel = scores.reduce(
    (acc, item) => {
      acc[item.level] = (acc[item.level] ?? 0) + 1;
      return acc;
    },
    {} as Record<CrawlPriorityLevel, number>,
  );

  return {
    totalPages: pages.length,
    queueSize: scores.length,
    wasteCount: waste.length,
    byLevel,
    topPriority: scores.slice(0, 10),
    note: "Internal crawl priority only — not real crawl frequency from search engines",
  };
}
