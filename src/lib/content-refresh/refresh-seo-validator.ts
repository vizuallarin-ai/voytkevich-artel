import type { CMSContentItem } from "@/types/content-cms";
import { contentDiffService } from "@/lib/content-refresh/content-diff-service";

export type SEOValidationReport = {
  valid: boolean;
  blockingErrors: string[];
  warnings: string[];
  checks: { name: string; passed: boolean; message: string }[];
};

type ContentLike = Partial<CMSContentItem>;

export function validateSearchIntentPreservation(
  before: ContentLike,
  after: ContentLike,
): { passed: boolean; message: string } {
  if (before.seo?.targetKeyword && after.seo?.targetKeyword) {
    if (before.seo.targetKeyword !== after.seo.targetKeyword) {
      return { passed: false, message: "Primary target keyword changed" };
    }
  }
  return { passed: true, message: "Search intent preserved" };
}

export function validateTitleChange(
  before: ContentLike,
  after: ContentLike,
): { passed: boolean; message: string } {
  if (!after.seoTitle && !after.title) {
    return { passed: false, message: "Title removed" };
  }
  const title = after.seoTitle ?? after.title ?? "";
  if (title.length > 70) {
    return { passed: false, message: "Title exceeds recommended length" };
  }
  return { passed: true, message: "Title valid" };
}

export function validateHeadingStructure(
  before: ContentLike,
  after: ContentLike,
): { passed: boolean; message: string } {
  const diff = contentDiffService.compareHeadings(before, after);
  if (diff.removed.some((h) => h.level === 1)) {
    return { passed: false, message: "H1 removed or changed" };
  }
  return { passed: true, message: "Heading structure acceptable" };
}

export function validateCanonicalPreservation(
  before: ContentLike,
  after: ContentLike,
): { passed: boolean; message: string } {
  const diff = contentDiffService.compareCanonical(before, after);
  if (diff.changed) {
    return { passed: false, message: "Canonical URL changed" };
  }
  return { passed: true, message: "Canonical preserved" };
}

export function validateIndexabilityPreservation(
  before: ContentLike,
  after: ContentLike,
): { passed: boolean; message: string } {
  if (before.indexing?.indexable && after.indexing?.indexable === false) {
    return { passed: false, message: "Page became non-indexable" };
  }
  return { passed: true, message: "Indexability preserved" };
}

export function validateInternalLinks(
  before: ContentLike,
  after: ContentLike,
): { passed: boolean; message: string } {
  const diff = contentDiffService.compareInternalLinks(before, after);
  if (diff.removed.length > 3) {
    return { passed: false, message: "Too many internal links removed" };
  }
  return { passed: true, message: "Internal links acceptable" };
}

export function validateStructuredData(
  before: ContentLike,
  after: ContentLike,
): { passed: boolean; message: string } {
  const diff = contentDiffService.compareStructuredData(before, after);
  if (diff.removed.length > diff.added.length) {
    return { passed: false, message: "Structured data reduced" };
  }
  return { passed: true, message: "Structured data acceptable" };
}

type ContentWithBody = Partial<CMSContentItem> & { body?: string };

export function validateKeywordStuffing(after: ContentLike): { passed: boolean; message: string } {
  const keyword = after.seo?.targetKeyword;
  const body = (after as ContentWithBody).body ?? "";
  if (!keyword) return { passed: true, message: "No keyword to check" };

  const count = (body.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) ?? []).length;
  const words = body.split(/\s+/).length || 1;
  const density = count / words;

  if (density > 0.04) {
    return { passed: false, message: "Possible keyword stuffing detected" };
  }
  return { passed: true, message: "Keyword density acceptable" };
}

export function validateContentUniqueness(
  after: ContentLike,
  existingContent: ContentLike[],
): { passed: boolean; message: string } {
  const title = after.title ?? after.seoTitle ?? "";
  const duplicate = existingContent.find(
    (e) => e.id !== after.id && (e.title === title || e.seoTitle === after.seoTitle),
  );
  if (duplicate) {
    return { passed: false, message: "Duplicate title detected" };
  }
  return { passed: true, message: "Content appears unique" };
}

export function validateCannibalizationAfterRefresh(
  after: ContentLike,
  existingContent: ContentLike[],
): { passed: boolean; message: string } {
  const keyword = after.seo?.targetKeyword;
  if (!keyword) return { passed: true, message: "No target keyword" };

  const conflicts = existingContent.filter(
    (e) => e.id !== after.id && e.seo?.targetKeyword === keyword && e.indexing?.indexable,
  );
  if (conflicts.length > 0) {
    return { passed: false, message: `Cannibalization risk with ${conflicts.length} page(s)` };
  }
  return { passed: true, message: "No cannibalization detected" };
}

export function buildRefreshSEOValidationReport(
  before: ContentLike,
  after: ContentLike,
  existingContent: ContentLike[] = [],
): SEOValidationReport {
  const checks = [
    { name: "search-intent", ...validateSearchIntentPreservation(before, after) },
    { name: "title", ...validateTitleChange(before, after) },
    { name: "headings", ...validateHeadingStructure(before, after) },
    { name: "canonical", ...validateCanonicalPreservation(before, after) },
    { name: "indexability", ...validateIndexabilityPreservation(before, after) },
    { name: "internal-links", ...validateInternalLinks(before, after) },
    { name: "structured-data", ...validateStructuredData(before, after) },
    { name: "keyword-stuffing", ...validateKeywordStuffing(after) },
    { name: "uniqueness", ...validateContentUniqueness(after, existingContent) },
    { name: "cannibalization", ...validateCannibalizationAfterRefresh(after, existingContent) },
  ];

  const blockingErrors = checks.filter((c) => !c.passed).map((c) => c.message);
  const warnings = checks
    .filter((c) => c.passed && c.message.includes("acceptable"))
    .map((c) => c.message);

  return {
    valid: blockingErrors.length === 0,
    blockingErrors,
    warnings,
    checks: checks.map(({ name, passed, message }) => ({ name, passed, message })),
  };
}

export const refreshSeoValidator = {
  validateSearchIntentPreservation,
  validateTitleChange,
  validateHeadingStructure,
  validateCanonicalPreservation,
  validateIndexabilityPreservation,
  validateInternalLinks,
  validateStructuredData,
  validateKeywordStuffing,
  validateContentUniqueness,
  validateCannibalizationAfterRefresh,
  buildRefreshSEOValidationReport,
};
