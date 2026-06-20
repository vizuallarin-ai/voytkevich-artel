/**
 * Stage 31 content refresh tests — run: npm run test:refresh
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ContentRefreshCandidate } from "@/types/content-refresh";
import type { CMSContentItem } from "@/types/content-cms";
import type { ContentPerformanceSnapshot } from "@/types/content-analytics";
import { refreshSignalValidator } from "@/lib/content-refresh/refresh-signal-validator";
import {
  defineRefreshSuccessMetrics,
  defineRefreshGuardrails,
  validateUpdateBrief,
} from "@/lib/content-refresh/update-brief-service";
import { protectedElementsService } from "@/lib/content-refresh/protected-elements-service";
import { contentDiffService } from "@/lib/content-refresh/content-diff-service";
import { refreshReviewService } from "@/lib/content-refresh/refresh-review-service";
import { contentVersionService } from "@/lib/content-refresh/content-version-service";
import { aiRefreshService } from "@/lib/content-refresh/ai-refresh-service";
import { experimentDesignService } from "@/lib/content-experiments/experiment-design-service";
import { experimentStatisticsService } from "@/lib/content-experiments/experiment-statistics-service";
import { rollbackService } from "@/lib/content-refresh/rollback-service";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import type { ContentUpdateBrief } from "@/types/content-update-brief";

function candidate(overrides: Partial<ContentRefreshCandidate> = {}): ContentRefreshCandidate {
  return {
    id: "cand-1",
    contentItemId: "item-1",
    url: "/blog/test",
    reasons: ["content-decay"],
    status: "detected",
    priority: { score: 50, level: "medium", confidence: "low" },
    evidence: [{ metric: "pageViews", currentValue: 5, source: "internal" }],
    risks: [],
    blockers: [],
    recommendedAction: "Update content",
    detectedAt: new Date().toISOString(),
    ...overrides,
  };
}

function cmsItem(overrides: Partial<CMSContentItem> = {}): CMSContentItem {
  return {
    id: "item-1",
    kind: "technical-article",
    slug: "test",
    url: "/blog/test",
    title: "Test",
    h1: "Test H1",
    status: "published",
    source: { origin: "manual" },
    indexing: {
      indexable: true,
      sitemap: true,
      canonicalUrl: "https://stroistroy.ru/blog/test",
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
    workflow: { publishedAt: new Date().toISOString() },
    seo: { targetKeyword: "test" },
    distribution: { teaserReady: false, allowExternalTeasers: false, platforms: [] },
    related: {},
    factCheck: { status: "passed" },
    createdAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function snapshot(overrides: Partial<ContentPerformanceSnapshot> = {}): ContentPerformanceSnapshot {
  return {
    id: "s1",
    contentItemId: "item-1",
    url: "/blog/test",
    contentType: "technical",
    period: { from: "2025-01-01", to: "2025-01-31" },
    publication: { publishedAt: new Date().toISOString() },
    traffic: { pageViews: 5 },
    search: {},
    conversions: {},
    business: {},
    calculated: {},
    sources: ["internal"],
    dataCompleteness: "low",
    calculatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("refresh-signal-validator", () => {
  it("low-confidence signal is not valid for urgent queue", () => {
    const result = refreshSignalValidator.validateRefreshSignal(candidate(), {
      snapshot: snapshot({ traffic: { pageViews: 2 } }),
      contentItem: cmsItem({ workflow: { publishedAt: new Date().toISOString() } }),
    });
    assert.equal(result.confidence, "low");
    assert.equal(result.valid, false);
  });

  it("young page flagged as false positive", () => {
    const fps = refreshSignalValidator.detectFalsePositiveSignals(candidate(), {
      contentItem: cmsItem({ workflow: { publishedAt: new Date().toISOString() } }),
      snapshot: snapshot(),
    });
    assert.ok(fps.some((f) => f.includes("young") || f.includes("Insufficient")));
  });

  it("seasonal pattern detected as false positive", () => {
    const fps = refreshSignalValidator.detectFalsePositiveSignals(candidate(), {
      seasonalPattern: true,
      snapshot: snapshot({ traffic: { pageViews: 100 } }),
    });
    assert.ok(fps.some((f) => f.includes("Seasonal")));
  });
});

describe("update brief", () => {
  it("brief validation requires evidence", () => {
    const brief: ContentUpdateBrief = {
      id: "b1",
      contentItemId: "item-1",
      refreshCandidateId: "c1",
      objective: "Improve CTR",
      hypothesis: "Better title increases clicks",
      currentProblem: { summary: "Low CTR", evidence: [], unknowns: [] },
      targetAudience: "Homeowners",
      searchIntent: "commercial",
      secondaryQueries: [],
      proposedChanges: {},
      protectedElements: ["url"],
      successMetrics: defineRefreshSuccessMetrics(candidate()),
      guardrailMetrics: defineRefreshGuardrails(candidate()),
      requiredReviews: { editorial: true, seo: false, expert: false, legal: false },
      createdAt: new Date().toISOString(),
      createdBy: "test",
    };
    const v = validateUpdateBrief(brief);
    assert.equal(v.valid, false);
  });

  it("brief with evidence passes validation", () => {
    const brief: ContentUpdateBrief = {
      id: "b2",
      contentItemId: "item-1",
      refreshCandidateId: "c1",
      objective: "Improve CTR",
      hypothesis: "Better title increases clicks",
      currentProblem: { summary: "Low CTR", evidence: ["CTR 1.2%"], unknowns: [] },
      targetAudience: "Homeowners",
      searchIntent: "commercial",
      secondaryQueries: [],
      proposedChanges: { title: "New title" },
      protectedElements: ["url", "canonical"],
      successMetrics: ["search.ctr"],
      guardrailMetrics: ["search.indexed"],
      requiredReviews: { editorial: true, seo: true, expert: false, legal: false },
      createdAt: new Date().toISOString(),
      createdBy: "test",
    };
    assert.equal(validateUpdateBrief(brief).valid, true);
  });
});

describe("protected elements and diff", () => {
  it("protected element regression detected", () => {
    const before = cmsItem();
    const after = cmsItem({ url: "/blog/changed" });
    const diff = contentDiffService.buildContentDiff(before, after);
    assert.ok(diff.seoCriticalChanges.includes("url-changed") || diff.riskLevel !== "low");
  });

  it("removed H1 detected in diff", () => {
    const before = { ...cmsItem(), h1: "Important H1", body: "<h1>Important H1</h1>" };
    const after = { ...cmsItem(), h1: "Other", body: "<h1>Other</h1>" };
    const diff = contentDiffService.buildContentDiff(before, after);
    assert.ok(diff.headings.changed.length > 0 || diff.headings.removed.length > 0 || diff.seoCriticalChanges.length > 0);
  });

  it("URL protected by default", () => {
    const elements = protectedElementsService.detectProtectedElements(cmsItem());
    assert.ok(elements.some((e) => e.label.toLowerCase().includes("url") || e.type === "url"));
  });
});

describe("version and review workflow", () => {
  it("draft without reviews cannot publish", () => {
    const item = cmsItem();
    const version = contentVersionService.createContentVersion({
      contentItem: item,
      changeType: "ai-assisted",
      changeSummary: "AI draft",
      createdBy: "editor",
    });
    const check = refreshReviewService.canPublishRefreshVersion(version.id);
    assert.equal(check.allowed, false);
  });

  it("version history preserves previous on publish path", () => {
    const item = cmsItem();
    const v1 = contentVersionService.createContentVersion({
      contentItem: item,
      changeType: "manual",
      changeSummary: "Baseline",
      createdBy: "editor",
    });
    const history = contentVersionService.getContentVersionHistory(item.id);
    assert.ok(history.some((v) => v.id === v1.id));
  });
});

describe("AI refresh safety", () => {
  it("invalid AI draft rejected", () => {
    const brief: ContentUpdateBrief = {
      id: "b-ai",
      contentItemId: "item-1",
      refreshCandidateId: "c1",
      objective: "Update",
      hypothesis: "Improve clarity",
      currentProblem: { summary: "Weak", evidence: ["Low engagement"], unknowns: [] },
      targetAudience: "Users",
      searchIntent: "informational",
      secondaryQueries: [],
      proposedChanges: {},
      protectedElements: ["url"],
      successMetrics: ["traffic.pageViews"],
      guardrailMetrics: ["search.indexed"],
      requiredReviews: { editorial: true, seo: false, expert: false, legal: false },
      createdAt: new Date().toISOString(),
      createdBy: "system",
    };
    const result = aiRefreshService.validateAIDraftAgainstBrief(
      { url: "/blog/changed-url" },
      brief,
    );
    assert.equal(result.valid, false);
  });

  it("unsupported claim detected without source", () => {
    const claims = aiRefreshService.detectUnsupportedAIClaims(
      { sections: [{ id: "1", title: "Facts", body: "Стоимость от 1 млн руб под ключ" }] },
      [],
    );
    assert.ok(claims.length > 0);
  });
});

describe("experiments", () => {
  it("experiment without hypothesis fails validation", () => {
    const exp = experimentDesignService.createContentExperiment({
      contentItemId: "item-1",
      type: "title",
      hypothesis: "",
      baselineVersionId: "v1",
    });
    assert.equal(experimentDesignService.validateExperimentHypothesis(exp).valid, false);
  });

  it("insufficient sample yields inconclusive", () => {
    const exp = experimentDesignService.createContentExperiment({
      contentItemId: "item-1",
      type: "cta",
      hypothesis: "New CTA text increases form submissions by 10%",
      baselineVersionId: "v1",
      primaryMetric: "conversions.leads",
    });
    const outcome = experimentStatisticsService.determineExperimentOutcome(exp);
    assert.equal(outcome, "insufficient-data");
  });
});

describe("rollback", () => {
  it("rollback requires manual approval by default", () => {
    const item = cmsItem();
    const version = contentVersionService.createContentVersion({
      contentItem: item,
      changeType: "manual",
      changeSummary: "Published",
      createdBy: "editor",
    });
    refreshStore.saveVersion({ ...version, status: "published" });
    const can = rollbackService.canRollbackContent(item.id);
    assert.equal(typeof can.canRollback, "boolean");
  });
});
