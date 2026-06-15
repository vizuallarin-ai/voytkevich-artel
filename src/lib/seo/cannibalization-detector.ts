import type { ProgrammaticSEOPage } from "@/types/programmatic-seo";
import { SITE_URL } from "@/lib/seo";

function normalizeKeyword(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function slugSimilarity(a: string, b: string): boolean {
  const na = a.replace(/-/g, "");
  const nb = b.replace(/-/g, "");
  return na === nb || na.includes(nb) || nb.includes(na);
}

function h1Similarity(a: string, b: string): boolean {
  const na = normalizeKeyword(a);
  const nb = normalizeKeyword(b);
  if (na === nb) return true;
  const wordsA = new Set(na.split(" "));
  const overlap = nb.split(" ").filter((w) => wordsA.has(w)).length;
  return overlap / Math.max(nb.split(" ").length, 1) > 0.75;
}

export function detectDuplicateIntent(
  page: ProgrammaticSEOPage,
  existingPages: ProgrammaticSEOPage[],
): ProgrammaticSEOPage[] {
  const target = normalizeKeyword(page.targetKeyword);
  return existingPages.filter(
    (other) =>
      other.id !== page.id &&
      (normalizeKeyword(other.targetKeyword) === target ||
        (other.pageType === page.pageType &&
          other.region === page.region &&
          other.material === page.material &&
          other.size === page.size &&
          other.objectType === page.objectType)),
  );
}

export function detectCannibalizationRisk(
  page: ProgrammaticSEOPage,
  existingPages: ProgrammaticSEOPage[],
): "high" | "medium" | "low" {
  const duplicates = detectDuplicateIntent(page, existingPages);
  if (duplicates.some((d) => normalizeKeyword(d.targetKeyword) === normalizeKeyword(page.targetKeyword))) {
    return "high";
  }

  const similar = existingPages.filter(
    (other) =>
      other.id !== page.id &&
      other.clusterId === page.clusterId &&
      (slugSimilarity(other.slug, page.slug) || h1Similarity(other.h1, page.h1)),
  );

  if (similar.length >= 2) return "high";
  if (similar.length === 1) return "medium";

  const keywordOverlap = existingPages.filter((other) => {
    if (other.id === page.id) return false;
    const secondary = page.secondaryKeywords ?? [];
    const otherSecondary = other.secondaryKeywords ?? [];
    return secondary.some((k) => normalizeKeyword(other.targetKeyword) === normalizeKeyword(k)) ||
      otherSecondary.some((k) => normalizeKeyword(k) === normalizeKeyword(page.targetKeyword));
  });

  if (keywordOverlap.length >= 2) return "medium";
  return "low";
}

export function suggestCanonicalTarget(
  page: ProgrammaticSEOPage,
  existingPages: ProgrammaticSEOPage[],
): string | undefined {
  const duplicates = detectDuplicateIntent(page, existingPages);
  const published = duplicates.find((d) => d.status === "published" || d.status === "approved");
  if (published) return published.url;

  const sameCluster = existingPages
    .filter((p) => p.clusterId === page.clusterId && p.id !== page.id)
    .sort((a, b) => (a.url.length < b.url.length ? -1 : 1));
  return sameCluster[0]?.url;
}

export function suggestMergePages(
  page: ProgrammaticSEOPage,
  existingPages: ProgrammaticSEOPage[],
): ProgrammaticSEOPage[] {
  return detectDuplicateIntent(page, existingPages).filter((d) =>
    h1Similarity(d.h1, page.h1),
  );
}

export function applyCannibalizationGuard(
  page: ProgrammaticSEOPage,
  existingPages: ProgrammaticSEOPage[],
): ProgrammaticSEOPage {
  const risk = detectCannibalizationRisk(page, existingPages);
  const canonical = risk === "high" ? suggestCanonicalTarget(page, existingPages) : undefined;

  return {
    ...page,
    priority: { ...page.priority, cannibalizationRisk: risk },
    indexing: {
      ...page.indexing,
      indexable: risk === "high" ? false : page.indexing.indexable,
      noindexReason:
        risk === "high"
          ? `Cannibalization risk — canonical to ${canonical ?? "primary page"}`
          : page.indexing.noindexReason,
      canonicalUrl: canonical ? `${SITE_URL}${canonical}` : page.indexing.canonicalUrl,
    },
  };
}
