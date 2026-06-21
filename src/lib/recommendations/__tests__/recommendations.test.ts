/**
 * Stage 34 recommendations tests — run: npm run test:recommendations
 */
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate, RecommendationItem } from "@/types/recommendation";
import type { CMSContentItem } from "@/types/content-cms";
import { recommendationStore } from "@/lib/recommendations/recommendation-store";
import { recommendationOrchestratorService } from "@/lib/recommendations/recommendation-orchestrator-service";
import { recommendationEligibilityService } from "@/lib/recommendations/recommendation-eligibility-service";
import { recommendationPrivacyService } from "@/lib/recommendations/recommendation-privacy-service";
import { explicitPreferenceService } from "@/lib/recommendations/explicit-preference-service";
import { recommendationFrequencyService } from "@/lib/recommendations/recommendation-frequency-service";
import { recommendationDiversityService } from "@/lib/recommendations/recommendation-diversity-service";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";
import { recommendationScoringService } from "@/lib/recommendations/recommendation-scoring-service";
import { coldStartService } from "@/lib/recommendations/cold-start-service";
import { filterBubbleGuard } from "@/lib/recommendations/filter-bubble-guard";
import { recommendationFeedbackService } from "@/lib/recommendations/recommendation-feedback-service";
import { recommendationQualityService } from "@/lib/recommendations/recommendation-quality-service";
import { recommendationAnalytics } from "@/lib/recommendations/recommendation-analytics";
import { requiredRoleForPath } from "@/lib/dashboard/roles";

function baseContext(overrides: Partial<RecommendationContext> = {}): RecommendationContext {
  return {
    requestId: "req-1",
    sessionId: "sess-1",
    mode: "contextual",
    preferences: {
      buildingTypes: [],
      technologies: [],
      materials: [],
      sizes: [],
      areas: [],
      floors: [],
      layouts: [],
      locations: [],
    },
    journeyStage: "unknown",
    viewedContentIds: [],
    clickedRecommendationIds: [],
    dismissedRecommendationIds: [],
    consent: {
      personalization: true,
      location: false,
      persistentPreferences: false,
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function sampleCandidate(overrides: Partial<RecommendationCandidate> = {}): RecommendationCandidate {
  return {
    id: "cand-1",
    type: "related-content",
    contentItemId: "item-1",
    targetUrl: "/blog/test",
    title: "Каркасный дом в Иркутске",
    description: "Техническая статья",
    entityNodeIds: ["ent-1"],
    clusterIds: ["cluster-1"],
    source: "knowledge-graph",
    eligibility: {
      published: true,
      indexable: true,
      canonical: true,
      available: true,
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function rankedItem(overrides: Partial<RecommendationItem> = {}): RecommendationItem {
  const candidate = sampleCandidate(overrides);
  const ranked = recommendationScoringService.calculateRecommendationScore(candidate, baseContext());
  return { ...candidate, ...ranked, ...overrides };
}

function cmsItem(overrides: Partial<CMSContentItem> = {}): CMSContentItem {
  return {
    id: "item-1",
    kind: "technical-article",
    slug: "test",
    url: "/blog/test",
    title: "Каркасный дом",
    h1: "Каркасный дом",
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
    seo: { targetKeyword: "каркасный дом" },
    distribution: { teaserReady: false, allowExternalTeasers: false, platforms: [] },
    related: {},
    factCheck: { status: "passed" },
    createdAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  recommendationStore.clear();
});

describe("contextual mode", () => {
  it("builds contextual mode without session", async () => {
    const ctx = await recommendationOrchestratorService.buildContext({
      consent: { personalization: true, location: false, persistentPreferences: false },
    });
    assert.equal(ctx.mode, "contextual");
  });

  it("uses anonymous-session mode when sessionId provided", async () => {
    const ctx = await recommendationOrchestratorService.buildContext({
      sessionId: "sess-abc",
      consent: { persistentPreferences: false },
    });
    assert.equal(ctx.mode, "anonymous-session");
  });

  it("uses consented mode with persistent preferences", async () => {
    const ctx = await recommendationOrchestratorService.buildContext({
      sessionId: "sess-abc",
      consent: { persistentPreferences: true },
    });
    assert.equal(ctx.mode, "consented");
  });
});

describe("consent and privacy", () => {
  it("disables personalization when consent withdrawn", () => {
    const ctx = baseContext();
    recommendationPrivacyService.withdrawPersonalizationConsent(ctx);
    const enforced = recommendationPrivacyService.enforcePrivacyMode(ctx);
    assert.equal(enforced.mode, "contextual");
    assert.equal(enforced.consent.personalization, false);
    assert.deepEqual(enforced.viewedContentIds, []);
  });

  it("strips location when location consent disabled", () => {
    const ctx = baseContext({
      consent: { personalization: true, location: false, persistentPreferences: false },
      preferences: { ...baseContext().preferences, locations: ["иркутск"] },
    });
    recommendationPrivacyService.updatePersonalizationSettings({
      context: ctx,
      locationEnabled: false,
    });
    const enforced = recommendationPrivacyService.enforcePrivacyMode(ctx);
    assert.deepEqual(enforced.preferences.locations, []);
  });

  it("resets profile and emits analytics event", () => {
    const ctx = baseContext();
    explicitPreferenceService.setExplicitPreference(
      { sessionId: "sess-1", key: "technology", value: "каркас" },
      { persistentPreferences: false },
    );
    recommendationPrivacyService.resetRecommendationProfile(ctx);
    const prefs = explicitPreferenceService.listExplicitPreferences(ctx);
    assert.equal(prefs.length, 0);
    const events = recommendationAnalytics.listEvents(50);
    assert.ok(events.some((e) => e.eventName === "recommendation_profile_reset"));
  });
});

describe("exclusions", () => {
  it("excludes current page candidate", () => {
    const ctx = baseContext({
      currentPage: {
        contentItemId: "item-1",
        canonicalUrl: "/blog/test",
        contentType: "technical-article",
        entityNodeIds: [],
        clusterIds: [],
      },
    });
    const result = recommendationEligibilityService.checkCandidateEligibility({
      candidate: sampleCandidate({ contentItemId: "item-1" }),
      context: ctx,
      cmsItem: cmsItem(),
    });
    assert.equal(result.eligible, false);
    assert.ok(result.violations.includes("current-page"));
  });

  it("excludes draft content", () => {
    const result = recommendationEligibilityService.checkCandidateEligibility({
      candidate: sampleCandidate(),
      context: baseContext(),
      cmsItem: cmsItem({ status: "draft" }),
    });
    assert.equal(result.eligible, false);
  });

  it("excludes noindex content", () => {
    const result = recommendationEligibilityService.checkCandidateEligibility({
      candidate: sampleCandidate({ eligibility: { published: true, indexable: false, canonical: true, available: true } }),
      context: baseContext(),
      cmsItem: cmsItem({ indexing: { ...cmsItem().indexing, indexable: false, robots: { index: false, follow: true } } }),
    });
    assert.equal(result.eligible, false);
    assert.ok(result.violations.includes("noindex"));
  });

  it("excludes dismissed recommendations", () => {
    const result = recommendationEligibilityService.checkCandidateEligibility({
      candidate: sampleCandidate({ id: "cand-dismissed" }),
      context: baseContext({ dismissedRecommendationIds: ["cand-dismissed"] }),
    });
    assert.equal(result.eligible, false);
  });
});

describe("explicit over inferred preferences", () => {
  it("explicit preference ranks above inferred", () => {
    const explicit = recommendationStore.savePreference({
      id: "p1",
      sessionId: "sess-1",
      key: "technology",
      value: "каркас",
      source: "explicit",
      confidence: "high",
      explicit: true,
      persistent: false,
      createdAt: new Date().toISOString(),
    });
    const inferred = recommendationStore.savePreference({
      id: "p2",
      sessionId: "sess-1",
      key: "technology",
      value: "монолит",
      source: "session-behavior",
      confidence: "medium",
      explicit: false,
      persistent: false,
      createdAt: new Date().toISOString(),
    });

    const candidates = [
      sampleCandidate({ id: "a", title: "Монолитный дом", description: "монолит" }),
      sampleCandidate({ id: "b", title: "Каркасный дом", description: "каркас" }),
    ];
    const ranked = explicitPreferenceService.applyExplicitPreferences(candidates, [explicit, inferred]);
    assert.ok(ranked[0]?.title.includes("Каркас"));
  });

  it("rejects invalid explicit preference value", () => {
    assert.throws(() => {
      explicitPreferenceService.setExplicitPreference(
        { sessionId: "sess-1", key: "area", value: "x" },
        { persistentPreferences: false },
      );
    });
  });
});

describe("frequency caps", () => {
  it("blocks item when frequency cap reached", () => {
    const ctx = baseContext();
    const item = rankedItem({ id: "freq-1", type: "related-content" });
    for (let i = 0; i < 5; i++) {
      recommendationFrequencyService.recordRecommendationExposure(item, ctx, "article-related");
    }
    assert.equal(
      recommendationFrequencyService.isFrequencyCapReached(item, ctx, "article-related"),
      true,
    );
  });

  it("filters capped items from result set", () => {
    const ctx = baseContext();
    const item = rankedItem({ id: "freq-2" });
    for (let i = 0; i < 6; i++) {
      recommendationFrequencyService.recordRecommendationExposure(item, ctx, "article-related");
    }
    const filtered = recommendationFrequencyService.applyRecommendationFrequencyCap(
      [item, rankedItem({ id: "freq-3" })],
      ctx,
      "article-related",
    );
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.id, "freq-3");
  });
});

describe("diversity", () => {
  it("calculates diversity score", () => {
    const items = [
      rankedItem({ id: "d1", type: "related-content", clusterIds: ["a"] }),
      rankedItem({ id: "d2", type: "project", clusterIds: ["b"] }),
      rankedItem({ id: "d3", type: "faq", clusterIds: ["c"] }),
    ];
    const score = recommendationDiversityService.calculateRecommendationDiversity(items);
    assert.ok(score > 0.5);
  });

  it("diversifies by content type", () => {
    const items = [
      rankedItem({ id: "t1", type: "related-content" }),
      rankedItem({ id: "t2", type: "related-content" }),
      rankedItem({ id: "t3", type: "project" }),
    ];
    const diversified = recommendationDiversityService.diversifyByContentType(items);
    const types = new Set(diversified.map((i) => i.type));
    assert.ok(types.has("related-content"));
    assert.ok(types.has("project"));
    assert.equal(diversified.length, 3);
  });

  it("detects low diversity", () => {
    const items = [
      rankedItem({ id: "l1", type: "related-content", clusterIds: ["same"] }),
      rankedItem({ id: "l2", type: "related-content", clusterIds: ["same"] }),
      rankedItem({ id: "l3", type: "related-content", clusterIds: ["same"] }),
      rankedItem({ id: "l4", type: "related-content", clusterIds: ["same"] }),
    ];
    assert.equal(recommendationQualityService.detectLowDiversity(items), true);
  });
});

describe("explanations", () => {
  it("removes sensitive explanation signals", () => {
    const safe = recommendationExplanationService.removeSensitiveExplanationSignals(
      "Мы определили ваш адрес и доход",
    );
    assert.ok(!safe.includes("доход"));
    assert.ok(safe.includes("[скрыто]"));
  });

  it("builds safe reason codes without PII", () => {
    const codes = recommendationExplanationService.buildSafeReasonCodes(
      sampleCandidate(),
      baseContext({ journeyStage: "education" }),
    );
    assert.ok(codes.includes("knowledge-graph"));
    assert.ok(codes.includes("journey-education"));
  });

  it("escapes html in explanations", () => {
    const explanation = recommendationExplanationService.explainContentMatch(
      sampleCandidate({ title: "<script>alert(1)</script>" }),
      baseContext(),
    );
    assert.ok(!explanation.includes("<script>"));
  });
});

describe("cold start", () => {
  it("detects cold start for empty history", () => {
    assert.equal(coldStartService.detectColdStart(baseContext()), true);
  });

  it("does not detect cold start with search query", () => {
    const ctx = baseContext({
      search: { query: "каркасный дом", entityNodeIds: [], filters: {} },
    });
    assert.equal(coldStartService.detectColdStart(ctx), false);
  });

  it("does not detect cold start with preferences", () => {
    const ctx = baseContext({
      preferences: { ...baseContext().preferences, technologies: ["каркас"] },
    });
    assert.equal(coldStartService.detectColdStart(ctx), false);
  });
});

describe("no client score trust", () => {
  it("recalculates score server-side ignoring client tampering", () => {
    const candidate = sampleCandidate({ id: "score-1" });
    const serverRanked = recommendationScoringService.calculateRecommendationScore(candidate, baseContext());
    const tampered = {
      ...candidate,
      score: 999,
      confidence: "high" as const,
      recommendationId: candidate.id,
      factors: serverRanked.factors,
      explanation: "client injected",
      reasonCodes: ["client"],
    };
    const recomputed = recommendationScoringService.calculateRecommendationScore(tampered, baseContext());
    assert.notEqual(recomputed.score, 999);
    assert.ok(recomputed.score <= 1);
    assert.ok(recomputed.explanation.length > 0);
    assert.ok(!recomputed.reasonCodes.includes("client"));
  });

  it("exclusion penalty zeroes tampered high score", () => {
    const candidate = sampleCandidate({
      id: "score-2",
      eligibility: { published: false, indexable: false, canonical: false, available: false },
    });
    const ranked = recommendationScoringService.calculateRecommendationScore(candidate, baseContext());
    assert.equal(ranked.factors.exclusionPenalty, 1);
    assert.equal(ranked.score, 0);
  });
});

describe("filter bubble guard", () => {
  it("detects preference overfitting", () => {
    const ctx = baseContext({
      preferences: {
        ...baseContext().preferences,
        technologies: ["каркас", "монолит"],
      },
      viewedContentIds: ["a", "a", "b", "b"],
    });
    assert.equal(filterBubbleGuard.detectPreferenceOverfitting(ctx), true);
  });

  it("builds filter bubble warning", () => {
    const ctx = baseContext({
      preferences: {
        ...baseContext().preferences,
        technologies: ["каркас", "брус"],
      },
      viewedContentIds: ["x", "x", "y", "y"],
    });
    const warning = filterBubbleGuard.buildFilterBubbleWarning(ctx);
    assert.ok(warning?.includes("узкими"));
  });
});

describe("feedback", () => {
  it("validates required feedback fields", () => {
    const errors = recommendationFeedbackService.validateRecommendationFeedback({
      recommendationId: "",
      feedbackType: "helpful",
    });
    assert.ok(errors.length > 0);
  });

  it("submits feedback to store", () => {
    const record = recommendationFeedbackService.submitRecommendationFeedback({
      sessionId: "sess-1",
      recommendationId: "rec-1",
      feedbackType: "not-relevant",
    });
    assert.equal(record.feedbackType, "not-relevant");
    assert.equal(recommendationStore.listFeedback().length, 1);
  });
});

describe("quality analytics", () => {
  it("calculates quality report from events", () => {
    const period = { from: new Date(Date.now() - 86400000).toISOString(), to: new Date().toISOString() };
    recommendationAnalytics.trackRecommendationRequested(baseContext(), "article-related");
    recommendationAnalytics.trackRecommendationGenerated(baseContext(), "article-related", 3, 42);
    const report = recommendationQualityService.calculateRecommendationQuality(period);
    assert.ok(report.requests >= 1);
    assert.ok(report.generated >= 1);
    assert.ok(report.averageLatencyMs >= 0);
  });

  it("recommends quality actions on low ctr", () => {
    const period = { from: new Date(Date.now() - 86400000).toISOString(), to: new Date().toISOString() };
    const actions = recommendationQualityService.recommendQualityActions(period);
    assert.ok(Array.isArray(actions));
  });
});

describe("permissions", () => {
  it("dashboard recommendations requires admin", () => {
    assert.equal(requiredRoleForPath("/dashboard/recommendations"), "admin");
    assert.equal(requiredRoleForPath("/api/dashboard/recommendations"), "admin");
  });
});

describe("store sanitization", () => {
  it("redacts PII from feedback message", () => {
    const feedback = recommendationStore.saveFeedback({
      recommendationId: "r1",
      feedbackType: "wrong-params",
      message: "Позвоните +7 914 123-45-67 или test@example.com",
    });
    assert.ok(!feedback.message?.includes("@example.com"));
    assert.ok(!feedback.message?.includes("914"));
  });
});
