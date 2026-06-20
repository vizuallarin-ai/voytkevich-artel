import type { CMSContentItem } from "@/types/content-cms";
import type { ContentRefreshReason } from "@/types/content-refresh";

export type DiagnosisCategory =
  | "fact"
  | "signal"
  | "hypothesis"
  | "assumption"
  | "unknown"
  | "recommended-check";

export type DiagnosisFinding = {
  area: string;
  category: DiagnosisCategory;
  summary: string;
  severity: "none" | "low" | "medium" | "high";
  evidence?: string[];
};

export type ContentDiagnosisReport = {
  contentItemId: string;
  url: string;
  findings: DiagnosisFinding[];
  suggestedReasons: ContentRefreshReason[];
  generatedAt: string;
};

export type DiagnosisContext = {
  analyticsSummary?: string[];
  relatedItems?: CMSContentItem[];
};

function finding(
  area: string,
  category: DiagnosisCategory,
  summary: string,
  severity: DiagnosisFinding["severity"] = "medium",
  evidence?: string[],
): DiagnosisFinding {
  return { area, category, summary, severity, evidence };
}

export function diagnoseSearchIntentMatch(contentItem: CMSContentItem): DiagnosisFinding[] {
  const findings: DiagnosisFinding[] = [];
  if (!contentItem.seo.targetKeyword) {
    findings.push(
      finding("search-intent", "unknown", "Target keyword not defined", "medium"),
    );
  } else {
    findings.push(
      finding(
        "search-intent",
        "assumption",
        `Target keyword: ${contentItem.seo.targetKeyword}`,
        "low",
      ),
    );
  }
  if (contentItem.seo.thinContentRisk === "high") {
    findings.push(
      finding(
        "search-intent",
        "hypothesis",
        "Thin content may not fully match search intent",
        "high",
      ),
    );
  }
  return findings;
}

export function diagnoseContentCompleteness(contentItem: CMSContentItem): DiagnosisFinding[] {
  const findings: DiagnosisFinding[] = [];
  if (!contentItem.h1) {
    findings.push(finding("completeness", "fact", "H1 is missing", "medium"));
  }
  if (!contentItem.seoDescription) {
    findings.push(finding("completeness", "fact", "Meta description is missing", "medium"));
  }
  if (contentItem.seo.thinContentRisk === "high") {
    findings.push(finding("completeness", "signal", "Thin content risk flagged", "high"));
  }
  return findings;
}

export function diagnoseExpertise(contentItem: CMSContentItem): DiagnosisFinding[] {
  const findings: DiagnosisFinding[] = [];
  if (contentItem.quality.requiresExpertReview) {
    findings.push(
      finding("expertise", "recommended-check", "Expert review required", "high"),
    );
  }
  if (contentItem.kind === "technical-article") {
    findings.push(
      finding("expertise", "recommended-check", "Technical article needs expert validation", "medium"),
    );
  }
  return findings;
}

export function diagnoseFreshness(contentItem: CMSContentItem): DiagnosisFinding[] {
  const updatedAt = contentItem.workflow.updatedAt ?? contentItem.updatedAt;
  if (!updatedAt) {
    return [finding("freshness", "unknown", "Last update date unknown", "low")];
  }
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (86400000));
  if (days > 365) {
    return [
      finding("freshness", "signal", `Content not updated for ${days} days`, "medium"),
    ];
  }
  return [finding("freshness", "fact", `Last updated ${days} days ago`, "none")];
}

export function diagnoseMetadata(contentItem: CMSContentItem): DiagnosisFinding[] {
  const findings: DiagnosisFinding[] = [];
  if (!contentItem.seoTitle) {
    findings.push(finding("metadata", "fact", "SEO title missing", "medium"));
  }
  if (!contentItem.seoDescription) {
    findings.push(finding("metadata", "fact", "SEO description missing", "medium"));
  }
  if (contentItem.seoTitle && contentItem.seoTitle.length > 60) {
    findings.push(finding("metadata", "signal", "SEO title may be too long", "low"));
  }
  return findings;
}

export function diagnoseInternalLinks(contentItem: CMSContentItem): DiagnosisFinding[] {
  const related = contentItem.related;
  const count =
    (related.projects?.length ?? 0) +
    (related.technicalArticles?.length ?? 0) +
    (related.editorialContent?.length ?? 0) +
    (related.programmaticPages?.length ?? 0);

  if (count === 0) {
    return [
      finding("internal-links", "signal", "No related internal links configured", "medium"),
    ];
  }
  return [finding("internal-links", "fact", `${count} related links configured`, "none")];
}

export function diagnoseCTA(contentItem: CMSContentItem): DiagnosisFinding[] {
  if (contentItem.kind === "lead-magnet" || contentItem.kind === "landing-page") {
    return [finding("cta", "recommended-check", "Verify CTA placement and conversion path", "medium")];
  }
  return [];
}

export function diagnoseVisuals(contentItem: CMSContentItem): DiagnosisFinding[] {
  return [
    finding("visuals", "unknown", "Visual freshness requires manual review", "low"),
  ];
}

export function diagnoseStructuredData(contentItem: CMSContentItem): DiagnosisFinding[] {
  if (contentItem.indexing.indexable) {
    return [
      finding("structured-data", "recommended-check", "Validate structured data after changes", "low"),
    ];
  }
  return [];
}

export function diagnoseCannibalization(contentItem: CMSContentItem): DiagnosisFinding[] {
  if (contentItem.seo.cannibalizationRisk === "high") {
    return [
      finding("cannibalization", "signal", "High cannibalization risk", "high"),
    ];
  }
  if (contentItem.seo.cannibalizationRisk === "medium") {
    return [
      finding("cannibalization", "hypothesis", "Possible keyword overlap with other pages", "medium"),
    ];
  }
  return [];
}

export function diagnoseTechnicalSEO(contentItem: CMSContentItem): DiagnosisFinding[] {
  const findings: DiagnosisFinding[] = [];
  if (!contentItem.indexing.indexable) {
    findings.push(
      finding(
        "technical-seo",
        "fact",
        `Not indexable: ${contentItem.indexing.noindexReason ?? "unknown reason"}`,
        "high",
      ),
    );
  }
  if (contentItem.indexing.canonicalUrl && contentItem.indexing.canonicalUrl !== contentItem.url) {
    findings.push(
      finding("technical-seo", "fact", "Canonical URL differs from page URL", "medium"),
    );
  }
  return findings;
}

export function diagnoseContentItem(
  contentItem: CMSContentItem,
  context: DiagnosisContext = {},
): DiagnosisFinding[] {
  return [
    ...diagnoseSearchIntentMatch(contentItem),
    ...diagnoseContentCompleteness(contentItem),
    ...diagnoseExpertise(contentItem),
    ...diagnoseFreshness(contentItem),
    ...diagnoseMetadata(contentItem),
    ...diagnoseInternalLinks(contentItem),
    ...diagnoseCTA(contentItem),
    ...diagnoseVisuals(contentItem),
    ...diagnoseStructuredData(contentItem),
    ...diagnoseCannibalization(contentItem),
    ...diagnoseTechnicalSEO(contentItem),
    ...(context.analyticsSummary ?? []).map((s) =>
      finding("analytics", "signal", s, "medium"),
    ),
  ];
}

export function buildContentDiagnosisReport(
  contentItem: CMSContentItem,
  context: DiagnosisContext = {},
): ContentDiagnosisReport {
  const findings = diagnoseContentItem(contentItem, context);
  const suggestedReasons: ContentRefreshReason[] = [];

  if (findings.some((f) => f.area === "freshness" && f.severity !== "none")) {
    suggestedReasons.push("outdated-information");
  }
  if (findings.some((f) => f.area === "cannibalization" && f.severity === "high")) {
    suggestedReasons.push("cannibalization");
  }
  if (findings.some((f) => f.area === "internal-links" && f.severity !== "none")) {
    suggestedReasons.push("weak-internal-linking");
  }
  if (findings.some((f) => f.area === "metadata" && f.severity !== "none")) {
    suggestedReasons.push("metadata-opportunity");
  }
  if (findings.some((f) => f.area === "expertise" && f.severity === "high")) {
    suggestedReasons.push("missing-expertise");
  }
  if (findings.some((f) => f.area === "technical-seo" && f.severity === "high")) {
    suggestedReasons.push("technical-seo-issue");
  }

  return {
    contentItemId: contentItem.id,
    url: contentItem.url,
    findings,
    suggestedReasons,
    generatedAt: new Date().toISOString(),
  };
}

export const contentDiagnosisService = {
  diagnoseContentItem,
  diagnoseSearchIntentMatch,
  diagnoseContentCompleteness,
  diagnoseExpertise,
  diagnoseFreshness,
  diagnoseMetadata,
  diagnoseInternalLinks,
  diagnoseCTA,
  diagnoseVisuals,
  diagnoseStructuredData,
  diagnoseCannibalization,
  diagnoseTechnicalSEO,
  buildContentDiagnosisReport,
};
