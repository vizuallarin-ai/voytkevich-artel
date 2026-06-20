import type { ContentUpdateBrief } from "@/types/content-update-brief";
import type { ContentVersion } from "@/types/content-version";
import { updateBriefService } from "@/lib/content-refresh/update-brief-service";
import { sourceVerificationService } from "@/lib/content-refresh/source-verification-service";
import { aiRefreshService } from "@/lib/content-refresh/ai-refresh-service";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { refreshStore } from "@/lib/content-refresh/refresh-store";

export type AIFactoryRefreshJob = {
  briefId: string;
  contentItemId: string;
  status: "queued" | "processing" | "completed" | "rejected";
  createdAt: string;
};

export type AIFactoryRefreshResult = {
  briefId: string;
  draft: ReturnType<typeof aiRefreshService.generateRefreshDraft>;
  versionId?: string;
};

const generationQueue: AIFactoryRefreshJob[] = [];

export async function sendUpdateBriefToAIFactory(brief: ContentUpdateBrief): Promise<AIFactoryRefreshJob> {
  const validation = updateBriefService.validateUpdateBrief(brief);
  if (!validation.valid) {
    throw new Error(`Brief invalid: ${validation.errors.join(", ")}`);
  }

  const job: AIFactoryRefreshJob = {
    briefId: brief.id,
    contentItemId: brief.contentItemId,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  generationQueue.push(job);

  refreshStore.logAudit({
    action: "refresh_brief_sent_to_ai_factory",
    entityType: "brief",
    entityId: brief.id,
    contentItemId: brief.contentItemId,
  });

  return job;
}

export function buildRefreshGenerationQueue(briefs: ContentUpdateBrief[]): AIFactoryRefreshJob[] {
  const safe = excludeUnsafeRefreshBriefs(briefs);
  return safe.map((brief) => ({
    briefId: brief.id,
    contentItemId: brief.contentItemId,
    status: "queued" as const,
    createdAt: new Date().toISOString(),
  }));
}

export function excludeUnsafeRefreshBriefs(briefs: ContentUpdateBrief[]): ContentUpdateBrief[] {
  return briefs.filter((brief) => {
    const validation = updateBriefService.validateUpdateBrief(brief);
    if (!validation.valid) return false;
    if (!brief.objective.trim()) return false;
    if (brief.currentProblem.evidence.length === 0) return false;
    if (brief.protectedElements.length === 0) return false;
    if (brief.requiredReviews.seo && brief.currentProblem.summary.includes("cannibalization")) return false;
    return true;
  });
}

export function attachVerifiedSourcesToGeneration(brief: ContentUpdateBrief): ContentUpdateBrief {
  const sources = sourceVerificationService.collectSourcesForBrief(brief);
  const verified = sources.filter((s) => s.status === "verified");
  if (verified.length === 0 && brief.requiredReviews.expert) {
    refreshStore.logAudit({
      action: "refresh_factory_missing_sources",
      entityType: "brief",
      entityId: brief.id,
      contentItemId: brief.contentItemId,
    });
  }
  return brief;
}

export async function receiveRefreshDraftFromAIFactory(
  result: AIFactoryRefreshResult,
): Promise<ContentVersion | null> {
  const validation = validateRefreshFactoryResult(result);
  if (!validation.valid) return null;

  const brief = refreshStore.getBrief(result.briefId);
  if (!brief) return null;

  const item = await contentRepository.getContentById(brief.contentItemId);
  if (!item) return null;

  const { contentVersionService } = await import("@/lib/content-refresh/content-version-service");
  const version = contentVersionService.createContentVersion({
    contentItem: item,
    content: result.draft.draft,
    changeType: "ai-assisted",
    changeSummary: result.draft.explanation,
    createdBy: "ai-content-factory",
    updateBriefId: brief.id,
  });

  return version;
}

export function validateRefreshFactoryResult(result: AIFactoryRefreshResult): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!result.draft.validation.valid) {
    errors.push(...result.draft.validation.errors);
  }

  if (result.draft.autoPublish) {
    errors.push("AI factory must not auto-publish");
  }

  if (!result.draft.requiresHumanReview) {
    errors.push("AI draft must require human review");
  }

  return { valid: errors.length === 0, errors };
}

export const aiFactoryRefreshIntegration = {
  sendUpdateBriefToAIFactory,
  buildRefreshGenerationQueue,
  excludeUnsafeRefreshBriefs,
  attachVerifiedSourcesToGeneration,
  receiveRefreshDraftFromAIFactory,
  validateRefreshFactoryResult,
};
