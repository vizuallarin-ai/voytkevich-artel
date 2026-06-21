import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { contentGraphService, type ContentGraph } from "@/lib/knowledge-graph/content-graph-service";

export type JourneyStepType =
  | "informational"
  | "comparison"
  | "technology"
  | "project"
  | "service"
  | "calculator"
  | "cta";

export type UserJourneyNode = {
  contentItemId: string;
  stepType: JourneyStepType;
  title: string;
};

export type UserJourneyGraph = {
  id: string;
  nodes: UserJourneyNode[];
  transitions: Array<{ fromId: string; toId: string; weight: number }>;
  builtAt: string;
};

const JOURNEY_TEMPLATES: JourneyStepType[][] = [
  ["informational", "comparison", "technology", "project", "service", "calculator"],
  ["informational", "service", "project", "calculator", "cta"],
  ["informational", "technology", "service", "calculator"],
];

function classifyStep(item: CMSContentItem): JourneyStepType {
  if (item.url.includes("/calculator")) return "calculator";
  if (item.contentType?.includes("comparison")) return "comparison";
  if (item.contentType?.includes("service") || item.url.includes("pod-klyuch")) return "service";
  if (item.contentType?.includes("project")) return "project";
  if (item.kind === "technical-article") return "technology";
  return "informational";
}

export function buildUserJourneyGraph(
  contentItems: CMSContentItem[],
  analytics?: Record<string, { transitions?: Record<string, number> }>,
): UserJourneyGraph {
  const nodes: UserJourneyNode[] = contentItems.map((item) => ({
    contentItemId: item.id,
    stepType: classifyStep(item),
    title: item.title,
  }));

  const transitions: UserJourneyGraph["transitions"] = [];
  const contentGraph = contentGraphService.buildContentGraph(contentItems);

  for (const item of contentItems) {
    const outgoing = contentGraphService.getOutgoingContentLinks(item.id);
    for (const targetId of outgoing) {
      let weight = 0.5;
      if (analytics?.[item.id]?.transitions?.[targetId]) {
        weight = Math.min(1, analytics[item.id].transitions![targetId] / 100);
      }
      transitions.push({ fromId: item.id, toId: targetId, weight });
    }
  }

  return {
    id: randomUUID(),
    nodes,
    transitions,
    builtAt: new Date().toISOString(),
  };
}

export function findJourneyDeadEnds(graph: UserJourneyGraph, items: CMSContentItem[]): string[] {
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const deadEnds: string[] = [];

  for (const node of graph.nodes) {
    const hasOutgoing = graph.transitions.some((t) => t.fromId === node.contentItemId);
    const item = itemMap.get(node.contentItemId);
    if (!hasOutgoing && item && node.stepType !== "cta" && item.indexing.indexable) {
      deadEnds.push(node.contentItemId);
    }
  }
  return deadEnds;
}

export function findMissingJourneySteps(
  graph: UserJourneyGraph,
  items: CMSContentItem[],
): Array<{ contentItemId: string; missingStep: JourneyStepType }> {
  const missing: Array<{ contentItemId: string; missingStep: JourneyStepType }> = [];
  for (const template of JOURNEY_TEMPLATES) {
    for (const item of items) {
      const startType = classifyStep(item);
      const startIdx = template.indexOf(startType);
      if (startIdx < 0 || startIdx >= template.length - 1) continue;
      const expectedNext = template[startIdx + 1];
      const outgoing = graph.transitions.filter((t) => t.fromId === item.id);
      const hasNext = outgoing.some((t) => {
        const target = items.find((i) => i.id === t.toId);
        return target && classifyStep(target) === expectedNext;
      });
      if (!hasNext) {
        missing.push({ contentItemId: item.id, missingStep: expectedNext });
      }
    }
  }
  return missing;
}

export function findHighDropOffTransitions(
  graph: UserJourneyGraph,
  analytics?: Record<string, { views: number; exits: number }>,
): Array<{ fromId: string; toId: string; dropOffRate: number }> {
  const results: Array<{ fromId: string; toId: string; dropOffRate: number }> = [];
  if (!analytics) return results;

  for (const t of graph.transitions) {
    const stats = analytics[t.fromId];
    if (!stats?.views) continue;
    const dropOffRate = stats.exits / stats.views;
    if (dropOffRate > 0.7) {
      results.push({ fromId: t.fromId, toId: t.toId, dropOffRate });
    }
  }
  return results;
}

export function recommendNextStepLinks(
  page: CMSContentItem,
  items: CMSContentItem[],
): LinkRecommendation[] {
  const graph = buildUserJourneyGraph(items);
  const missing = findMissingJourneySteps(graph, items).filter((m) => m.contentItemId === page.id);
  const recommendations: LinkRecommendation[] = [];

  for (const m of missing) {
    const target = items.find((i) => classifyStep(i) === m.missingStep && i.indexing.indexable);
    if (!target || target.id === page.id) continue;

    recommendations.push({
      id: randomUUID(),
      sourceContentItemId: page.id,
      targetContentItemId: target.id,
      relation: "next-step",
      score: 68,
      confidence: "medium",
      factors: {
        semanticRelevance: 0.65,
        entityOverlap: 0.5,
        clusterRelationship: page.clusterId === target.clusterId ? 0.8 : 0.3,
        userJourneyValue: 0.9,
        businessValue: m.missingStep === "service" || m.missingStep === "calculator" ? 0.85 : 0.4,
        targetPriority: 0.6,
        targetDepth: 0.5,
        targetAuthorityNeed: 0.4,
        duplicationPenalty: 0,
        anchorRiskPenalty: 0,
        linkDensityPenalty: 0,
      },
      suggestedAnchors: [target.title],
      suggestedPlacement: "body",
      explanation: `Suggested next journey step: ${m.missingStep}`,
      evidence: ["user journey template"],
      status: "suggested",
      createdAt: new Date().toISOString(),
    });
  }
  return recommendations;
}

export function recommendCommercialJourney(
  page: CMSContentItem,
  items: CMSContentItem[],
): LinkRecommendation[] {
  const commercial = items.filter(
    (i) =>
      i.indexing.indexable &&
      (i.url.includes("/calculator") || i.contentType?.includes("service")),
  );
  return commercial.slice(0, 3).map((target) => ({
    id: randomUUID(),
    sourceContentItemId: page.id,
    targetContentItemId: target.id,
    relation: "leads-to",
    score: 60,
    confidence: "medium",
    factors: {
      semanticRelevance: 0.5,
      entityOverlap: 0.4,
      clusterRelationship: 0.5,
      userJourneyValue: 0.7,
      businessValue: 0.9,
      targetPriority: 0.8,
      targetDepth: 0.5,
      targetAuthorityNeed: 0.3,
      duplicationPenalty: 0,
      anchorRiskPenalty: 0,
      linkDensityPenalty: 0,
    },
    suggestedAnchors: [target.title],
    suggestedPlacement: "cta",
    explanation: "Commercial journey destination",
    evidence: ["commercial path"],
    status: "suggested",
    createdAt: new Date().toISOString(),
  }));
}

export function validateJourneyRecommendation(recommendation: LinkRecommendation): {
  valid: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (recommendation.sourceContentItemId === recommendation.targetContentItemId) {
    reasons.push("Self-link without user benefit");
  }
  if (recommendation.confidence === "low" && recommendation.factors.userJourneyValue < 0.5) {
    reasons.push("Insufficient journey value for low confidence recommendation");
  }
  return { valid: reasons.length === 0, reasons };
}

export const userJourneyGraphService = {
  buildUserJourneyGraph,
  findJourneyDeadEnds,
  findMissingJourneySteps,
  findHighDropOffTransitions,
  recommendNextStepLinks,
  recommendCommercialJourney,
  validateJourneyRecommendation,
};
