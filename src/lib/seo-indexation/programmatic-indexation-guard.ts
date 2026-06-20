import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import type { IndexabilityReason } from "@/types/seo-indexation";
import { getPageTypeIndexationRule } from "@/data/seo-indexation-rules";

export type ProgrammaticIndexationGuardResult = {
  allowed: boolean;
  reason?: IndexabilityReason;
  message: string;
  requiresApproval: boolean;
  requiresKeywordValidation: boolean;
};

export function evaluateProgrammaticIndexation(page: IndexablePageInput): ProgrammaticIndexationGuardResult {
  const isProgrammatic =
    page.kind === "programmatic-page" ||
    page.pageType === "programmatic-page" ||
    page.source?.origin === "programmatic" ||
    page.source?.origin === "taxonomy";

  if (!isProgrammatic) {
    return {
      allowed: true,
      message: "Не programmatic-страница",
      requiresApproval: false,
      requiresKeywordValidation: false,
    };
  }

  const rule = page.pageType ? getPageTypeIndexationRule(page.pageType) : undefined;

  if (!rule) {
    return {
      allowed: page.status === "published" || page.status === "approved",
      reason: page.status === "published" ? "published-ok" : "approved-awaiting-publish",
      message: "Programmatic без явного pageType — только approved/published",
      requiresApproval: true,
      requiresKeywordValidation: false,
    };
  }

  if (rule.requiresKeywordValidation && page.status === "needs-keyword-data") {
    return {
      allowed: false,
      reason: "region-keyword-validation",
      message: rule.message,
      requiresApproval: rule.requiresApproval,
      requiresKeywordValidation: true,
    };
  }

  if (!rule.indexableByDefault && page.status !== "published" && page.status !== "approved") {
    return {
      allowed: false,
      reason: rule.reason ?? "page-type-noindex-default",
      message: rule.message,
      requiresApproval: rule.requiresApproval,
      requiresKeywordValidation: !!rule.requiresKeywordValidation,
    };
  }

  return {
    allowed: true,
    reason: page.status === "published" ? "published-ok" : "approved-awaiting-publish",
    message: rule.message,
    requiresApproval: rule.requiresApproval,
    requiresKeywordValidation: !!rule.requiresKeywordValidation,
  };
}

export function shouldAllowProgrammaticIndexation(page: IndexablePageInput): boolean {
  return evaluateProgrammaticIndexation(page).allowed;
}
