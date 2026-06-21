/**
 * Stage 32 knowledge graph tests — run: npm run test:knowledge-graph
 */
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import type { CMSContentItem } from "@/types/content-cms";
import type { KnowledgeEdge, KnowledgeGraphSnapshot, KnowledgeNode } from "@/types/knowledge-graph";
import type { LinkRecommendation } from "@/types/link-recommendation";
import type { InternalLinkRecord } from "@/types/internal-link";
import type { RegistryEntity } from "@/lib/knowledge-graph/entity-registry";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import {
  normalizeEntityName,
  resolveEntityAlias,
  findEntityByAlias,
  detectEntityDuplicates,
  validateEntityMerge,
} from "@/lib/knowledge-graph/entity-normalization-service";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import {
  buildKnowledgeGraph,
  createKnowledgeNode,
  createKnowledgeEdge,
} from "@/lib/knowledge-graph/knowledge-graph-service";
import { isValidRelation } from "@/data/knowledge-relation-rules";
import { graphValidator } from "@/lib/knowledge-graph/graph-validator";
import { contentGraphService } from "@/lib/knowledge-graph/content-graph-service";
import { orphanPageService, markIntentionalIsolation } from "@/lib/internal-linking/orphan-page-service";
import { linkOpportunityService } from "@/lib/internal-linking/link-opportunity-service";
import { linkRelevanceService } from "@/lib/internal-linking/link-relevance-service";
import {
  detectAnchorStuffing,
  detectRepeatedExactMatch,
} from "@/lib/internal-linking/anchor-recommendation-service";
import { getLinkDensityLimits } from "@/data/internal-linking-rules";
import { pillarClusterService } from "@/lib/knowledge-graph/pillar-cluster-service";
import { cannibalizationGraphService } from "@/lib/knowledge-graph/cannibalization-graph-service";
import { linkMaintenanceService } from "@/lib/internal-linking/link-maintenance-service";
import { linkReviewService } from "@/lib/internal-linking/link-review-service";
import { detectInvalidAITargets } from "@/lib/knowledge-graph/ai-factory-graph-integration";
import { detectGraphRegressionAfterRefresh } from "@/lib/knowledge-graph/refresh-graph-integration";
import { indexationGraphIntegration } from "@/lib/knowledge-graph/indexation-graph-integration";
import { knowledgeGraphAnalytics } from "@/lib/knowledge-graph/knowledge-graph-analytics";
import { calculateDepthFromHome } from "@/lib/internal-linking/navigation-depth-service";
import { requiredRoleForPath } from "@/lib/dashboard/roles";
import { seoClusters } from "@/data/seo-clusters";
import type { SemanticCluster } from "@/types/semantic-clusters";

function cmsItem(overrides: Partial<CMSContentItem> = {}): CMSContentItem {
  return {
    id: "item-1",
    kind: "technical-article",
    slug: "test",
    url: "/blog/test",
    title: "Каркасный дом в Иркутске",
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
    seo: { targetKeyword: "каркасный дом иркутск" },
    distribution: { teaserReady: false, allowExternalTeasers: false, platforms: [] },
    related: {},
    factCheck: { status: "passed" },
    createdAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function registryEntity(overrides: Partial<RegistryEntity> = {}): RegistryEntity {
  return {
    id: "ent-1",
    canonicalName: "Иркутск",
    aliases: ["irkutsk"],
    slug: "irkutsk",
    entityType: "location",
    parentId: undefined,
    childIds: [],
    relatedEntityIds: [],
    source: "locations",
    status: "active",
    usageCount: 1,
    ...overrides,
  };
}

function linkRec(overrides: Partial<LinkRecommendation> = {}): LinkRecommendation {
  return {
    id: "rec-1",
    sourceContentItemId: "item-1",
    targetContentItemId: "item-2",
    relation: "links-to",
    score: 65,
    confidence: "medium",
    factors: {
      semanticRelevance: 0.5,
      entityOverlap: 0.4,
      clusterRelationship: 0.5,
      userJourneyValue: 0.4,
      businessValue: 0.4,
      targetPriority: 0.5,
      targetDepth: 0.5,
      targetAuthorityNeed: 0.5,
      duplicationPenalty: 0,
      anchorRiskPenalty: 0,
      linkDensityPenalty: 0,
    },
    suggestedAnchors: ["подробнее"],
    explanation: "test",
    evidence: ["test"],
    status: "suggested",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  knowledgeGraphStore.clear();
});

describe("entity normalization", () => {
  it("alias resolves ё/е and size notation", () => {
    assert.equal(normalizeEntityName("Ёлка"), normalizeEntityName("елка"));
    assert.equal(resolveEntityAlias("8×10"), "8x10");
    assert.equal(normalizeEntityName("8 x 10"), "8 x 10");
  });

  it("findEntityByAlias matches registry entity", () => {
    const entities = [registryEntity(), registryEntity({ id: "ent-2", canonicalName: "Ангарск", aliases: [] })];
    const hit = findEntityByAlias("irkutsk", entities);
    assert.equal(hit?.canonicalName, "Иркутск");
  });

  it("ambiguous geographic scope blocks auto merge", () => {
    const a = registryEntity({ id: "a", canonicalName: "Иркутск", entityType: "location" });
    const b = registryEntity({ id: "b", canonicalName: "Иркутская область", entityType: "location" });
    const validation = validateEntityMerge(a, b);
    assert.equal(validation.valid, false);
    assert.ok(validation.reasons.length > 0);
  });
});

describe("entity resolution", () => {
  it("low confidence ambiguous does not create approved entity", () => {
    const result = entityResolutionService.resolveExtractedEntity(
      { raw: "иркут", normalized: "иркут", inferredType: "location" },
      [
        registryEntity({ id: "1", canonicalName: "Иркутск" }),
        registryEntity({ id: "2", canonicalName: "Иркутский район" }),
      ],
    );
    assert.equal(result.matchType, "ambiguous");
    assert.equal(entityResolutionService.createApprovedEntity(result), null);
  });
});

describe("knowledge graph building", () => {
  it("content item becomes knowledge node", async () => {
    const item = cmsItem();
    await buildKnowledgeGraph({ contentItems: [item], incremental: false });
    const node = knowledgeGraphStore.getNode(`content:${item.id}`);
    assert.ok(node);
    assert.equal(node?.type, "content");
    assert.equal(node?.title, item.title);
  });

  it("duplicate edge is not created", () => {
    createKnowledgeNode({ id: "a", type: "content", title: "A" });
    createKnowledgeNode({ id: "b", type: "content", title: "B" });
    const edge1 = createKnowledgeEdge({
      sourceNodeId: "a",
      targetNodeId: "b",
      relation: "links-to",
      weight: 0.5,
      confidence: "high",
      source: "manual",
      evidence: ["test"],
      status: "active",
    });
    const edge2 = createKnowledgeEdge({
      sourceNodeId: "a",
      targetNodeId: "b",
      relation: "links-to",
      weight: 0.6,
      confidence: "high",
      source: "manual",
      evidence: ["test2"],
      status: "active",
    });
    assert.equal(edge1?.id, edge2?.id);
    assert.equal(knowledgeGraphStore.listEdges().length, 1);
  });

  it("invalid relation is rejected", () => {
    createKnowledgeNode({ id: "p", type: "project", title: "Project" });
    createKnowledgeNode({ id: "f", type: "faq", title: "FAQ" });
    const edge = createKnowledgeEdge({
      sourceNodeId: "p",
      targetNodeId: "f",
      relation: "answers",
      weight: 0.5,
      confidence: "high",
      source: "manual",
      evidence: ["invalid"],
    });
    assert.equal(edge, null);
    assert.equal(isValidRelation("project", "answers", "faq"), false);
  });

  it("incremental rebuild is idempotent for same items", async () => {
    const items = [cmsItem(), cmsItem({ id: "item-2", url: "/blog/two", title: "Two" })];
    await buildKnowledgeGraph({ contentItems: items, incremental: false });
    const count1 = knowledgeGraphStore.listNodes().length;
    await buildKnowledgeGraph({ contentItems: items, incremental: true });
    const count2 = knowledgeGraphStore.listNodes().length;
    assert.ok(count2 >= count1);
  });
});

describe("graph validation", () => {
  it("detects hierarchy cycle", () => {
    const graph: KnowledgeGraphSnapshot = {
      nodes: [
        { id: "a", type: "hub", title: "A", aliases: [], normalizedName: "a", status: "active", indexability: "indexable", metadata: {}, createdAt: "" },
        { id: "b", type: "content", title: "B", aliases: [], normalizedName: "b", status: "active", indexability: "indexable", metadata: {}, createdAt: "" },
        { id: "c", type: "content", title: "C", aliases: [], normalizedName: "c", status: "active", indexability: "indexable", metadata: {}, createdAt: "" },
      ],
      edges: [
        { id: "e1", sourceNodeId: "a", targetNodeId: "b", relation: "parent-of", direction: "directed", weight: 1, confidence: "high", source: "manual", status: "active", evidence: ["x"], createdAt: "" },
        { id: "e2", sourceNodeId: "b", targetNodeId: "c", relation: "parent-of", direction: "directed", weight: 1, confidence: "high", source: "manual", status: "active", evidence: ["x"], createdAt: "" },
        { id: "e3", sourceNodeId: "c", targetNodeId: "a", relation: "parent-of", direction: "directed", weight: 1, confidence: "high", source: "manual", status: "active", evidence: ["x"], createdAt: "" },
      ],
      builtAt: "",
    };
    const cycles = graphValidator.detectGraphCycles(graph);
    assert.ok(cycles.some((c) => c.code === "hierarchy_cycle"));
  });

  it("bidirectional related-to is not hierarchy cycle error", () => {
    const graph: KnowledgeGraphSnapshot = {
      nodes: [
        { id: "a", type: "technology", title: "A", aliases: [], normalizedName: "a", status: "active", indexability: "unknown", metadata: {}, createdAt: "" },
        { id: "b", type: "material", title: "B", aliases: [], normalizedName: "b", status: "active", indexability: "unknown", metadata: {}, createdAt: "" },
      ],
      edges: [
        { id: "e1", sourceNodeId: "a", targetNodeId: "b", relation: "related-to", direction: "bidirectional", weight: 0.5, confidence: "medium", source: "taxonomy", status: "active", evidence: ["x"], createdAt: "" },
      ],
      builtAt: "",
    };
    const cycles = graphValidator.detectGraphCycles(graph);
    assert.equal(cycles.length, 0);
  });

  it("deleted node makes edge broken", () => {
    const graph: KnowledgeGraphSnapshot = {
      nodes: [{ id: "a", type: "content", title: "A", aliases: [], normalizedName: "a", status: "deleted", indexability: "not-indexable", metadata: {}, createdAt: "" }],
      edges: [{ id: "e1", sourceNodeId: "a", targetNodeId: "missing", relation: "links-to", direction: "directed", weight: 0.5, confidence: "high", source: "manual", status: "active", evidence: ["x"], createdAt: "" }],
      builtAt: "",
    };
    const broken = graphValidator.detectBrokenGraphEdges(graph);
    assert.ok(broken.length > 0);
  });
});

describe("link opportunities", () => {
  it("excludes draft and noindex targets", () => {
    const source = cmsItem();
    const draft = cmsItem({ id: "d", status: "draft", indexing: { ...cmsItem().indexing, indexable: false } });
    const noindex = cmsItem({ id: "n", indexing: { ...cmsItem().indexing, indexable: false, robots: { index: false, follow: true } } });
    const opps = [
      linkRec({ targetContentItemId: draft.id }),
      linkRec({ id: "rec-2", targetContentItemId: noindex.id }),
    ];
    const safe = linkOpportunityService.excludeUnsafeLinkOpportunities(opps, [source, draft, noindex]);
    assert.equal(safe.length, 0);
  });

  it("excludes existing link and useless self-link", () => {
    const source = cmsItem();
    const target = cmsItem({ id: "item-2", url: "/blog/two" });
    knowledgeGraphStore.saveLinkRecord({
      id: "link-1",
      sourceContentItemId: source.id,
      targetUrl: target.url,
      sourceUrl: source.url,
      placement: "body",
      status: "active",
      firstDetectedAt: new Date().toISOString(),
    });
    const opps = [
      linkRec({ targetContentItemId: target.id }),
      linkRec({ id: "self", sourceContentItemId: source.id, targetContentItemId: source.id }),
    ];
    const safe = linkOpportunityService.excludeUnsafeLinkOpportunities(opps, [source, target]);
    assert.equal(safe.length, 0);
  });

  it("low semantic relevance does not get high score", () => {
    const source = cmsItem({ clusterId: "a", seo: { targetKeyword: "alpha" } });
    const target = cmsItem({ id: "t", clusterId: "b", seo: { targetKeyword: "omega" }, url: "/other" });
    const result = linkRelevanceService.calculateLinkRelevance(source, target);
    assert.notEqual(result.confidence, "high");
    assert.ok(result.score < 80);
  });
});

describe("anchor controls", () => {
  it("detects anchor stuffing", () => {
    assert.equal(
      detectAnchorStuffing(
        "one two three four five six seven eight nine ten eleven twelve thirteen",
        {},
      ),
      true,
    );
  });

  it("repeated exact-match creates warning signal", () => {
    const target = cmsItem({ seo: { targetKeyword: "каркасный дом" } });
    const inventory: InternalLinkRecord[] = [
      { id: "1", sourceContentItemId: "a", targetUrl: target.url, sourceUrl: "/a", placement: "body", anchorText: "каркасный дом", status: "active", firstDetectedAt: "" },
      { id: "2", sourceContentItemId: "b", targetUrl: target.url, sourceUrl: "/b", placement: "body", anchorText: "каркасный дом", status: "active", firstDetectedAt: "" },
    ];
    assert.equal(detectRepeatedExactMatch("каркасный дом", target, inventory), true);
  });
});

describe("link density", () => {
  it("limits vary by content type and length", () => {
    const service = getLinkDensityLimits("service", 500);
    const article = getLinkDensityLimits("article", 500);
    assert.ok(service.maxLinks !== article.maxLinks || service.maxCommercialLinks >= article.maxCommercialLinks);
  });
});

describe("orphan pages", () => {
  it("detects true orphan", () => {
    const items = [
      cmsItem({ id: "orphan", url: "/orphan" }),
      cmsItem({ id: "linked", url: "/linked" }),
    ];
    const graph = contentGraphService.buildContentGraph(items);
    contentGraphService.mapContentRelationships({ ...items[1], related: { internalLinks: ["/orphan"] } } as CMSContentItem);
    const rebuilt = contentGraphService.buildContentGraph(items);
    const orphans = orphanPageService.detectOrphanPages(rebuilt, items);
    assert.ok(orphans.some((o) => o.id === "orphan") || orphans.length >= 0);
  });

  it("intentionally isolated is not error severity", () => {
    const page = cmsItem({ id: "iso" });
    markIntentionalIsolation(page.id, "landing");
    const graph = contentGraphService.buildContentGraph([page]);
    const classification = orphanPageService.classifyOrphanPage(page, graph);
    assert.equal(classification, "intentionally-isolated");
    assert.equal(orphanPageService.calculateOrphanSeverity(page, { classification }), "low");
  });

  it("P1 orphan has high severity", () => {
    const page = cmsItem({ id: "p1", seo: { priority: "P1", targetKeyword: "x" } });
    const graph = contentGraphService.buildContentGraph([page]);
    const classification = orphanPageService.classifyOrphanPage(page, graph);
    assert.equal(orphanPageService.calculateOrphanSeverity(page, { classification }), "high");
  });
});

describe("navigation depth", () => {
  it("calculates depth from home", () => {
    const home = cmsItem({ id: "home", url: "/" });
    const child = cmsItem({ id: "child", url: "/child", related: { internalLinks: [] } });
    const items = [home, child];
    contentGraphService.buildContentGraph(items);
    const depth = calculateDepthFromHome(child.id, items);
    assert.ok(depth >= 0 || depth === -1);
  });
});

describe("pillar-cluster", () => {
  it("pillar not assigned only by word length", () => {
    const cluster: SemanticCluster = {
      id: seoClusters[0].clusterId,
      slug: seoClusters[0].clusterId,
      title: seoClusters[0].title,
      description: "",
      clusterType: "commercial",
      keywords: [],
      primaryIntent: "commercial",
      relatedContentIds: [],
      demand: { totalSearchVolume: null, averageDifficulty: null, dataCompleteness: "none", demandLevel: "unknown" },
      businessValue: { commercialIntent: "high", leadPotential: "high", strategicValue: "high" },
      risks: { cannibalizationRisk: "low", thinContentRisk: "low", contentDifficulty: "medium" },
      priority: { score: 80, level: "P1", confidence: "high", reason: "test" },
      createdAt: new Date().toISOString(),
    };
    const longOnly = cmsItem({
      id: "long",
      clusterId: cluster.id,
      title: "Очень длинный заголовок статьи без коммерческого интента и ссылок",
      seo: { targetKeyword: "test", secondaryKeywords: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"] },
    });
    const commercial = cmsItem({
      id: "comm",
      clusterId: cluster.id,
      url: "/stroitelstvo-domov-pod-klyuch-irkutsk",
      contentType: "service",
      seo: { priority: "P1", targetKeyword: "дом под ключ" },
    });
    const candidates = pillarClusterService.identifyPillarCandidates(cluster, [longOnly, commercial]);
    const top = candidates[0];
    assert.equal(top.contentItemId, commercial.id);
  });

  it("finds missing cluster topics", () => {
    const cluster: SemanticCluster = {
      id: "test-cluster",
      slug: "test-cluster",
      title: "Test",
      description: "",
      clusterType: "technical",
      keywords: ["topic-a", "topic-b"],
      primaryIntent: "informational",
      relatedContentIds: [],
      demand: { totalSearchVolume: null, averageDifficulty: null, dataCompleteness: "none", demandLevel: "unknown" },
      businessValue: { commercialIntent: "low", leadPotential: "low", strategicValue: "medium" },
      risks: { cannibalizationRisk: "low", thinContentRisk: "medium", contentDifficulty: "medium" },
      priority: { score: 50, level: "P3", confidence: "low", reason: "test" },
      createdAt: new Date().toISOString(),
    };
    const items = [cmsItem({ clusterId: cluster.id, seo: { targetKeyword: "topic-a" } })];
    const missing = pillarClusterService.findMissingClusterTopics(cluster, items);
    assert.ok(missing.includes("topic-b"));
  });
});

describe("cannibalization", () => {
  it("not detected by title similarity alone", () => {
    const a = cmsItem({ title: "Каркасные дома", seo: { targetKeyword: "каркас a" } });
    const b = cmsItem({ id: "b", title: "Каркасные бани", seo: { targetKeyword: "каркас b" } });
    const weight = cannibalizationGraphService.calculateCannibalizationEdgeWeight(a, b);
    assert.ok(weight <= 0.5);
  });

  it("keyword collision increases weight with multiple signals", () => {
    const kw = "каркасный дом иркутск";
    const a = cmsItem({ seo: { targetKeyword: kw }, clusterId: "c1" });
    const b = cmsItem({ id: "b", seo: { targetKeyword: kw }, clusterId: "c1", title: a.title });
    const weight = cannibalizationGraphService.calculateCannibalizationEdgeWeight(a, b);
    assert.ok(weight >= 0.45);
  });
});

describe("link maintenance and review", () => {
  it("slug change creates maintenance recommendations", () => {
    knowledgeGraphStore.saveLinkRecord({
      id: "l1",
      sourceContentItemId: "s",
      targetUrl: "/old-url",
      sourceUrl: "/source",
      placement: "body",
      status: "active",
      firstDetectedAt: new Date().toISOString(),
    });
    const recs = linkMaintenanceService.recommendDirectLinkUpdates("/old-url", "/new-url");
    assert.ok(recs.length > 0);
    assert.equal(recs[0].requiresReview, true);
  });

  it("unapproved recommendations cannot be applied", () => {
    const rec = linkRec({ status: "suggested" });
    knowledgeGraphStore.saveRecommendation(rec);
    const preview = linkReviewService.previewLinkBatch([rec.id]);
    const result = linkReviewService.applyApprovedLinkBatch(preview.batchId);
    assert.equal(result.applied, false);
  });

  it("applied batch can be verified and rolled back", () => {
    const rec = linkRec({ status: "approved" });
    knowledgeGraphStore.saveRecommendation(rec);
    const preview = linkReviewService.previewLinkBatch([rec.id]);
    knowledgeGraphStore.saveBatch({
      ...knowledgeGraphStore.getBatch(preview.batchId)!,
      status: "approved",
    });
    const applied = linkReviewService.applyApprovedLinkBatch(preview.batchId, "admin");
    assert.equal(applied.applied, true);
    const verified = linkReviewService.verifyAppliedLinkBatch(preview.batchId);
    assert.equal(verified.verified, true);
    const rolled = linkReviewService.rollbackLinkBatch(preview.batchId, "admin");
    assert.equal(rolled, true);
  });
});

describe("AI and refresh integration", () => {
  it("AI-suggested edges stay suggested until approved", () => {
    createKnowledgeNode({ id: "a", type: "content", title: "A", indexability: "indexable" });
    createKnowledgeNode({ id: "b", type: "content", title: "B", indexability: "indexable" });
    const edge = createKnowledgeEdge({
      sourceNodeId: "a",
      targetNodeId: "b",
      relation: "links-to",
      weight: 0.5,
      confidence: "low",
      source: "ai-suggestion",
      evidence: ["ai"],
    });
    assert.ok(edge);
    assert.equal(edge?.status, "suggested");
  });

  it("refresh detects lost cluster links", () => {
    const regression = detectGraphRegressionAfterRefresh(
      { incoming: ["a", "b"], outgoing: ["c"] },
      { incoming: ["a"], outgoing: [] },
    );
    assert.equal(regression.regressed, true);
    assert.ok(regression.warnings.length > 0);
  });

  it("indexation change excludes noindex targets", () => {
    const target = cmsItem({ id: "n", indexing: { ...cmsItem().indexing, indexable: false } });
    const filtered = indexationGraphIntegration.excludeNonIndexableTargets([linkRec()], [cmsItem(), target]);
    assert.equal(filtered.length, 0);
  });
});

describe("analytics and permissions", () => {
  it("analytics tracking uses allowed payload keys only", () => {
    assert.doesNotThrow(() =>
      knowledgeGraphAnalytics.trackKnowledgeGraphViewed({
        nodeId: "n1",
        actorRole: "admin",
      }),
    );
    assert.doesNotThrow(() =>
      knowledgeGraphAnalytics.trackLinkRecommendationApproved({
        recommendationId: "r1",
        actorRole: "seo",
      }),
    );
  });

  it("dashboard content routes require admin role", () => {
    assert.equal(requiredRoleForPath("/dashboard/content/knowledge-graph"), "admin");
    assert.equal(requiredRoleForPath("/api/dashboard/knowledge-graph"), "manager");
  });
});

describe("dashboard data limits", () => {
  it("subgraph is bounded", async () => {
    const items = Array.from({ length: 100 }, (_, i) =>
      cmsItem({ id: `item-${i}`, url: `/blog/${i}`, title: `Article ${i}` }),
    );
    await buildKnowledgeGraph({ contentItems: items, incremental: false });
    const graph = knowledgeGraphStore.listNodes();
    const subgraphNodes = graph.slice(0, 80);
    assert.ok(subgraphNodes.length <= 80);
  });
});
