import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import type { ContentDiffResult } from "@/lib/content-refresh/content-diff-service";

export type ProtectedElement = {
  id: string;
  label: string;
  category:
    | "url"
    | "canonical"
    | "intent"
    | "query"
    | "cta"
    | "internal-link"
    | "structured-data"
    | "expert-quote"
    | "fact"
    | "conversion"
    | "indexable-section"
    | "image";
  reason: string;
  requiresApproval: true;
};

export function detectProtectedElements(
  contentItem: CMSContentItem,
  analytics?: ContentPerformanceSnapshot,
): ProtectedElement[] {
  const elements: ProtectedElement[] = [];

  elements.push({
    id: "url",
    label: `URL: ${contentItem.url}`,
    category: "url",
    reason: "URL changes require migration strategy",
    requiresApproval: true,
  });

  if (contentItem.indexing.canonicalUrl) {
    elements.push({
      id: "canonical",
      label: `Canonical: ${contentItem.indexing.canonicalUrl}`,
      category: "canonical",
      reason: "Canonical must not change without SEO approval",
      requiresApproval: true,
    });
  }

  if (contentItem.seo.targetKeyword) {
    elements.push({
      id: "primary-query",
      label: `Primary query: ${contentItem.seo.targetKeyword}`,
      category: "query",
      reason: "Strong ranking query protection",
      requiresApproval: true,
    });
  }

  if (contentItem.seo.targetKeyword) {
    elements.push({
      id: "search-intent",
      label: `Search intent for: ${contentItem.seo.targetKeyword}`,
      category: "intent",
      reason: "Primary search intent must be preserved",
      requiresApproval: true,
    });
  }

  if ((analytics?.conversions.leads ?? 0) > 0) {
    elements.push({
      id: "lead-blocks",
      label: "Lead-generating content blocks",
      category: "conversion",
      reason: "Page generates leads",
      requiresApproval: true,
    });
  }

  if (contentItem.indexing.indexable) {
    elements.push({
      id: "indexable-content",
      label: "Indexable content sections",
      category: "indexable-section",
      reason: "Indexability must be preserved",
      requiresApproval: true,
    });
  }

  const relatedCount =
    (contentItem.related.projects?.length ?? 0) +
    (contentItem.related.technicalArticles?.length ?? 0);
  if (relatedCount > 0) {
    elements.push({
      id: "internal-links",
      label: `${relatedCount} configured internal links`,
      category: "internal-link",
      reason: "Important internal linking structure",
      requiresApproval: true,
    });
  }

  if (contentItem.quality.requiresFactCheck) {
    elements.push({
      id: "verified-facts",
      label: "Fact-checked content",
      category: "fact",
      reason: "Verified facts must not change without source",
      requiresApproval: true,
    });
  }

  return elements;
}

export function validateProtectedElements(
  before: CMSContentItem,
  after: Partial<CMSContentItem>,
  protectedElements: string[],
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (protectedElements.some((p) => p.startsWith("URL:")) && after.url && after.url !== before.url) {
    violations.push("URL changed");
  }

  if (
    protectedElements.some((p) => p.startsWith("Canonical:")) &&
    after.indexing?.canonicalUrl &&
    after.indexing.canonicalUrl !== before.indexing.canonicalUrl
  ) {
    violations.push("Canonical changed");
  }

  if (
    protectedElements.some((p) => p.startsWith("Primary query:")) &&
    after.seo?.targetKeyword &&
    after.seo.targetKeyword !== before.seo.targetKeyword
  ) {
    violations.push("Primary query changed");
  }

  return { valid: violations.length === 0, violations };
}

export function detectProtectedElementRegression(diff: ContentDiffResult): string[] {
  const regressions: string[] = [];
  if (diff.canonical.changed) regressions.push("Canonical modified");
  if (diff.metadata.removed.length > 0) regressions.push("Metadata removed");
  if (diff.internalLinks.removed.length > 0) regressions.push("Internal links removed");
  if (diff.headings.removed.some((h) => h.level === 1)) regressions.push("H1 removed or changed");
  if (diff.protectedElementsAffected.length > 0) {
    regressions.push(...diff.protectedElementsAffected);
  }
  return regressions;
}

export function requireAdditionalApprovalForProtectedChanges(
  diff: ContentDiffResult,
): { required: boolean; reasons: string[]; requiresManualApproval: true } {
  const reasons = detectProtectedElementRegression(diff);
  return {
    required: reasons.length > 0 || diff.riskLevel === "high",
    reasons,
    requiresManualApproval: true,
  };
}

export const protectedElementsService = {
  detectProtectedElements,
  validateProtectedElements,
  detectProtectedElementRegression,
  requireAdditionalApprovalForProtectedChanges,
};
