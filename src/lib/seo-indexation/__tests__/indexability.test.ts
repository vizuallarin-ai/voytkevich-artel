/**
 * Stage 29 indexation tests — run: npm run test:indexation
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import type { CMSContentItem } from "@/types/content-cms";
import { deduplicateSitemapEntries, validateSitemapEntry } from "@/lib/seo-indexation/sitemap-service";
import { resolveCanonicalUrl } from "@/lib/seo-indexation/canonical-resolver";
import { validateSitemapConsistency } from "@/lib/seo-indexation/sitemap-validator";

function baseItem(overrides: Partial<CMSContentItem> = {}): CMSContentItem {
  return {
    id: "test-1",
    kind: "technical-article",
    slug: "test-slug",
    url: "/blog/test-slug",
    title: "Test Article",
    h1: "Test Article",
    status: "published",
    source: { origin: "manual" },
    indexing: {
      indexable: true,
      sitemap: true,
      canonicalUrl: "https://stroistroy.ru/blog/test-slug",
      robots: { index: true, follow: true },
    },
    quality: {
      score: 80,
      level: "good",
      warnings: [],
      blockers: [],
      canPublish: true,
      shouldNoindex: false,
      requiresHumanReview: false,
    },
    workflow: { publishedAt: "2025-01-01T00:00:00.000Z" },
    seo: { targetKeyword: "test" },
    distribution: { teaserReady: false, allowExternalTeasers: false, platforms: [] },
    factCheck: { status: "passed" },
    createdAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("indexability-service", () => {
  it("published ready page gets index,follow", () => {
    const page = cmsItemToIndexablePage(baseItem());
    const d = evaluateIndexability(page);
    assert.equal(d.indexable, true);
    assert.equal(d.robots.index, true);
    assert.equal(d.robots.follow, true);
  });

  it("draft gets noindex", () => {
    const page = cmsItemToIndexablePage(baseItem({ status: "draft" }));
    const d = evaluateIndexability(page);
    assert.equal(d.indexable, false);
    assert.equal(d.sitemap, false);
  });

  it("review not in sitemap", () => {
    const page = cmsItemToIndexablePage(baseItem({ status: "review" }));
    const d = evaluateIndexability(page);
    assert.equal(d.sitemap, false);
  });

  it("ai-generated blocked", () => {
    const page = cmsItemToIndexablePage(baseItem({ status: "ai-generated" }));
    const d = evaluateIndexability(page);
    assert.equal(d.indexable, false);
  });

  it("thin content high blocks index", () => {
    const page = cmsItemToIndexablePage(
      baseItem({ seo: { thinContentRisk: "high", targetKeyword: "x" } }),
    );
    const d = evaluateIndexability(page);
    assert.equal(d.indexable, false);
  });

  it("P5 deferred from sitemap", () => {
    const page = cmsItemToIndexablePage(baseItem({ seo: { priority: "P5", targetKeyword: "x" } }));
    const d = evaluateIndexability(page);
    assert.equal(d.sitemap, false);
  });
});

describe("sitemap", () => {
  it("deduplicates URLs", () => {
    const entries = deduplicateSitemapEntries([
      { url: "https://stroistroy.ru/a", path: "/a", segment: "static" },
      { url: "https://stroistroy.ru/a", path: "/a", segment: "static" },
    ]);
    assert.equal(entries.length, 1);
  });

  it("rejects invalid sitemap entry", () => {
    const r = validateSitemapEntry({ url: "", path: "", segment: "static" });
    assert.equal(r.valid, false);
  });
});

describe("canonical", () => {
  it("UTM not in canonical", () => {
    const page = cmsItemToIndexablePage(baseItem());
    const canonical = resolveCanonicalUrl(page);
    assert.ok(!canonical.includes("utm_"));
  });
});

describe("sitemap-validator", () => {
  it("detects sitemap+noindex conflict", () => {
    const entry = { url: "https://stroistroy.ru/x", path: "/x", segment: "static" as const, pageId: "static:/x" };
    const decisions = new Map([
      [
        "static:/x",
        {
          status: "noindex" as const,
          indexable: false,
          sitemap: true,
          reasons: [],
          message: "test",
          robots: { index: false, follow: true },
          warnings: [],
          blockers: [],
          evaluatedAt: new Date().toISOString(),
        },
      ],
    ]);
    const report = validateSitemapConsistency([entry], decisions);
    assert.ok(report.issues.some((i) => i.type === "sitemap-noindex"));
  });
});
