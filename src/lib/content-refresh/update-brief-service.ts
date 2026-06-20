import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { ContentRefreshCandidate } from "@/types/content-refresh";
import type { ContentUpdateBrief } from "@/types/content-update-brief";
import type { ContentDiagnosisReport } from "@/lib/content-refresh/content-diagnosis-service";
import { refreshSignalValidator } from "@/lib/content-refresh/refresh-signal-validator";
import { protectedElementsService } from "@/lib/content-refresh/protected-elements-service";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export function identifyProtectedElements(contentItem: CMSContentItem): string[] {
  return protectedElementsService.detectProtectedElements(contentItem).map((e) => e.label);
}

export function defineRefreshSuccessMetrics(candidate: ContentRefreshCandidate): string[] {
  const metrics: string[] = [];
  if (candidate.reasons.includes("high-impressions-low-ctr")) {
    metrics.push("search.ctr");
  }
  if (candidate.reasons.includes("conversion-decline") || candidate.reasons.includes("high-traffic-low-conversion")) {
    metrics.push("conversions.leads", "conversions.qualifiedLeads");
  }
  if (candidate.reasons.includes("content-decay") || candidate.reasons.includes("search-decline")) {
    metrics.push("search.impressions", "traffic.pageViews");
  }
  if (metrics.length === 0) metrics.push("traffic.pageViews", "conversions.leads");
  return metrics;
}

export function defineRefreshGuardrails(candidate: ContentRefreshCandidate): string[] {
  return [
    "search.indexed",
    "search.clicks",
    "conversions.qualifiedLeads",
    "indexability",
  ];
}

export function defineRequiredReviews(
  candidate: ContentRefreshCandidate,
  contentItem?: CMSContentItem,
): ContentUpdateBrief["requiredReviews"] {
  const reviews = {
    editorial: true,
    seo: false,
    expert: false,
    legal: false,
  };

  if (
    candidate.reasons.includes("metadata-opportunity") ||
    candidate.reasons.includes("weak-search-intent-match") ||
    candidate.reasons.includes("cannibalization")
  ) {
    reviews.seo = true;
  }

  if (
    candidate.reasons.includes("missing-expertise") ||
    contentItem?.quality.requiresExpertReview ||
    contentItem?.kind === "technical-article"
  ) {
    reviews.expert = true;
  }

  if (contentItem?.quality.requiresFactCheck || contentItem?.quality.requiresSource) {
    reviews.expert = true;
  }

  return reviews;
}

export function generateUpdateBrief(
  candidate: ContentRefreshCandidate,
  diagnosis: ContentDiagnosisReport,
  contentItem: CMSContentItem,
  createdBy = "system",
): ContentUpdateBrief {
  const brief: ContentUpdateBrief = {
    id: randomUUID(),
    contentItemId: candidate.contentItemId,
    refreshCandidateId: candidate.id,
    objective: `Address ${candidate.reasons.join(", ")} for ${contentItem.title}`,
    hypothesis: `Targeted updates will improve ${defineRefreshSuccessMetrics(candidate).join(", ")} without harming guardrails`,
    currentProblem: {
      summary: refreshSignalValidator.explainRefreshSignal(candidate),
      evidence: [
        ...candidate.evidence.map(
          (e) => `${e.metric}: ${e.currentValue ?? "n/a"} (source: ${e.source})`,
        ),
        ...diagnosis.findings
          .filter((f) => f.category === "fact" || f.category === "signal")
          .map((f) => `${f.area}: ${f.summary}`),
      ],
      unknowns: diagnosis.findings
        .filter((f) => f.category === "unknown")
        .map((f) => f.summary),
    },
    targetAudience: "Potential clients in Irkutsk region seeking construction services",
    searchIntent: contentItem.seo.targetKeyword
      ? `Informational/commercial intent for "${contentItem.seo.targetKeyword}"`
      : "Requires manual intent classification",
    primaryQuery: contentItem.seo.targetKeyword ?? null,
    secondaryQueries: contentItem.seo.secondaryKeywords ?? [],
    proposedChanges: {
      sectionsToRewrite: diagnosis.findings
        .filter((f) => f.severity === "high")
        .map((f) => f.area),
      factsToVerify: diagnosis.findings
        .filter((f) => f.category === "recommended-check")
        .map((f) => f.summary),
    },
    protectedElements: identifyProtectedElements(contentItem),
    successMetrics: defineRefreshSuccessMetrics(candidate),
    guardrailMetrics: defineRefreshGuardrails(candidate),
    requiredReviews: defineRequiredReviews(candidate, contentItem),
    createdAt: new Date().toISOString(),
    createdBy,
  };

  refreshStore.saveBrief(brief);
  refreshAnalytics.trackRefreshBriefCreated({
    contentItemId: brief.contentItemId,
    candidateId: candidate.id,
    briefId: brief.id,
  });

  const updatedCandidate = {
    ...candidate,
    status: "brief-created" as const,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveCandidate(updatedCandidate);

  return brief;
}

export function validateUpdateBrief(brief: ContentUpdateBrief): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!brief.objective.trim()) errors.push("Objective is required");
  if (!brief.hypothesis.trim()) errors.push("Hypothesis is required");
  if (brief.currentProblem.evidence.length === 0) errors.push("Brief must contain evidence");
  if (brief.protectedElements.length === 0) errors.push("Brief must define protected elements");
  if (brief.successMetrics.length === 0) errors.push("Success metrics are required");
  if (brief.guardrailMetrics.length === 0) errors.push("Guardrail metrics are required");
  return { valid: errors.length === 0, errors };
}

export function estimateRefreshEffort(brief: ContentUpdateBrief): "low" | "medium" | "high" {
  const changes = brief.proposedChanges;
  const count =
    (changes.sectionsToRewrite?.length ?? 0) +
    (changes.sectionsToAdd?.length ?? 0) +
    (changes.sectionsToRemove?.length ?? 0) +
    (changes.factsToVerify?.length ?? 0);

  if (brief.requiredReviews.expert || brief.requiredReviews.legal) return "high";
  if (count > 4 || brief.requiredReviews.seo) return "medium";
  return count > 2 ? "medium" : "low";
}

export function estimateRefreshPotential(brief: ContentUpdateBrief): "low" | "medium" | "high" {
  if (brief.successMetrics.includes("conversions.qualifiedLeads")) return "high";
  if (brief.successMetrics.includes("search.ctr")) return "high";
  if (brief.proposedChanges.sectionsToRewrite?.length) return "medium";
  return "low";
}

export async function sendUpdateBriefToCMS(
  brief: ContentUpdateBrief,
): Promise<{ attached: boolean; message: string }> {
  refreshStore.logAudit({
    action: "update_brief_attached",
    entityType: "brief",
    entityId: brief.id,
    contentItemId: brief.contentItemId,
  });
  return {
    attached: true,
    message: `Brief ${brief.id} queued for CMS review — requires human approval`,
  };
}

export const updateBriefService = {
  generateUpdateBrief,
  validateUpdateBrief,
  identifyProtectedElements,
  defineRefreshSuccessMetrics,
  defineRefreshGuardrails,
  defineRequiredReviews,
  estimateRefreshEffort,
  estimateRefreshPotential,
  sendUpdateBriefToCMS,
};
