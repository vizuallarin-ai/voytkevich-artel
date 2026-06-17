import type { CMSContentItem } from "@/types/content-cms";
import type { WorkflowAction, WorkflowTransitionContext } from "@/types/content-workflow";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { transitionContentStatus } from "@/lib/content-cms/content-workflow";
import { logContentAudit } from "@/lib/content-cms/content-audit-log";

const ACTION_STATUS: Partial<Record<WorkflowAction, CMSContentItem["status"]>> = {
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

export async function executeBulkAction(
  ids: string[],
  action: WorkflowAction,
  context: WorkflowTransitionContext,
): Promise<{ succeeded: string[]; failed: { id: string; reason: string }[] }> {
  if (action === "publish") {
    return {
      succeeded: [],
      failed: ids.map((id) => ({
        id,
        reason: "Массовая публикация запрещена",
      })),
    };
  }

  const succeeded: string[] = [];
  const failed: { id: string; reason: string }[] = [];
  const nextStatus = ACTION_STATUS[action];
  if (!nextStatus) {
    return { succeeded: [], failed: ids.map((id) => ({ id, reason: "Unknown action" })) };
  }

  for (const id of ids) {
    try {
      const item = await contentRepository.getContentById(id);
      if (!item) {
        failed.push({ id, reason: "Not found" });
        continue;
      }
      await transitionContentStatus(item, nextStatus, context);
      succeeded.push(id);
    } catch (e) {
      failed.push({ id, reason: e instanceof Error ? e.message : "Error" });
    }
  }

  logContentAudit({
    contentId: ids.join(","),
    action: "bulk_action",
    message: `${action}: ${succeeded.length} ok, ${failed.length} failed`,
    actorId: context.actorId,
  });

  return { succeeded, failed };
}

export function exportContentToCsv(items: CMSContentItem[]): string {
  const headers = ["id", "kind", "title", "slug", "status", "quality", "priority", "indexable"];
  const rows = items.map((i) =>
    [
      i.id,
      i.kind,
      `"${i.title.replace(/"/g, '""')}"`,
      i.slug,
      i.status,
      i.quality.level,
      i.seo.priority ?? "",
      i.indexing.indexable ? "yes" : "no",
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
