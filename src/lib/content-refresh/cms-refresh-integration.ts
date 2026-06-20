import type { ContentRefreshCandidate } from "@/types/content-refresh";
import type { ContentUpdateBrief } from "@/types/content-update-brief";
import type { ContentVersion } from "@/types/content-version";
import { logContentAudit } from "@/lib/content-cms/content-audit-log";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { updateBriefService } from "@/lib/content-refresh/update-brief-service";
import { refreshReviewService } from "@/lib/content-refresh/refresh-review-service";
import { refreshPublicationService } from "@/lib/content-refresh/refresh-publication-service";

const cmsRefreshState = new Map<
  string,
  {
    candidateId?: string;
    briefId?: string;
    versionId?: string;
    status: string;
  }
>();

export async function createCMSRefreshTask(
  candidate: ContentRefreshCandidate,
): Promise<{ taskId: string; contentItemId: string }> {
  cmsRefreshState.set(candidate.contentItemId, {
    candidateId: candidate.id,
    status: candidate.status,
  });

  logContentAudit({
    contentId: candidate.contentItemId,
    action: "refresh_task_created",
    message: candidate.recommendedAction,
  });

  refreshStore.logAudit({
    action: "cms_refresh_task_created",
    entityType: "candidate",
    entityId: candidate.id,
    contentItemId: candidate.contentItemId,
  });

  return { taskId: candidate.id, contentItemId: candidate.contentItemId };
}

export async function attachUpdateBrief(
  contentItemId: string,
  brief: ContentUpdateBrief,
): Promise<void> {
  cmsRefreshState.set(contentItemId, {
    ...cmsRefreshState.get(contentItemId),
    briefId: brief.id,
    status: "brief-created",
  });
  await updateBriefService.sendUpdateBriefToCMS(brief);
}

export async function attachRefreshDraft(
  contentItemId: string,
  version: ContentVersion,
): Promise<void> {
  cmsRefreshState.set(contentItemId, {
    ...cmsRefreshState.get(contentItemId),
    versionId: version.id,
    status: "drafting",
  });

  logContentAudit({
    contentId: contentItemId,
    action: "refresh_draft_attached",
    message: version.changeSummary,
  });
}

export function getRefreshStatus(contentItemId: string): {
  status: string;
  candidateId?: string;
  briefId?: string;
  versionId?: string;
} {
  return cmsRefreshState.get(contentItemId) ?? { status: "none" };
}

export async function requestCMSRefreshReview(contentItemId: string): Promise<void> {
  const state = cmsRefreshState.get(contentItemId);
  if (!state?.versionId) return;
  refreshReviewService.requestRefreshReview(state.versionId, "editorial");
}

export async function scheduleCMSRefresh(contentItemId: string, date: string): Promise<boolean> {
  const state = cmsRefreshState.get(contentItemId);
  if (!state?.versionId) return false;
  const result = refreshPublicationService.scheduleRefreshPublication(state.versionId, date);
  if (result) {
    cmsRefreshState.set(contentItemId, { ...state, status: "scheduled" });
  }
  return Boolean(result);
}

export async function publishCMSRefresh(
  contentItemId: string,
  versionId: string,
): Promise<boolean> {
  const version = refreshStore.getVersion(versionId);
  if (!version || version.contentItemId !== contentItemId) return false;

  refreshStore.saveVersion({ ...version, status: "approved" });
  const published = await refreshPublicationService.publishApprovedRefresh(versionId);
  if (published) {
    cmsRefreshState.set(contentItemId, {
      ...cmsRefreshState.get(contentItemId),
      versionId,
      status: "published",
    });
  }
  return Boolean(published);
}

export async function getCMSRefreshHistory(contentItemId: string): Promise<{
  versions: ContentVersion[];
  audit: ReturnType<typeof refreshStore.getAuditLogByContentItem>;
}> {
  return {
    versions: refreshStore.getVersionsByContentItem(contentItemId),
    audit: refreshStore.getAuditLogByContentItem(contentItemId),
  };
}

export const cmsRefreshIntegration = {
  createCMSRefreshTask,
  attachUpdateBrief,
  attachRefreshDraft,
  getRefreshStatus,
  requestCMSRefreshReview,
  scheduleCMSRefresh,
  publishCMSRefresh,
  getCMSRefreshHistory,
};
