import type { CMSContentItem } from "@/types/content-cms";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import type { IndexabilityReason } from "@/types/seo-indexation";
import { cannibalizationBlockLevels } from "@/data/seo-indexation-rules";
import {
  checkPriorityCannibalization,
  suggestMergeOrCanonical,
} from "@/lib/content-prioritization/cannibalization-priority-check";

export type CannibalizationIndexationGuardResult = {
  blocked: boolean;
  reason?: IndexabilityReason;
  risk: "high" | "medium" | "low";
  matches: string[];
  suggestions: string[];
  message: string;
};

export function evaluateCannibalizationIndexation(
  page: IndexablePageInput,
  existingItems: CMSContentItem[] = [],
): CannibalizationIndexationGuardResult {
  const risk = page.seo.cannibalizationRisk ?? "low";

  if (existingItems.length > 0) {
    const cmsLike = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      kind: page.kind === "static-page" || page.kind === "taxonomy-page" ? "programmatic-page" : page.kind,
      clusterId: undefined,
      seo: {
        targetKeyword: page.seo.targetKeyword,
        cannibalizationRisk: page.seo.cannibalizationRisk,
      },
    } as CMSContentItem;

    const check = checkPriorityCannibalization(cmsLike, existingItems);
    const suggestions = suggestMergeOrCanonical(cmsLike, existingItems);
    const blocked = cannibalizationBlockLevels.includes(
      check.risk as (typeof cannibalizationBlockLevels)[number],
    );

    return {
      blocked,
      reason: check.risk === "high" ? "cannibalization-high" : check.risk === "medium" ? "cannibalization-medium" : undefined,
      risk: check.risk,
      matches: check.matches,
      suggestions,
      message: blocked
        ? "Высокий риск каннибализации — индексация заблокирована"
        : check.risk === "medium"
          ? "Средний риск каннибализации — проверьте canonical"
          : "Риск каннибализации в норме",
    };
  }

  const blocked = cannibalizationBlockLevels.includes(
    risk as (typeof cannibalizationBlockLevels)[number],
  );

  return {
    blocked,
    reason:
      risk === "high" ? "cannibalization-high" : risk === "medium" ? "cannibalization-medium" : undefined,
    risk,
    matches: [],
    suggestions: [],
    message: blocked
      ? "Высокий риск каннибализации — индексация заблокирована"
      : risk === "medium"
        ? "Средний риск каннибализации — проверьте canonical"
        : "Риск каннибализации в норме",
  };
}

export function shouldBlockIndexationDueToCannibalization(
  page: IndexablePageInput,
  existingItems: CMSContentItem[] = [],
): boolean {
  return evaluateCannibalizationIndexation(page, existingItems).blocked;
}
