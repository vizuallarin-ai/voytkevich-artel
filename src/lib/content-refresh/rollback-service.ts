import type { CMSContentItem } from "@/types/content-cms";
import type { ContentVersion } from "@/types/content-version";
import type { PostRefreshMonitoringWindow } from "@/types/post-refresh-monitoring";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { logContentAudit } from "@/lib/content-cms/content-audit-log";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { contentVersionService } from "@/lib/content-refresh/content-version-service";
import { refreshSeoValidator } from "@/lib/content-refresh/refresh-seo-validator";
import { postRefreshMonitoringService } from "@/lib/content-refresh/post-refresh-monitoring-service";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export function canRollbackContent(contentItemId: string): {
  canRollback: boolean;
  availableVersions: ContentVersion[];
} {
  const versions = refreshStore
    .getVersionsByContentItem(contentItemId)
    .filter((v) => v.status === "published" || v.status === "archived");
  return {
    canRollback: versions.length > 0,
    availableVersions: versions,
  };
}

export function recommendRollback(
  contentItemId: string,
  monitoring: PostRefreshMonitoringWindow,
): { recommended: boolean; reason: string; requiresManualApproval: true } {
  const recommendation = postRefreshMonitoringService.recommendKeepImproveOrRollback(monitoring);
  const recommended = recommendation === "rollback" || recommendation === "investigate";
  return {
    recommended,
    reason: recommended
      ? `Monitoring recommendation: ${recommendation}`
      : "No rollback recommended",
    requiresManualApproval: true,
  };
}

export async function previewRollback(
  contentItemId: string,
  targetVersionId: string,
): Promise<{ diff: ReturnType<typeof contentVersionService.compareContentVersions>; target: ContentVersion | undefined } | null> {
  const target = refreshStore.getVersion(targetVersionId);
  if (!target || target.contentItemId !== contentItemId) return null;

  const current = await contentRepository.getContentById(contentItemId);
  if (!current) return null;

  const currentVersion = refreshStore.getVersionsByContentItem(contentItemId)[0];
  const diff = currentVersion
    ? contentVersionService.compareContentVersions(currentVersion.id, targetVersionId)
    : null;

  return { diff, target };
}

export function validateRollback(targetVersion: ContentVersion): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!targetVersion.content) errors.push("Target version has no content");
  if (targetVersion.status === "rejected") errors.push("Cannot rollback to rejected version");
  return { valid: errors.length === 0, errors };
}

export async function executeApprovedRollback(
  contentItemId: string,
  targetVersionId: string,
  actor: string,
): Promise<ContentVersion | null> {
  const target = refreshStore.getVersion(targetVersionId);
  if (!target) return null;

  const validation = validateRollback(target);
  if (!validation.valid) return null;

  const rollbackVersion = contentVersionService.createRollbackVersion(contentItemId, targetVersionId);
  if (!rollbackVersion) return null;

  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return null;

  const targetContent = target.content as Partial<CMSContentItem>;
  const seoCheck = refreshSeoValidator.buildRefreshSEOValidationReport(item, targetContent);
  if (!seoCheck.valid) return null;

  await contentRepository.updateContent(contentItemId, targetContent);

  refreshStore.saveVersion({ ...rollbackVersion, status: "approved" });
  const published = await contentVersionService.publishContentVersion(rollbackVersion.id);
  if (!published) return null;

  refreshStore.logAudit({
    action: "rollback_executed",
    entityType: "version",
    entityId: rollbackVersion.id,
    contentItemId,
    actorId: actor,
    reason: `Rollback to version ${target.versionNumber}`,
  });

  logContentAudit({
    contentId: contentItemId,
    action: "refresh_rollback",
    actorId: actor,
    message: `Rolled back to version ${target.versionNumber}`,
  });

  refreshAnalytics.trackRefreshRollbackCompleted({
    contentItemId,
    versionId: rollbackVersion.id,
  });

  postRefreshMonitoringService.createMonitoringWindow(published);

  const candidate = refreshStore.listCandidates().find((c) => c.contentItemId === contentItemId);
  if (candidate) {
    refreshStore.saveCandidate({ ...candidate, status: "rolled-back", updatedAt: new Date().toISOString() });
  }

  return published;
}

export async function verifyRollback(contentItemId: string): Promise<{
  verified: boolean;
  indexabilityOk: boolean;
  canonicalOk: boolean;
}> {
  const item = await contentRepository.getContentById(contentItemId);
  if (!item) return { verified: false, indexabilityOk: false, canonicalOk: false };

  return {
    verified: true,
    indexabilityOk: item.indexing.indexable,
    canonicalOk: Boolean(item.indexing.canonicalUrl ?? item.url),
  };
}

export function recordRollbackReason(contentItemId: string, reason: string): void {
  refreshStore.setRollbackReason(contentItemId, reason);
  refreshStore.logAudit({
    action: "rollback_reason_recorded",
    entityType: "content",
    entityId: contentItemId,
    contentItemId,
    reason,
  });
}

export const rollbackService = {
  canRollbackContent,
  recommendRollback,
  previewRollback,
  validateRollback,
  executeApprovedRollback,
  verifyRollback,
  recordRollbackReason,
};
