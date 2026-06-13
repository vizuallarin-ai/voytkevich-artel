import type { StoredLead } from "@/types/lead";
import { formatSLAStatus } from "@/lib/leads/lead-sla";
import { getNotificationStatusSummary } from "@/lib/leads/lead-notification-status";
import { NEXT_ACTION_LABELS } from "@/lib/leads/lead-status";
import {
  LeadPriorityBadge,
  NotificationStatusBadge,
  OverdueBadge,
} from "./lead-badges";

export function LeadAutomationPanel({ lead }: { lead: StoredLead }) {
  const automation = lead.automation;
  const notificationStatus = getNotificationStatusSummary(automation?.notifications);
  const isOverdue = automation?.sla?.isOverdue;

  if (!automation && !lead.nextAction) {
    return (
      <section className="rounded-sm border border-dashed border-graphite/20 bg-background p-5">
        <h2 className="font-display text-lg">Автоматизация</h2>
        <p className="mt-2 text-sm text-muted">
          Автоматизация не запускалась для этого лида. Новые заявки обрабатываются автоматически.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-sm border border-graphite/10 bg-background p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-lg">Автоматизация</h2>
        {automation?.priority ? <LeadPriorityBadge priority={automation.priority} /> : null}
        {isOverdue ? <OverdueBadge /> : null}
        <NotificationStatusBadge status={notificationStatus} />
      </div>

      {automation?.sla ? (
        <div className="mt-4 rounded-sm bg-sand/30 px-4 py-3 text-sm">
          <p className="font-medium">SLA</p>
          <p className="mt-1 text-muted">{formatSLAStatus(lead)}</p>
        </div>
      ) : null}

      {lead.nextAction?.title || lead.nextAction?.type ? (
        <div className="mt-4">
          <p className="text-sm font-medium">Рекомендованный шаг</p>
          <p className="mt-1">{lead.nextAction.title ?? NEXT_ACTION_LABELS[lead.nextAction.type]}</p>
          {lead.nextAction.description ? (
            <p className="mt-1 text-sm text-muted">{lead.nextAction.description}</p>
          ) : null}
          {lead.nextAction.dueAt || lead.nextAction.at ? (
            <p className="mt-1 text-xs text-muted">
              До:{" "}
              {new Date(lead.nextAction.dueAt ?? lead.nextAction.at!).toLocaleString("ru-RU")}
            </p>
          ) : null}
        </div>
      ) : null}

      {automation?.notifications?.length ? (
        <div className="mt-4">
          <p className="text-sm font-medium">Уведомления</p>
          <ul className="mt-2 space-y-1 text-sm">
            {automation.notifications.map((n, i) => (
              <li key={`${n.channel}-${i}`} className="flex items-center gap-2 text-muted">
                <span className={n.success ? "text-emerald-700" : "text-red-700"}>
                  {n.success ? "✓" : "✗"}
                </span>
                <span>{n.channel}</span>
                {n.error ? <span className="text-xs text-red-600">({n.error})</span> : null}
              </li>
            ))}
          </ul>
          {notificationStatus === "failed" ? (
            <p className="mt-2 text-sm text-amber-800">
              Уведомление не отправлено. Проверьте env-настройки Telegram / email / webhook.
            </p>
          ) : null}
        </div>
      ) : null}

      {automation?.lastAutomationAt ? (
        <p className="mt-4 text-xs text-muted">
          Автоматизация: {new Date(automation.lastAutomationAt).toLocaleString("ru-RU")}
        </p>
      ) : null}
    </section>
  );
}
