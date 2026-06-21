import type { CMSContentItem } from "@/types/content-cms";
import type { LinkRecommendation } from "@/types/link-recommendation";
import { cmsKnowledgeGraphIntegration } from "@/lib/knowledge-graph/cms-knowledge-graph-integration";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { linkOpportunityService } from "@/lib/internal-linking/link-opportunity-service";
import { anchorDiversityService } from "@/lib/internal-linking/anchor-diversity-service";
import { cannibalizationGraphService } from "@/lib/knowledge-graph/cannibalization-graph-service";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { knowledgeGraphService } from "@/lib/knowledge-graph/knowledge-graph-service";

export type AIGraphContext = {
  entityContext: string[];
  clusterContext?: string;
  pillarNodeId?: string;
  supportingPages: string[];
  commercialDestinations: string[];
  preferredLinks: LinkRecommendation[];
  forbiddenTargets: string[];
  existingAnchors: string[];
  anchorWarnings: string[];
  cannibalizationRisks: string[];
  userJourneyHints: string[];
  requiresHumanReview: true;
};

export type AIContentBrief = {
  contentItemId?: string;
  clusterId?: string;
  objective?: string;
};

export async function buildGraphContextForAI(contentBrief: AIContentBrief): Promise<AIGraphContext> {
  const items = await contentRepository.listContent();
  const graph = knowledgeGraphService.snapshot();

  let contentItem: CMSContentItem | null = null;
  if (contentBrief.contentItemId) {
    contentItem = await contentRepository.getContentById(contentBrief.contentItemId);
    await cmsKnowledgeGraphIntegration.syncCMSContentToGraph(contentBrief.contentItemId);
  }

  const cmsContext = contentBrief.contentItemId
    ? await cmsKnowledgeGraphIntegration.getCMSGraphContext(contentBrief.contentItemId)
    : null;

  const forbiddenTargets = items
    .filter(
      (i) =>
        !i.indexing.indexable ||
        i.status === "draft" ||
        i.status === "review" ||
        i.quality.shouldNoindex,
    )
    .map((i) => i.url);

  const existingAnchors = knowledgeGraphStore
    .listLinkRecords()
    .filter((l) => l.sourceContentItemId === contentBrief.contentItemId)
    .map((l) => l.anchorText)
    .filter(Boolean) as string[];

  const anchorWarnings = contentItem
    ? await anchorDiversityService.getAnchorDiversityWarnings(
        contentItem.url,
        knowledgeGraphStore.listLinkRecords().filter((l) => l.targetUrl === contentItem!.url),
      )
    : [];

  const conflicts = cannibalizationGraphService.findCompetingContentNodes(graph);
  const cannibalizationRisks = conflicts
    .filter((c) => c.sourceContentItemId === contentBrief.contentItemId || c.targetContentItemId === contentBrief.contentItemId)
    .map((c) => c.id);

  const preferredLinks = contentItem
    ? (await linkOpportunityService.findLinkOpportunities(contentItem, graph)).slice(0, 5)
    : [];

  return {
    entityContext: cmsContext?.entities ?? [],
    clusterContext: contentBrief.clusterId ?? contentItem?.clusterId,
    pillarNodeId: undefined,
    supportingPages: cmsContext?.outgoingLinks ?? [],
    commercialDestinations: items.filter((i) => i.url.includes("/calculator")).map((i) => i.id),
    preferredLinks,
    forbiddenTargets,
    existingAnchors,
    anchorWarnings,
    cannibalizationRisks,
    userJourneyHints: ["informational → comparison → service → calculator"],
    requiresHumanReview: true,
  };
}

export function recommendLinksForGeneratedDraft(
  draft: CMSContentItem,
  graph = knowledgeGraphService.snapshot(),
): Promise<LinkRecommendation[]> {
  return linkOpportunityService.findLinkOpportunities(draft, graph);
}

export async function validateAIGeneratedLinks(
  draft: CMSContentItem,
  graph = knowledgeGraphService.snapshot(),
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  const opportunities = await linkOpportunityService.findLinkOpportunities(draft, graph);
  const invalidTargets = detectInvalidAITargets(draft);
  issues.push(...invalidTargets);

  if (detectAIGeneratedLinkStuffing(draft)) {
    issues.push("Potential link stuffing detected in draft");
  }

  if (opportunities.length === 0) {
    issues.push("No safe link opportunities found for draft");
  }

  return { valid: issues.length === 0, issues };
}

export function detectAIGeneratedLinkStuffing(draft: CMSContentItem & { body?: string }): boolean {
  const body = draft.body ?? draft.seoDescription ?? "";
  const linkMatches = body.match(/\[([^\]]+)\]\(\/[^)]+\)/g) ?? [];
  const wordCount = body.split(/\s+/).length || 1;
  return linkMatches.length / wordCount > 0.05;
}

export function detectInvalidAITargets(draft: CMSContentItem & { body?: string }): string[] {
  const body = draft.body ?? "";
  const hrefs = [...body.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
  const mdLinks = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]);
  const issues: string[] = [];

  for (const href of [...hrefs, ...mdLinks]) {
    if (href.startsWith("http") && !href.includes("stroistroy")) {
      issues.push(`External link in draft: ${href}`);
    }
  }
  return issues;
}

export function attachApprovedGraphContextToBrief(brief: AIContentBrief): Promise<AIGraphContext> {
  return buildGraphContextForAI(brief);
}

export const aiFactoryGraphIntegration = {
  buildGraphContextForAI,
  recommendLinksForGeneratedDraft,
  validateAIGeneratedLinks,
  detectAIGeneratedLinkStuffing,
  detectInvalidAITargets,
  attachApprovedGraphContextToBrief,
};
