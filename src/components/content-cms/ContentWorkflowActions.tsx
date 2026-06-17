import type { CMSContentItem } from "@/types/content-cms";
import type { WorkflowActionAvailability } from "@/types/content-workflow";

const ACTION_LABELS: Record<string, string> = {
  send_to_review: "На review",
  request_source: "Запросить источник",
  request_fact_check: "Fact-check",
  request_expert_review: "Экспертиза",
  approve: "Одобрить",
  schedule: "Запланировать",
  publish: "Опубликовать",
  set_noindex: "Noindex",
  archive: "В архив",
  reject: "Отклонить",
};

export function ContentWorkflowActions({
  actions,
}: {
  actions: WorkflowActionAvailability[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ action, available, reason }) => (
        <button
          key={action}
          type="button"
          disabled={!available}
          title={reason}
          className="rounded-sm border border-graphite/15 px-3 py-1.5 text-xs transition enabled:hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
        >
          {ACTION_LABELS[action] ?? action}
        </button>
      ))}
    </div>
  );
}

export function ContentWarningsPanel({ item }: { item: CMSContentItem }) {
  if (!item.quality.blockers.length && !item.quality.warnings.length) {
    return (
      <p className="text-sm text-muted">Нет warnings и blockers.</p>
    );
  }

  return (
    <div className="space-y-4">
      {item.quality.blockers.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-red-800">Blockers</p>
          <ul className="mt-2 space-y-1 text-sm text-red-900">
            {item.quality.blockers.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {item.quality.warnings.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-amber-800">Warnings</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {item.quality.warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
