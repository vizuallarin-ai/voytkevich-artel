import type { ContentVersion } from "@/types/content-version";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { refreshReviewService } from "@/lib/content-refresh/refresh-review-service";
import { refreshSeoValidator } from "@/lib/content-refresh/refresh-seo-validator";
import { sourceVerificationService } from "@/lib/content-refresh/source-verification-service";
import { protectedElementsService } from "@/lib/content-refresh/protected-elements-service";
import { contentVersionService } from "@/lib/content-refresh/content-version-service";
import { postRefreshMonitoringService } from "@/lib/content-refresh/post-refresh-monitoring-service";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";
import type { CMSContentItem } from "@/types/content-cms";
import { contentDiffService } from "@/lib/content-refresh/content-diff-service";

export function scheduleRefreshPublication(
  versionId: string,
  date: string,
): { scheduled: boolean; versionId: string; scheduledAt: string } | null {
  const version = refreshStore.getVersion(versionId);
  if (!version) return null;

  const check = refreshReviewService.canPublishRefreshVersion(versionId);
  if (!check.allowed) return null;

  refreshStore.setScheduledPublication(versionId, {
    versionId,
    scheduledAt: date,
    createdAt: new Date().toISOString(),
  });

  const updated = { ...version, status: "approved" as const };
  refreshStore.saveVersion(updated);

  return { scheduled: true, versionId, scheduledAt: date };
}

export async function validateRefreshBeforePublication(versionId: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const version = refreshStore.getVersion(versionId);
  if (!version) return { valid: false, errors: ["Version not found"], warnings: [] };

  const item = await contentRepository.getContentById(version.contentItemId);
  if (!item) return { valid: false, errors: ["Content item not found"], warnings: [] };

  const draft = version.content as Partial<CMSContentItem>;
  const errors: string[] = [];
  const warnings: string[] = [];

  const reviewCheck = refreshReviewService.canPublishRefreshVersion(versionId);
  if (!reviewCheck.allowed) errors.push(...reviewCheck.reasons);

  const diff = contentDiffService.buildContentDiff(item, draft);
  const protectedCheck = protectedElementsService.requireAdditionalApprovalForProtectedChanges(diff);
  if (protectedCheck.required && protectedCheck.reasons.length > 0) {
    errors.push(`Protected element changes require approval: ${protectedCheck.reasons.join(", ")}`);
  }

  const seoReport = refreshSeoValidator.buildRefreshSEOValidationReport(item, draft);
  errors.push(...seoReport.blockingErrors);
  warnings.push(...seoReport.warnings);

  const brief = version.updateBriefId ? refreshStore.getBrief(version.updateBriefId) : undefined;
  const sources = brief
    ? sourceVerificationService.collectSourcesForBrief(brief)
    : [];
  const sourceReport = sourceVerificationService.buildSourceVerificationReport(
    { contentItemId: item.id, contentType: item.kind },
    sources,
  );
  if (!sourceReport.passed) {
    errors.push("Source verification failed");
  }

  if (draft.url && draft.url !== item.url) {
    errors.push("URL changed without migration strategy");
  }

  const history = refreshStore.getVersionsByContentItem(item.id);
  const hasPublishedBaseline = history.some((v) => v.status === "published");
  if (!hasPublishedBaseline && item.status === "published") {
    warnings.push("No explicit baseline version — current published state will be snapshotted");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export async function publishApprovedRefresh(versionId: string): Promise<ContentVersion | null> {
  const validation = await validateRefreshBeforePublication(versionId);
  if (!validation.valid) return null;

  const version = refreshStore.getVersion(versionId);
  if (!version) return null;

  refreshStore.saveVersion({ ...version, status: "approved" });
  const published = await contentVersionService.publishContentVersion(versionId);
  if (!published) return null;

  refreshAnalytics.trackRefreshVersionPublished({
    versionId,
    contentItemId: published.contentItemId,
  });

  triggerPostRefreshChecks(versionId);
  createPostRefreshMonitoringWindow(versionId);

  return published;
}

export function cancelRefreshPublication(versionId: string, reason: string): boolean {
  refreshStore.deleteScheduledPublication(versionId);
  refreshStore.logAudit({
    action: "refresh_publication_cancelled",
    entityType: "version",
    entityId: versionId,
    reason,
  });
  return true;
}

export async function triggerPostRefreshChecks(versionId: string): Promise<void> {
  const version = refreshStore.getVersion(versionId);
  if (!version) return;

  refreshStore.logAudit({
    action: "post_refresh_checks_triggered",
    entityType: "version",
    entityId: versionId,
    contentItemId: version.contentItemId,
  });
}

export function createPostRefreshMonitoringWindow(versionId: string) {
  const version = refreshStore.getVersion(versionId);
  if (!version) return null;
  return postRefreshMonitoringService.createMonitoringWindow(version);
}

export const refreshPublicationService = {
  scheduleRefreshPublication,
  publishApprovedRefresh,
  cancelRefreshPublication,
  validateRefreshBeforePublication,
  triggerPostRefreshChecks,
  createPostRefreshMonitoringWindow,
};
