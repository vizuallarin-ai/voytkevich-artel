import type { CMSContentItem } from "@/types/content-cms";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import { RECOMMENDATION_EXCLUSION_RULES } from "@/data/recommendation-exclusion-rules";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";

export type EligibilityCheckInput = {
  candidate: RecommendationCandidate;
  context: RecommendationContext;
  cmsItem?: CMSContentItem | null;
  allowedTypes?: string[];
};

function isSafeUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (!url.startsWith("/") && !url.startsWith("https://stroistroy.ru")) return false;
  if (/javascript:/i.test(url) || /data:/i.test(url)) return false;
  return true;
}

export function checkCandidateEligibility(input: EligibilityCheckInput): {
  eligible: boolean;
  violations: string[];
} {
  const { candidate, context, cmsItem, allowedTypes } = input;
  const violations: string[] = [];

  const status = cmsItem?.status;
  let indexable = candidate.eligibility.indexable;
  let canonical = candidate.eligibility.canonical;

  if (cmsItem) {
    const page = cmsItemToIndexablePage(cmsItem);
    const decision = evaluateIndexability(page);
    indexable = decision.indexable;
    canonical = Boolean(decision.canonicalUrl && decision.canonicalUrl === (cmsItem.indexing.canonicalUrl ?? cmsItem.url));
  }

  const isCurrentPage =
    Boolean(context.currentPage?.contentItemId && candidate.contentItemId === context.currentPage.contentItemId) ||
    Boolean(context.currentPage?.canonicalUrl && candidate.targetUrl === context.currentPage.canonicalUrl);

  const isDismissed = candidate.contentItemId
    ? context.dismissedRecommendationIds.includes(candidate.contentItemId) ||
      context.dismissedRecommendationIds.includes(candidate.id)
    : context.dismissedRecommendationIds.includes(candidate.id);

  const ruleInput = {
    status,
    indexable,
    canonical,
    available: candidate.eligibility.available,
    isCurrentPage,
    isDismissed,
    isRedirect: cmsItem?.status === "archived",
    isBroken: !isSafeUrl(candidate.targetUrl),
    locationConflict: false,
    recommendationTypeMismatch: allowedTypes ? !allowedTypes.includes(candidate.type) : false,
    missingRequiredAttribute: !candidate.title || (!candidate.contentItemId && !candidate.targetUrl),
  };

  for (const rule of RECOMMENDATION_EXCLUSION_RULES) {
    if (rule.detect(ruleInput)) {
      violations.push(rule.id);
    }
  }

  if (status === "draft" || status === "review" || status === "rejected") {
    violations.push("unpublished-status");
  }

  return { eligible: violations.length === 0, violations };
}

export function filterEligibleCandidates(
  candidates: RecommendationCandidate[],
  context: RecommendationContext,
  options?: { cmsItems?: Map<string, CMSContentItem>; allowedTypes?: string[] },
): RecommendationCandidate[] {
  return candidates.filter((candidate) => {
    const cmsItem = candidate.contentItemId ? options?.cmsItems?.get(candidate.contentItemId) : undefined;
    return checkCandidateEligibility({
      candidate,
      context,
      cmsItem,
      allowedTypes: options?.allowedTypes,
    }).eligible;
  });
}

export async function isCMSItemRecommendable(contentItemId: string): Promise<boolean> {
  const decision = await cmsIndexationIntegration.recalculateCMSIndexability(contentItemId);
  if (!decision) return false;
  return decision.indexable;
}

export const recommendationEligibilityService = {
  checkCandidateEligibility,
  filterEligibleCandidates,
  isCMSItemRecommendable,
};
