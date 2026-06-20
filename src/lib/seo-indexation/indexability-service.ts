import type {
  IndexabilityDecision,
  IndexabilityReason,
  IndexabilityStatus,
} from "@/types/seo-indexation";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import type { CMSContentItem } from "@/types/content-cms";
import {
  getCmsStatusIndexationRule,
  getPageTypeIndexationRule,
  sitemapPriorityByContentPriority,
} from "@/data/seo-indexation-rules";
import { resolveCanonicalUrl } from "@/lib/seo-indexation/canonical-resolver";
import { buildRobotsDirective } from "@/lib/seo-indexation/robots-directive-service";
import { evaluateCannibalizationIndexation } from "@/lib/seo-indexation/cannibalization-indexation-guard";
import { evaluateProgrammaticIndexation } from "@/lib/seo-indexation/programmatic-indexation-guard";

const indexabilityCache = new Map<string, IndexabilityDecision>();

export function evaluateIndexability(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): IndexabilityDecision {
  const reasons: IndexabilityReason[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  let status: IndexabilityStatus = "pending";
  let indexable = false;
  let sitemap = false;

  const statusRule = getCmsStatusIndexationRule(page.status);
  if (statusRule) {
    if (statusRule.reason) reasons.push(statusRule.reason);
    if (!statusRule.indexable) {
      blockers.push(statusRule.message);
      status = page.status === "archived" || page.status === "rejected" ? "blocked" : "noindex";
    }
  } else {
    reasons.push("unknown");
    blockers.push(`Неизвестный статус: ${page.status}`);
    status = "noindex";
  }

  if (page.explicitNoindex) {
    reasons.push("manual-noindex");
    blockers.push(page.noindexReason ?? "Явный noindex");
    indexable = false;
    sitemap = false;
    status = "noindex";
  }

  if (page.pageType) {
    const pageTypeRule = getPageTypeIndexationRule(page.pageType);
    if (pageTypeRule && !pageTypeRule.indexableByDefault && page.status !== "published") {
      if (pageTypeRule.reason) reasons.push(pageTypeRule.reason);
      blockers.push(pageTypeRule.message);
    }
  }

  if (!page.quality.canPublish) {
    reasons.push("quality-blocker");
    blockers.push(...page.quality.blockers);
    if (page.quality.blockers.length === 0) {
      blockers.push("Quality gate: canPublish=false");
    }
  }

  if (page.quality.shouldNoindex) {
    reasons.push("quality-noindex-flag");
    blockers.push("Quality gate: shouldNoindex");
  }

  if (page.quality.level === "poor") {
    reasons.push("quality-poor");
    blockers.push("Низкое качество контента");
  }

  if (page.seo.thinContentRisk === "high") {
    reasons.push("thin-content-high");
    blockers.push("Высокий риск thin content");
  } else if (page.seo.thinContentRisk === "medium") {
    reasons.push("thin-content-medium");
    warnings.push("Средний риск thin content");
  }

  const programmaticGuard = evaluateProgrammaticIndexation(page);
  if (!programmaticGuard.allowed) {
    if (programmaticGuard.reason) reasons.push(programmaticGuard.reason);
    blockers.push(programmaticGuard.message);
  }

  const cannibalization = evaluateCannibalizationIndexation(page, context?.existingItems);
  if (cannibalization.reason) reasons.push(cannibalization.reason);
  if (cannibalization.blocked) {
    blockers.push(cannibalization.message);
    warnings.push(...cannibalization.suggestions);
  } else if (cannibalization.risk === "medium") {
    warnings.push(cannibalization.message);
  }

  if (page.seo.priority === "P5") {
    reasons.push("priority-deferred");
    warnings.push("P5 — отложенная индексация");
  }

  if (!page.title?.trim()) {
    reasons.push("missing-metadata");
    warnings.push("Отсутствует title");
  }

  const canonicalUrl = resolveCanonicalUrl(page);
  if (!page.canonicalUrl && page.seo.cannibalizationRisk === "high") {
    reasons.push("missing-canonical");
    warnings.push("Canonical рекомендуется при high cannibalization");
  }

  if (page.explicitIndexable && blockers.length === 0 && statusRule?.indexable) {
    indexable = true;
    status = "indexable";
  } else if (!page.explicitNoindex && blockers.length === 0 && statusRule?.indexable) {
    indexable = true;
    status = "indexable";
  } else if (blockers.length > 0) {
    indexable = false;
    if (status !== "blocked") status = "noindex";
  }

  if (indexable && statusRule?.sitemap) {
    sitemap = page.pageType
      ? (getPageTypeIndexationRule(page.pageType)?.sitemapByDefault ?? true)
      : true;
  }

  if (page.explicitIndexable === false) {
    sitemap = false;
  }

  if (page.seo.priority === "P5") {
    sitemap = false;
  }

  const primaryReason = reasons[0];
  const robots = buildRobotsDirective({
    status,
    indexable,
    sitemap,
    reasons,
    primaryReason,
    message: blockers[0] ?? warnings[0] ?? statusRule?.message ?? "Indexability evaluated",
    canonicalUrl,
    robots: { index: indexable, follow: status !== "blocked" },
    warnings,
    blockers,
    priorityLevel: page.seo.priority,
    evaluatedAt: new Date().toISOString(),
  });

  const decision: IndexabilityDecision = {
    status,
    indexable,
    sitemap,
    reasons,
    primaryReason,
    message: blockers[0] ?? warnings[0] ?? statusRule?.message ?? "Indexability evaluated",
    canonicalUrl,
    robots,
    warnings,
    blockers,
    priorityLevel: page.seo.priority,
    evaluatedAt: new Date().toISOString(),
  };

  indexabilityCache.set(page.id, decision);
  return decision;
}

export function canPageBeIndexed(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): boolean {
  return evaluateIndexability(page, context).indexable;
}

export function shouldIncludeInSitemap(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): boolean {
  return evaluateIndexability(page, context).sitemap;
}

export function getRobotsDirective(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
) {
  return evaluateIndexability(page, context).robots;
}

export function getIndexabilityReasons(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): IndexabilityReason[] {
  return evaluateIndexability(page, context).reasons;
}

export function getIndexabilityBlockers(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): string[] {
  return evaluateIndexability(page, context).blockers;
}

export function getIndexabilityWarnings(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): string[] {
  return evaluateIndexability(page, context).warnings;
}

export function recalculateIndexability(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): IndexabilityDecision {
  indexabilityCache.delete(page.id);
  return evaluateIndexability(page, context);
}

export function recalculateAllIndexability(
  pages: IndexablePageInput[],
  context?: { existingItems?: CMSContentItem[] },
): IndexabilityDecision[] {
  indexabilityCache.clear();
  return pages.map((page) => evaluateIndexability(page, context));
}

export function explainIndexabilityDecision(
  page: IndexablePageInput,
  context?: { existingItems?: CMSContentItem[] },
): string {
  const decision = evaluateIndexability(page, context);
  const parts = [
    `Status: ${decision.status}`,
    `Indexable: ${decision.indexable ? "yes" : "no"}`,
    `Sitemap: ${decision.sitemap ? "yes" : "no"}`,
  ];

  if (decision.primaryReason) {
    parts.push(`Primary reason: ${decision.primaryReason}`);
  }
  if (decision.blockers.length) {
    parts.push(`Blockers: ${decision.blockers.join("; ")}`);
  }
  if (decision.warnings.length) {
    parts.push(`Warnings: ${decision.warnings.join("; ")}`);
  }
  if (decision.priorityLevel) {
    const priority = sitemapPriorityByContentPriority[decision.priorityLevel];
    parts.push(`Sitemap priority weight: ${priority}`);
  }

  return parts.join(" | ");
}

export function getCachedIndexabilityDecision(pageId: string): IndexabilityDecision | undefined {
  return indexabilityCache.get(pageId);
}
