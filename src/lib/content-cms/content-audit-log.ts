import type { ContentStatus } from "@/types/content-workflow";

export type ContentAuditLogEntry = {
  id: string;
  contentId: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  fromStatus?: ContentStatus;
  toStatus?: ContentStatus;
  message?: string;
  createdAt: string;
};

const auditLog: ContentAuditLogEntry[] = [];

export function logContentAudit(
  entry: Omit<ContentAuditLogEntry, "id" | "createdAt">,
): ContentAuditLogEntry {
  const full: ContentAuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  auditLog.unshift(full);
  if (auditLog.length > 500) auditLog.pop();
  return full;
}

export function getContentAuditLog(contentId: string): ContentAuditLogEntry[] {
  return auditLog.filter((e) => e.contentId === contentId);
}

export function getRecentAuditLog(limit = 50): ContentAuditLogEntry[] {
  return auditLog.slice(0, limit);
}
