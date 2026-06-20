import type { IndexabilityDecision } from "@/types/seo-indexation";

export type IndexationAuditEntry = {
  id: string;
  pageId?: string;
  url?: string;
  action:
    | "indexability-evaluated"
    | "indexability-recalculated"
    | "sitemap-included"
    | "sitemap-excluded"
    | "canonical-conflict"
    | "cannibalization-block"
    | "metadata-fixed"
    | "redirect-created"
    | "lifecycle-updated";
  at: string;
  decision?: IndexabilityDecision;
  details?: string;
};

const auditLog: IndexationAuditEntry[] = [];

export const indexationAuditLog = {
  append(entry: Omit<IndexationAuditEntry, "id" | "at">): void {
    auditLog.unshift({
      ...entry,
      id: `idx-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
    });
  },

  list(): IndexationAuditEntry[] {
    return auditLog;
  },

  forPage(pageId: string): IndexationAuditEntry[] {
    return auditLog.filter((e) => e.pageId === pageId);
  },

  forUrl(url: string): IndexationAuditEntry[] {
    return auditLog.filter((e) => e.url === url);
  },

  logIndexabilityEvaluated(pageId: string, url: string, decision: IndexabilityDecision): void {
    this.append({
      pageId,
      url,
      action: "indexability-evaluated",
      decision,
      details: decision.message,
    });
  },

  logSitemapExcluded(pageId: string, url: string, reason: string): void {
    this.append({
      pageId,
      url,
      action: "sitemap-excluded",
      details: reason,
    });
  },
};
