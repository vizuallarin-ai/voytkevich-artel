import type { ProgrammaticSEOPage } from "@/types/programmatic-seo";
import { getSeoPageTypeDefinition } from "@/data/seo-page-types";
import { getRegionById } from "@/data/irkutsk-region-taxonomy";
import { buildCanonicalUrl } from "./programmatic-page-builder";
import { calculateContentQualityScore } from "./content-quality-rules";

export function determineIndexingStatus(
  page: ProgrammaticSEOPage,
): ProgrammaticSEOPage["indexing"] {
  const typeDef = getSeoPageTypeDefinition(page.pageType);
  const quality = calculateContentQualityScore(page);

  if (quality.shouldNoindex || !quality.canPublish) {
    return {
      indexable: false,
      noindexReason: quality.blockers[0] ?? quality.warnings[0] ?? "Quality gate",
      sitemap: false,
      canonicalUrl: buildCanonicalUrl(page),
    };
  }

  const blockedStatuses: ProgrammaticSEOPage["status"][] = [
    "planned",
    "draft",
    "ai-generated",
    "review",
    "noindex",
    "needs-keyword-data",
    "rejected",
  ];

  if (blockedStatuses.includes(page.status)) {
    return {
      indexable: false,
      noindexReason: `Status: ${page.status}`,
      sitemap: false,
      canonicalUrl: buildCanonicalUrl(page),
    };
  }

  if (page.region) {
    const region = getRegionById(page.region);
    if (region?.needsKeywordValidation && page.priority.searchDemand === "unknown") {
      return {
        indexable: false,
        noindexReason: "Region requires keyword validation",
        sitemap: false,
        canonicalUrl: buildCanonicalUrl(page),
      };
    }
    if (region && !region.indexableByDefault && page.status !== "published") {
      return {
        indexable: false,
        noindexReason: `Region ${region.title} not indexable by default`,
        sitemap: false,
        canonicalUrl: buildCanonicalUrl(page),
      };
    }
  }

  if (page.priority.cannibalizationRisk === "high") {
    return {
      indexable: false,
      noindexReason: "High cannibalization risk",
      sitemap: false,
      canonicalUrl: page.indexing.canonicalUrl ?? buildCanonicalUrl(page),
    };
  }

  const indexable =
    (page.status === "approved" || page.status === "published") &&
    (typeDef?.indexableByDefault === true || page.status === "published");

  return {
    indexable,
    noindexReason: indexable ? undefined : "Awaiting approved/published status",
    sitemap: indexable && (typeDef?.sitemapAllowed ?? false),
    canonicalUrl: buildCanonicalUrl(page),
  };
}

export function shouldAddToSitemap(page: ProgrammaticSEOPage): boolean {
  return determineIndexingStatus(page).sitemap;
}

export function getNoindexReason(page: ProgrammaticSEOPage): string | undefined {
  return determineIndexingStatus(page).noindexReason;
}

export function getCanonicalUrl(page: ProgrammaticSEOPage): string {
  return determineIndexingStatus(page).canonicalUrl ?? buildCanonicalUrl(page);
}
