import type { CMSContentItem } from "@/types/content-cms";
import type { ContentUpdateBrief } from "@/types/content-update-brief";
import type { ContentSourceRecord } from "@/types/content-source";
import { contentDiffService } from "@/lib/content-refresh/content-diff-service";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export type RefreshDraftContext = {
  brief: ContentUpdateBrief;
  currentContent: CMSContentItem;
  sources: ContentSourceRecord[];
  toneOfVoice?: string;
  targetRegion?: string;
  unsupportedClaims?: string[];
};

export type RefreshDraftResult = {
  draft: Partial<CMSContentItem>;
  explanation: string;
  validation: { valid: boolean; errors: string[]; warnings: string[] };
  requiresHumanReview: true;
  autoPublish: false;
};

export type AIRefreshPrompt = {
  systemInstructions: string;
  userPrompt: string;
  constraints: string[];
  protectedElements: string[];
  verifiedSources: ContentSourceRecord[];
  unsupportedClaims: string[];
};

export function buildRefreshPrompt(
  brief: ContentUpdateBrief,
  currentContent: CMSContentItem,
  sources: ContentSourceRecord[],
): AIRefreshPrompt {
  const constraints = [
    "Do not invent prices, timelines, project specs, or regulatory data",
    "Do not change URL or canonical",
    "Do not remove protected elements without explicit approval",
    "Do not publish — output draft only",
    "Match search intent and Irkutsk region context",
    "Cite only verified sources for factual claims",
  ];

  return {
    systemInstructions: `AI-assisted content refresh for ${currentContent.kind}. Output structured draft only.`,
    userPrompt: [
      `Objective: ${brief.objective}`,
      `Hypothesis: ${brief.hypothesis}`,
      `Problem: ${brief.currentProblem.summary}`,
      `Search intent: ${brief.searchIntent}`,
      `Allowed changes: ${JSON.stringify(brief.proposedChanges)}`,
    ].join("\n"),
    constraints,
    protectedElements: brief.protectedElements,
    verifiedSources: sources.filter((s) => s.status === "verified"),
    unsupportedClaims: brief.proposedChanges.factsToVerify ?? [],
  };
}

export function generateRefreshDraft(context: RefreshDraftContext): RefreshDraftResult {
  buildRefreshPrompt(context.brief, context.currentContent, context.sources);
  const draft: Partial<CMSContentItem> = {
    ...context.currentContent,
    status: "draft",
    quality: {
      ...context.currentContent.quality,
      canPublish: false,
      requiresHumanReview: true,
    },
  };

  if (context.brief.proposedChanges.title) {
    draft.title = context.brief.proposedChanges.title;
  }
  if (context.brief.proposedChanges.description) {
    draft.seoDescription = context.brief.proposedChanges.description;
  }

  const validation = validateAIDraftAgainstBrief(draft, context.brief);
  const unsupported = detectUnsupportedAIClaims(draft, context.sources);

  if (unsupported.length > 0) {
    validation.valid = false;
    validation.errors.push(...unsupported.map((c) => `Unsupported claim: ${c}`));
  }

  refreshAnalytics.trackRefreshDraftGenerated({
    contentItemId: context.brief.contentItemId,
    briefId: context.brief.id,
  });

  return {
    draft,
    explanation: generateAIChangeExplanation(context.currentContent, draft),
    validation,
    requiresHumanReview: true,
    autoPublish: false,
  };
}

export function generateSectionRewrite(
  section: string,
  brief: ContentUpdateBrief,
): { section: string; suggestion: string; requiresHumanReview: true } {
  return {
    section,
    suggestion: `Rewrite ${section} to address: ${brief.currentProblem.summary}. Verify facts before publishing.`,
    requiresHumanReview: true,
  };
}

export function generateMetadataVariants(
  content: CMSContentItem,
  brief: ContentUpdateBrief,
): { title?: string; description?: string }[] {
  const variants: { title?: string; description?: string }[] = [];
  if (brief.proposedChanges.title) {
    variants.push({ title: brief.proposedChanges.title });
  }
  if (content.seoTitle) {
    variants.push({ title: content.seoTitle });
  }
  if (brief.proposedChanges.description) {
    variants.push({ description: brief.proposedChanges.description });
  }
  return variants.slice(0, 3);
}

export function generateCTAVariants(
  content: CMSContentItem,
  brief: ContentUpdateBrief,
): string[] {
  return brief.proposedChanges.ctaChanges ?? ["Request consultation", "Calculate cost"];
}

export function generateInternalLinkSuggestions(
  content: CMSContentItem,
  context: { relatedUrls?: string[] },
): string[] {
  return context.relatedUrls ?? briefLinksFromRelated(content);
}

function briefLinksFromRelated(content: CMSContentItem): string[] {
  return [
    ...(content.related.projects ?? []),
    ...(content.related.technicalArticles ?? []),
    ...(content.related.programmaticPages ?? []),
  ];
}

export function validateAIDraftAgainstBrief(
  draft: Partial<CMSContentItem>,
  brief: ContentUpdateBrief,
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (draft.url && brief.protectedElements.some((p) => p.startsWith("URL:"))) {
    errors.push("Draft must not change protected URL");
  }

  if (
    draft.indexing?.canonicalUrl &&
    brief.protectedElements.some((p) => p.startsWith("Canonical:"))
  ) {
    errors.push("Draft must not change protected canonical");
  }

  if (!brief.objective.trim()) errors.push("Brief objective missing");
  if (brief.protectedElements.length === 0) warnings.push("No protected elements in brief");

  return { valid: errors.length === 0, errors, warnings };
}

type ContentWithBody = Partial<CMSContentItem> & { body?: string };

export function detectUnsupportedAIClaims(
  draft: Partial<CMSContentItem>,
  sources: ContentSourceRecord[],
): string[] {
  const body = (draft as ContentWithBody).body ?? "";
  const pricePattern = /\d+\s*(₽|руб|тыс)/gi;
  if (pricePattern.test(body)) {
    const hasPriceSource = sources.some(
      (s) => s.status === "verified" && s.supportsClaims.some((c) => c.includes("price")),
    );
    if (!hasPriceSource) return ["price claim without verified source"];
  }
  return [];
}

export function generateAIChangeExplanation(
  before: CMSContentItem,
  after: Partial<CMSContentItem>,
): string {
  const diff = contentDiffService.buildContentDiff(before, after);
  return diff.humanReadable.join(". ") || "No significant changes detected";
}

export const aiRefreshService = {
  buildRefreshPrompt,
  generateRefreshDraft,
  generateSectionRewrite,
  generateMetadataVariants,
  generateCTAVariants,
  generateInternalLinkSuggestions,
  validateAIDraftAgainstBrief,
  detectUnsupportedAIClaims,
  generateAIChangeExplanation,
};
