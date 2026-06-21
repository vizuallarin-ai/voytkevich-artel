import { randomUUID } from "crypto";
import type { InternalLinkRecord } from "@/types/internal-link";
import { knowledgeGraphStore } from "@/lib/knowledge-graph/knowledge-graph-store";
import { getRedirect } from "@/lib/seo-indexation/redirect-service";
import { knowledgeGraphAnalytics } from "@/lib/knowledge-graph/knowledge-graph-analytics";

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "") || "/";
}

function resolveFinalCanonical(url: string): string {
  let current = normalizeUrl(url);
  for (let i = 0; i < 5; i++) {
    const redirect = getRedirect(current);
    if (!redirect?.active) break;
    current = normalizeUrl(redirect.to);
  }
  return current;
}

export function findLinksToRedirectSource(sourceUrl: string): InternalLinkRecord[] {
  const normalized = normalizeUrl(sourceUrl);
  return knowledgeGraphStore.listLinkRecords().filter(
    (l) => normalizeUrl(l.targetUrl) === normalized,
  );
}

export function recommendDirectLinkUpdates(
  sourceUrl: string,
  targetUrl: string,
): Array<{ linkId: string; oldTarget: string; newTarget: string; requiresReview: true }> {
  const finalTarget = resolveFinalCanonical(targetUrl);
  return findLinksToRedirectSource(sourceUrl).map((link) => ({
    linkId: link.id,
    oldTarget: link.targetUrl,
    newTarget: finalTarget,
    requiresReview: true as const,
  }));
}

export function handleContentRedirect(sourceUrl: string, targetUrl: string): {
  affectedLinks: InternalLinkRecord[];
  recommendations: ReturnType<typeof recommendDirectLinkUpdates>;
} {
  const affected = findLinksToRedirectSource(sourceUrl);
  for (const link of affected) {
    knowledgeGraphStore.saveLinkRecord({ ...link, status: "redirected", lastCheckedAt: new Date().toISOString() });
  }
  knowledgeGraphStore.logAudit({
    action: "redirect_link_maintenance",
    entityType: "batch",
    entityId: randomUUID(),
    reason: `${sourceUrl} → ${targetUrl}`,
  });
  return {
    affectedLinks: affected,
    recommendations: recommendDirectLinkUpdates(sourceUrl, targetUrl),
  };
}

export function handleContentMerge(sourceIds: string[], targetId: string): {
  mergedLinkCount: number;
  requiresReview: true;
} {
  let count = 0;
  for (const sourceId of sourceIds) {
    const links = knowledgeGraphStore.listLinkRecords().filter(
      (l) => l.sourceContentItemId === sourceId || l.targetContentItemId === sourceId,
    );
    count += links.length;
    for (const link of links) {
      knowledgeGraphStore.saveLinkRecord({ ...link, status: "suggested", lastCheckedAt: new Date().toISOString() });
    }
  }
  knowledgeGraphStore.logAudit({
    action: "merge_link_maintenance",
    entityType: "batch",
    entityId: randomUUID(),
    contentItemId: targetId,
    reason: `Merged ${sourceIds.length} sources`,
  });
  return { mergedLinkCount: count, requiresReview: true };
}

export function handleContentSlugChange(
  contentItemId: string,
  oldUrl: string,
  newUrl: string,
): ReturnType<typeof recommendDirectLinkUpdates> {
  knowledgeGraphStore.logAudit({
    action: "slug_change_maintenance",
    entityType: "node",
    entityId: contentItemId,
    contentItemId,
    previousValue: oldUrl,
    newValue: newUrl,
  });
  return recommendDirectLinkUpdates(oldUrl, newUrl);
}

export function updateApprovedInternalLinks(
  changes: Array<{ linkId: string; newTarget: string; anchorText?: string }>,
): InternalLinkRecord[] {
  const updated: InternalLinkRecord[] = [];
  for (const change of changes) {
    const link = knowledgeGraphStore.getLinkRecord(change.linkId);
    if (!link) continue;
    const next: InternalLinkRecord = {
      ...link,
      targetUrl: resolveFinalCanonical(change.newTarget),
      anchorText: change.anchorText ?? link.anchorText,
      status: "active",
      lastCheckedAt: new Date().toISOString(),
    };
    knowledgeGraphStore.saveLinkRecord(next);
    updated.push(next);
  }
  return updated;
}

export function verifyLinkMaintenance(changes: Array<{ linkId: string; newTarget: string }>): {
  valid: boolean;
  broken: string[];
} {
  const broken: string[] = [];
  for (const change of changes) {
    const finalUrl = resolveFinalCanonical(change.newTarget);
    if (getRedirect(finalUrl)) broken.push(change.linkId);
  }
  return { valid: broken.length === 0, broken };
}

export function rollbackLinkMaintenance(batchId: string): boolean {
  const batch = knowledgeGraphStore.getBatch(batchId);
  if (!batch?.rollbackSnapshot) return false;

  for (const link of batch.rollbackSnapshot) {
    knowledgeGraphStore.saveLinkRecord(link);
  }

  knowledgeGraphStore.saveBatch({ ...batch, status: "rolled-back", updatedAt: new Date().toISOString() });
  knowledgeGraphAnalytics.trackLinkBatchRolledBack({ batchId });
  return true;
}

export const linkMaintenanceService = {
  handleContentRedirect,
  handleContentMerge,
  handleContentSlugChange,
  findLinksToRedirectSource,
  recommendDirectLinkUpdates,
  updateApprovedInternalLinks,
  verifyLinkMaintenance,
  rollbackLinkMaintenance,
};
