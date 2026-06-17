import type { CMSContentItem } from "@/types/content-cms";
import type {
  ContentStatus,
  WorkflowAction,
  WorkflowActionAvailability,
  WorkflowTransitionContext,
} from "@/types/content-workflow";
import {
  CONTENT_STATUS_TRANSITIONS,
  isStatusIndexable,
} from "@/data/content-statuses";
import { canPublishByRules } from "@/data/content-publishing-rules";
import { validateContentItem } from "@/lib/content-cms/content-validation";

const ACTION_TO_STATUS: Partial<Record<WorkflowAction, ContentStatus>> = {
  send_to_review: "review",
  request_source: "needs-source",
  request_fact_check: "needs-fact-check",
  request_expert_review: "needs-expert-review",
  approve: "approved",
  schedule: "scheduled",
  publish: "published",
  set_noindex: "noindex",
  archive: "archived",
  reject: "rejected",
};

export function canTransitionContentStatus(
  item: CMSContentItem,
  nextStatus: ContentStatus,
): { ok: boolean; reason?: string } {
  const allowed = CONTENT_STATUS_TRANSITIONS[item.status];
  if (!allowed?.includes(nextStatus)) {
    return { ok: false, reason: `Переход ${item.status} → ${nextStatus} запрещён` };
  }
  if (nextStatus === "published") {
    const pub = validateBeforePublishing(item);
    if (!pub.ok) return { ok: false, reason: pub.reasons.join("; ") };
  }
  if (nextStatus === "approved") {
    const app = validateBeforeApproval(item);
    if (!app.ok) return { ok: false, reason: app.reasons.join("; ") };
  }
  if (item.status === "ai-generated" && nextStatus === "published") {
    return { ok: false, reason: "AI-generated нельзя публиковать напрямую" };
  }
  return { ok: true };
}

export function validateBeforeApproval(item: CMSContentItem): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const validation = validateContentItem(item);

  if (item.quality.blockers.length > 0) {
    reasons.push(...item.quality.blockers.map((b) => `Blocker: ${b}`));
  }
  if (item.quality.level === "poor") reasons.push("Quality level: poor");
  if (!item.title?.trim()) reasons.push("Нет title");
  if (!item.slug?.trim()) reasons.push("Нет slug");
  if (validation.errors.length) reasons.push(...validation.errors);

  return { ok: reasons.length === 0, reasons };
}

export function validateBeforeScheduling(item: CMSContentItem): { ok: boolean; reasons: string[] } {
  const approval = validateBeforeApproval(item);
  if (item.status !== "approved" && item.status !== "scheduled") {
    return { ok: false, reasons: ["Материал должен быть approved"] };
  }
  return approval;
}

export function validateBeforePublishing(item: CMSContentItem): { ok: boolean; reasons: string[] } {
  const pub = canPublishByRules(item);
  if (!pub.ok) return pub;
  if (!item.indexing.canonicalUrl && item.seo.cannibalizationRisk === "high") {
    return { ok: false, reasons: ["Требуется canonical при high cannibalization risk"] };
  }
  return { ok: true, reasons: [] };
}

export function getAvailableWorkflowActions(item: CMSContentItem): WorkflowActionAvailability[] {
  const actions: WorkflowAction[] = [
    "send_to_review",
    "request_source",
    "request_fact_check",
    "request_expert_review",
    "approve",
    "schedule",
    "publish",
    "set_noindex",
    "archive",
    "reject",
  ];

  return actions.map((action) => {
    const nextStatus = ACTION_TO_STATUS[action];
    if (!nextStatus) return { action, available: false, reason: "Не реализовано" };

    const check = canTransitionContentStatus(item, nextStatus);
    if (!check.ok) return { action, available: false, reason: check.reason };

    if (action === "publish") {
      const pub = validateBeforePublishing(item);
      if (!pub.ok) return { action, available: false, reason: pub.reasons.join("; ") };
    }

    return { action, available: true };
  });
}

export async function transitionContentStatus(
  item: CMSContentItem,
  nextStatus: ContentStatus,
  context: WorkflowTransitionContext,
): Promise<CMSContentItem> {
  const check = canTransitionContentStatus(item, nextStatus);
  if (!check.ok) throw new Error(check.reason);

  const patch: Partial<CMSContentItem> = {
    status: nextStatus,
    workflow: {
      ...item.workflow,
      reviewNotes: context.reviewNotes ?? item.workflow.reviewNotes,
      rejectionReason: nextStatus === "rejected" ? context.reason : item.workflow.rejectionReason,
      scheduledAt: nextStatus === "scheduled" ? context.scheduledAt : item.workflow.scheduledAt,
      publishedAt: nextStatus === "published" ? new Date().toISOString() : item.workflow.publishedAt,
      reviewedBy: context.actorId,
    },
  };

  if (nextStatus === "published") {
    patch.indexing = {
      ...item.indexing,
      indexable: true,
      sitemap: true,
      robots: { index: true, follow: true },
      noindexReason: undefined,
    };
  }

  if (nextStatus === "noindex") {
    patch.indexing = {
      ...item.indexing,
      indexable: false,
      sitemap: false,
      robots: { index: false, follow: true },
      noindexReason: context.reason ?? "manual noindex",
    };
  }

  if (!isStatusIndexable(nextStatus) && nextStatus !== "noindex" && nextStatus !== "published") {
    patch.indexing = {
      ...item.indexing,
      indexable: false,
      sitemap: false,
      robots: { index: false, follow: true },
      noindexReason: `status: ${nextStatus}`,
    };
  }

  const { contentRepository } = await import("@/lib/content-cms/content-repository");
  const { logContentAudit } = await import("@/lib/content-cms/content-audit-log");
  const updated = await contentRepository.updateContent(item.id, patch);
  logContentAudit({
    contentId: item.id,
    action: "status_changed",
    fromStatus: item.status,
    toStatus: nextStatus,
    actorId: context.actorId,
    actorRole: context.actorRole,
    message: context.reason,
  });
  return updated;
}

export async function rejectContent(
  item: CMSContentItem,
  reason: string,
  context: WorkflowTransitionContext,
) {
  return transitionContentStatus(item, "rejected", { ...context, reason });
}

export async function archiveContent(item: CMSContentItem, context: WorkflowTransitionContext) {
  return transitionContentStatus(item, "archived", context);
}

export async function requestFactCheck(item: CMSContentItem, context: WorkflowTransitionContext) {
  return transitionContentStatus(item, "needs-fact-check", context);
}

export async function requestExpertReview(
  item: CMSContentItem,
  context: WorkflowTransitionContext,
) {
  return transitionContentStatus(item, "needs-expert-review", context);
}

export async function requestSource(item: CMSContentItem, context: WorkflowTransitionContext) {
  return transitionContentStatus(item, "needs-source", context);
}
