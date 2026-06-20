import { randomUUID } from "crypto";
import type { ContentRefreshCandidate } from "@/types/content-refresh";
import type { ContentUpdateBrief } from "@/types/content-update-brief";
import type { ContentVersion } from "@/types/content-version";
import type { ContentSourceRecord } from "@/types/content-source";
import type { PostRefreshMonitoringWindow } from "@/types/post-refresh-monitoring";

export type RefreshReviewType = "editorial" | "seo" | "expert" | "legal" | "final";

export type RefreshReviewStatus = "pending" | "approved" | "rejected" | "changes-requested";

export type RefreshReview = {
  id: string;
  versionId: string;
  reviewType: RefreshReviewType;
  status: RefreshReviewStatus;
  actorId?: string;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
};

export type RefreshAuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  contentItemId?: string;
  actorId?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  createdAt: string;
};

export type CandidateMeta = {
  assignedTo?: string;
  deferReason?: string;
  dismissReason?: string;
  deferredAt?: string;
  dismissedAt?: string;
};

export type ScheduledPublication = {
  versionId: string;
  scheduledAt: string;
  createdAt: string;
};

export type MonitoringMetricsSnapshot = {
  windowId: string;
  capturedAt: string;
  metrics: Record<string, number | null>;
  phase: "baseline" | "observation";
};

const candidates = new Map<string, ContentRefreshCandidate>();
const candidateMeta = new Map<string, CandidateMeta>();
const briefs = new Map<string, ContentUpdateBrief>();
const versions = new Map<string, ContentVersion>();
const reviews = new Map<string, RefreshReview>();
const monitoringWindows = new Map<string, PostRefreshMonitoringWindow>();
const sourceRecords = new Map<string, ContentSourceRecord>();
const scheduledPublications = new Map<string, ScheduledPublication>();
const monitoringMetrics = new Map<string, MonitoringMetricsSnapshot[]>();
const rollbackReasons = new Map<string, string>();
const auditLog: RefreshAuditEntry[] = [];

function logAudit(
  entry: Omit<RefreshAuditEntry, "id" | "createdAt">,
): RefreshAuditEntry {
  const full: RefreshAuditEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  auditLog.unshift(full);
  if (auditLog.length > 1000) auditLog.pop();
  return full;
}

export const refreshStore = {
  saveCandidate(candidate: ContentRefreshCandidate): ContentRefreshCandidate {
    candidates.set(candidate.id, candidate);
    return candidate;
  },

  getCandidate(id: string): ContentRefreshCandidate | undefined {
    return candidates.get(id);
  },

  listCandidates(): ContentRefreshCandidate[] {
    return [...candidates.values()];
  },

  deleteCandidate(id: string): void {
    candidates.delete(id);
    candidateMeta.delete(id);
  },

  getCandidateMeta(id: string): CandidateMeta | undefined {
    return candidateMeta.get(id);
  },

  setCandidateMeta(id: string, meta: CandidateMeta): void {
    candidateMeta.set(id, meta);
  },

  saveBrief(brief: ContentUpdateBrief): ContentUpdateBrief {
    briefs.set(brief.id, brief);
    return brief;
  },

  getBrief(id: string): ContentUpdateBrief | undefined {
    return briefs.get(id);
  },

  listBriefs(): ContentUpdateBrief[] {
    return [...briefs.values()];
  },

  getBriefsByContentItem(contentItemId: string): ContentUpdateBrief[] {
    return [...briefs.values()].filter((b) => b.contentItemId === contentItemId);
  },

  saveVersion(version: ContentVersion): ContentVersion {
    versions.set(version.id, version);
    return version;
  },

  getVersion(id: string): ContentVersion | undefined {
    return versions.get(id);
  },

  listVersions(): ContentVersion[] {
    return [...versions.values()];
  },

  getVersionsByContentItem(contentItemId: string): ContentVersion[] {
    return [...versions.values()]
      .filter((v) => v.contentItemId === contentItemId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  },

  saveReview(review: RefreshReview): RefreshReview {
    reviews.set(review.id, review);
    return review;
  },

  getReview(id: string): RefreshReview | undefined {
    return reviews.get(id);
  },

  listReviews(): RefreshReview[] {
    return [...reviews.values()];
  },

  getReviewsByVersion(versionId: string): RefreshReview[] {
    return [...reviews.values()].filter((r) => r.versionId === versionId);
  },

  saveMonitoringWindow(window: PostRefreshMonitoringWindow): PostRefreshMonitoringWindow {
    monitoringWindows.set(window.id, window);
    return window;
  },

  getMonitoringWindow(id: string): PostRefreshMonitoringWindow | undefined {
    return monitoringWindows.get(id);
  },

  listMonitoringWindows(): PostRefreshMonitoringWindow[] {
    return [...monitoringWindows.values()];
  },

  getMonitoringByContentItem(contentItemId: string): PostRefreshMonitoringWindow[] {
    return [...monitoringWindows.values()].filter((w) => w.contentItemId === contentItemId);
  },

  saveSourceRecord(record: ContentSourceRecord): ContentSourceRecord {
    sourceRecords.set(record.id, record);
    return record;
  },

  getSourceRecord(id: string): ContentSourceRecord | undefined {
    return sourceRecords.get(id);
  },

  listSourceRecords(): ContentSourceRecord[] {
    return [...sourceRecords.values()];
  },

  getSourcesByBrief(briefId: string): ContentSourceRecord[] {
    return [...sourceRecords.values()].filter((s) => s.updateBriefId === briefId);
  },

  setScheduledPublication(versionId: string, entry: ScheduledPublication): void {
    scheduledPublications.set(versionId, entry);
  },

  getScheduledPublication(versionId: string): ScheduledPublication | undefined {
    return scheduledPublications.get(versionId);
  },

  deleteScheduledPublication(versionId: string): void {
    scheduledPublications.delete(versionId);
  },

  appendMonitoringMetrics(snapshot: MonitoringMetricsSnapshot): void {
    const existing = monitoringMetrics.get(snapshot.windowId) ?? [];
    existing.push(snapshot);
    monitoringMetrics.set(snapshot.windowId, existing);
  },

  getMonitoringMetrics(windowId: string): MonitoringMetricsSnapshot[] {
    return monitoringMetrics.get(windowId) ?? [];
  },

  setRollbackReason(contentItemId: string, reason: string): void {
    rollbackReasons.set(contentItemId, reason);
  },

  getRollbackReason(contentItemId: string): string | undefined {
    return rollbackReasons.get(contentItemId);
  },

  logAudit,

  getAuditLog(limit = 100): RefreshAuditEntry[] {
    return auditLog.slice(0, limit);
  },

  getAuditLogByContentItem(contentItemId: string): RefreshAuditEntry[] {
    return auditLog.filter((e) => e.contentItemId === contentItemId);
  },

  clearAll(): void {
    candidates.clear();
    candidateMeta.clear();
    briefs.clear();
    versions.clear();
    reviews.clear();
    monitoringWindows.clear();
    sourceRecords.clear();
    scheduledPublications.clear();
    monitoringMetrics.clear();
    rollbackReasons.clear();
    auditLog.length = 0;
  },
};
