import type { IndexabilityDecision } from "@/types/seo-indexation";
import type { SitemapEntry } from "@/lib/seo-indexation/sitemap-registry";

export type SitemapValidationIssue = {
  type: "sitemap-noindex" | "no-sitemap-indexable" | "invalid-url" | "duplicate-url" | "priority-out-of-range";
  severity: "high" | "medium" | "low";
  url: string;
  message: string;
};

export type SitemapValidationReport = {
  valid: boolean;
  issues: SitemapValidationIssue[];
};

export function validateSitemapConsistency(
  entries: SitemapEntry[],
  decisions: Map<string, IndexabilityDecision>,
): SitemapValidationReport {
  const issues: SitemapValidationIssue[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const key = entry.pageId ?? entry.contentItemId ?? entry.url;
    const decision = decisions.get(key);

    if (decision && !decision.indexable && decision.sitemap) {
      issues.push({
        type: "sitemap-noindex",
        severity: "high",
        url: entry.url,
        message: "Страница noindex, но включена в sitemap",
      });
    }

    if (decision && decision.indexable && !decision.sitemap) {
      issues.push({
        type: "no-sitemap-indexable",
        severity: "low",
        url: entry.url,
        message: "Indexable, но не в sitemap",
      });
    }

    if (decision && !decision.robots.index && entries.some((e) => e.url === entry.url)) {
      issues.push({
        type: "sitemap-noindex",
        severity: "high",
        url: entry.url,
        message: "robots noindex + sitemap entry",
      });
    }

    if (entry.priority !== undefined && (entry.priority < 0 || entry.priority > 1)) {
      issues.push({
        type: "priority-out-of-range",
        severity: "medium",
        url: entry.url,
        message: `Priority ${entry.priority} вне 0..1`,
      });
    }

    try {
      new URL(entry.url);
    } catch {
      issues.push({
        type: "invalid-url",
        severity: "high",
        url: entry.url,
        message: "Невалидный URL в sitemap",
      });
    }

    const normalized = entry.url.toLowerCase();
    if (seen.has(normalized)) {
      issues.push({
        type: "duplicate-url",
        severity: "medium",
        url: entry.url,
        message: "Дубликат URL в sitemap",
      });
    }
    seen.add(normalized);
  }

  return {
    valid: !issues.some((i) => i.severity === "high"),
    issues,
  };
}
