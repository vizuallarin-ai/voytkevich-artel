import type { Metadata } from "next";
import type { IndexabilityDecision } from "@/types/seo-indexation";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";
import { buildRobotsDirective, robotsDirectiveToMetaContent } from "@/lib/seo-indexation/robots-directive-service";
import { resolveCanonicalUrl, validateCanonicalUrl } from "@/lib/seo-indexation/canonical-resolver";

export type IndexationMetadataIssue = {
  type: "robots-canonical-mismatch" | "missing-canonical" | "noindex-with-sitemap";
  message: string;
};

export type IndexationMetadataResult = {
  metadata: Pick<Metadata, "robots" | "alternates">;
  issues: IndexationMetadataIssue[];
  consistent: boolean;
};

export function buildIndexationMetadata(
  page: IndexablePageInput,
  decision?: IndexabilityDecision,
): IndexationMetadataResult {
  const indexDecision = decision ?? evaluateIndexability(page);
  const robots = buildRobotsDirective(indexDecision);
  const canonical = resolveCanonicalUrl(page);
  const issues: IndexationMetadataIssue[] = [];

  if (!indexDecision.canonicalUrl && page.seo.cannibalizationRisk === "high") {
    issues.push({ type: "missing-canonical", message: "Canonical missing for high cannibalization risk" });
  }

  const canonicalValidation = validateCanonicalUrl(canonical);
  if (!canonicalValidation.valid) {
    issues.push({
      type: "robots-canonical-mismatch",
      message: canonicalValidation.issues.join("; "),
    });
  }

  if (!indexDecision.robots.index && indexDecision.sitemap) {
    issues.push({ type: "noindex-with-sitemap", message: "noindex page marked for sitemap" });
  }

  return {
    metadata: {
      robots: {
        index: robots.index,
        follow: robots.follow,
      },
      alternates: { canonical },
    },
    issues,
    consistent: issues.length === 0,
  };
}

export function ensureRobotsCanonicalConsistency(
  page: IndexablePageInput,
  existingMetadata?: Metadata,
): IndexationMetadataResult {
  const result = buildIndexationMetadata(page);

  if (existingMetadata?.alternates?.canonical) {
    const existing = String(existingMetadata.alternates.canonical);
    const resolved = resolveCanonicalUrl(page);
    if (existing !== resolved) {
      result.issues.push({
        type: "robots-canonical-mismatch",
        message: `Metadata canonical ${existing} != resolved ${resolved}`,
      });
      result.consistent = false;
    }
  }

  return result;
}

export function robotsMetaContent(page: IndexablePageInput): string {
  const decision = evaluateIndexability(page);
  return robotsDirectiveToMetaContent(buildRobotsDirective(decision));
}
