import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";

export type CrawlWasteItem = {
  url: string;
  pageId: string;
  reason: string;
  category: "noindex-in-sitemap-candidate" | "draft" | "thin-content" | "cannibalization" | "deferred" | "quality";
  recoverable: boolean;
};

export function detectCrawlWaste(pages: IndexablePageInput[]): CrawlWasteItem[] {
  const waste: CrawlWasteItem[] = [];

  for (const page of pages) {
    const decision = evaluateIndexability(page);

    if (decision.status === "noindex" || decision.status === "blocked") {
      waste.push({
        url: page.url,
        pageId: page.id,
        reason: decision.message,
        category:
          page.status === "draft" || page.status === "review"
            ? "draft"
            : page.seo.priority === "P5"
              ? "deferred"
              : "noindex-in-sitemap-candidate",
        recoverable: page.status !== "archived" && page.status !== "rejected",
      });
    }

    if (page.seo.thinContentRisk === "high") {
      waste.push({
        url: page.url,
        pageId: page.id,
        reason: "Thin content risk",
        category: "thin-content",
        recoverable: true,
      });
    }

    if (decision.reasons.includes("cannibalization-high")) {
      waste.push({
        url: page.url,
        pageId: page.id,
        reason: "High cannibalization",
        category: "cannibalization",
        recoverable: true,
      });
    }

    if (!page.quality.canPublish || page.quality.shouldNoindex) {
      waste.push({
        url: page.url,
        pageId: page.id,
        reason: "Quality gate",
        category: "quality",
        recoverable: true,
      });
    }
  }

  return waste;
}

export function summarizeCrawlWaste(pages: IndexablePageInput[]) {
  const items = detectCrawlWaste(pages);
  const byCategory = items.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<CrawlWasteItem["category"], number>,
  );

  return {
    totalWaste: items.length,
    recoverable: items.filter((i) => i.recoverable).length,
    byCategory,
    items: items.slice(0, 50),
  };
}
