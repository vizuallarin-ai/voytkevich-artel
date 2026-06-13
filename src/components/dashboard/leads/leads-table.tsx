"use client";

import Link from "next/link";
import type { StoredLead } from "@/types/lead";
import { formatSourceType, generateLeadSummary, getLeadInterestLabel, getLeadShortSummary } from "@/lib/leads/lead-formatters";
import { DemoBadge, LeadPriorityBadge, LeadReadinessBadge, LeadStatusBadge, OverdueBadge, SourceTypeBadge } from "./lead-badges";
import { NEXT_ACTION_LABELS } from "@/lib/leads/lead-status";
import { isLeadOverdue } from "@/lib/leads/lead-sla";

export function LeadsTable({ leads }: { leads: StoredLead[] }) {
  if (!leads.length) {
    return (
      <div className="rounded-sm border border-dashed border-graphite/20 bg-background p-10 text-center">
        <p className="font-display text-xl">Заявок пока нет</p>
        <p className="mt-2 text-sm text-muted">
          Отправьте тестовую форму на сайте или проверьте подключение хранилища (.data/leads.json / Supabase).
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-wood hover:underline">
          Перейти на сайт →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-sm border border-graphite/10 bg-background md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b border-graphite/10 bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Контакт</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Источник</th>
              <th className="px-4 py-3">Интерес</th>
              <th className="px-4 py-3">Приоритет</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">След. шаг</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-graphite/5 hover:bg-sand/20">
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {new Date(lead.meta.createdAt).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{lead.contact.name}</div>
                  <div className="text-muted">{lead.contact.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <LeadStatusBadge status={lead.status} />
                    <LeadReadinessBadge readiness={lead.qualification.readiness} />
                    {lead.automation?.priority ? (
                      <LeadPriorityBadge priority={lead.automation.priority} />
                    ) : null}
                    {isLeadOverdue(lead) ? <OverdueBadge /> : null}
                    {lead.isDemo ? <DemoBadge /> : null}
                  </div>
                </td>
                <td className="px-4 py-3">{lead.qualification.leadScore ?? 0}</td>
                <td className="px-4 py-3">
                  <SourceTypeBadge label={formatSourceType(lead.source.sourceType)} />
                </td>
                <td className="px-4 py-3 max-w-xs truncate" title={getLeadInterestLabel(lead)}>
                  {getLeadShortSummary(lead)}
                </td>
                <td className="px-4 py-3">
                  {lead.automation?.priority ? (
                    <LeadPriorityBadge priority={lead.automation.priority} />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                  {lead.automation?.sla?.responseDeadlineAt
                    ? new Date(lead.automation.sla.responseDeadlineAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3 text-muted">
                  {lead.nextAction?.title ??
                    (lead.nextAction?.at
                      ? new Date(lead.nextAction.at).toLocaleDateString("ru-RU")
                      : lead.nextAction?.type
                        ? NEXT_ACTION_LABELS[lead.nextAction.type]
                        : "—")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/leads/${lead.id}`} className="text-wood hover:underline">
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/dashboard/leads/${lead.id}`}
            className="block rounded-sm border border-graphite/10 bg-background p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{lead.contact.name}</p>
                <p className="text-sm text-muted">{lead.contact.phone}</p>
              </div>
              <LeadReadinessBadge readiness={lead.qualification.readiness} />
            </div>
            <p className="mt-3 text-sm text-muted line-clamp-2">{generateLeadSummary(lead)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <LeadStatusBadge status={lead.status} />
              <SourceTypeBadge label={formatSourceType(lead.source.sourceType)} />
              {lead.isDemo ? <DemoBadge /> : null}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
