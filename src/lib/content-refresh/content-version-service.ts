import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { ContentVersion, ContentVersionStatus } from "@/types/content-version";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { logContentAudit } from "@/lib/content-cms/content-audit-log";
import { contentDiffService } from "@/lib/content-refresh/content-diff-service";
import { refreshStore } from "@/lib/content-refresh/refresh-store";

export type CreateContentVersionInput = {
  contentItem: CMSContentItem;
  content?: unknown;
  metadata?: unknown;
  changeType: ContentVersion["changeType"];
  changeSummary: string;
  createdBy: string;
  updateBriefId?: string;
  experimentId?: string;
  parentVersionId?: string;
};

export function createContentVersion(input: CreateContentVersionInput): ContentVersion {
  const existing = refreshStore.getVersionsByContentItem(input.contentItem.id);
  const versionNumber = existing.length > 0 ? existing[0].versionNumber + 1 : 1;

  const version: ContentVersion = {
    id: randomUUID(),
    contentItemId: input.contentItem.id,
    versionNumber,
    status: "draft",
    content: input.content ?? { ...input.contentItem },
    metadata: input.metadata ?? {
      title: input.contentItem.title,
      seoTitle: input.contentItem.seoTitle,
      seoDescription: input.contentItem.seoDescription,
      url: input.contentItem.url,
    },
    changeType: input.changeType,
    updateBriefId: input.updateBriefId,
    experimentId: input.experimentId,
    parentVersionId: input.parentVersionId,
    changeSummary: input.changeSummary,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };

  refreshStore.saveVersion(version);
  refreshStore.logAudit({
    action: "content_version_created",
    entityType: "version",
    entityId: version.id,
    contentItemId: version.contentItemId,
    actorId: input.createdBy,
  });

  return version;
}

export function getContentVersion(versionId: string): ContentVersion | undefined {
  return refreshStore.getVersion(versionId);
}

export function getContentVersionHistory(contentItemId: string): ContentVersion[] {
  return refreshStore.getVersionsByContentItem(contentItemId);
}

export function compareContentVersions(
  beforeId: string,
  afterId: string,
): ReturnType<typeof contentDiffService.buildContentDiff> | null {
  const before = refreshStore.getVersion(beforeId);
  const after = refreshStore.getVersion(afterId);
  if (!before || !after) return null;
  return contentDiffService.buildContentDiff(
    before.content as CMSContentItem,
    after.content as CMSContentItem,
  );
}

function updateVersionStatus(
  versionId: string,
  status: ContentVersionStatus,
  extra?: Partial<ContentVersion>,
): ContentVersion | null {
  const version = refreshStore.getVersion(versionId);
  if (!version) return null;
  const updated = { ...version, ...extra, status };
  refreshStore.saveVersion(updated);
  return updated;
}

export async function publishContentVersion(versionId: string): Promise<ContentVersion | null> {
  const version = refreshStore.getVersion(versionId);
  if (!version || version.status !== "approved") return null;

  const item = await contentRepository.getContentById(version.contentItemId);
  if (!item) return null;

  const publishedSnapshot = createContentVersion({
    contentItem: item,
    changeType: "manual",
    changeSummary: "Pre-publish snapshot",
    createdBy: "system",
  });
  updateVersionStatus(publishedSnapshot.id, "published", {
    publishedAt: new Date().toISOString(),
  });

  const content = version.content as Partial<CMSContentItem>;
  await contentRepository.updateContent(version.contentItemId, content);

  const published = updateVersionStatus(versionId, "published", {
    publishedAt: new Date().toISOString(),
  });

  logContentAudit({
    contentId: version.contentItemId,
    action: "refresh_version_published",
    message: version.changeSummary,
  });

  return published;
}

export function rejectContentVersion(versionId: string, reason: string): ContentVersion | null {
  refreshStore.logAudit({
    action: "content_version_rejected",
    entityType: "version",
    entityId: versionId,
    reason,
  });
  return updateVersionStatus(versionId, "rejected");
}

export function archiveContentVersion(versionId: string): ContentVersion | null {
  return updateVersionStatus(versionId, "archived");
}

export function createRollbackVersion(
  contentItemId: string,
  targetVersionId: string,
): ContentVersion | null {
  const target = refreshStore.getVersion(targetVersionId);
  if (!target || target.contentItemId !== contentItemId) return null;

  return createContentVersion({
    contentItem: target.content as CMSContentItem,
    content: target.content,
    metadata: target.metadata,
    changeType: "rollback",
    changeSummary: `Rollback to version ${target.versionNumber}`,
    createdBy: "system",
    parentVersionId: targetVersionId,
  });
}

export async function restoreContentVersion(versionId: string): Promise<ContentVersion | null> {
  const version = refreshStore.getVersion(versionId);
  if (!version) return null;

  const rollbackVersion = createRollbackVersion(version.contentItemId, versionId);
  if (!rollbackVersion) return null;

  return updateVersionStatus(rollbackVersion.id, "approved");
}

export const contentVersionService = {
  createContentVersion,
  getContentVersion,
  getContentVersionHistory,
  compareContentVersions,
  publishContentVersion,
  rejectContentVersion,
  archiveContentVersion,
  createRollbackVersion,
  restoreContentVersion,
};
