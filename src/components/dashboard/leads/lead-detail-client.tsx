"use client";

import { useState } from "react";
import Link from "next/link";
import type { LeadNextAction, LeadStatus, StoredLead } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatLeadForManager,
  generateLeadSummary,
  getPublicLinkForLead,
} from "@/lib/leads/lead-formatters";
import {
  LEAD_STATUS_META,
  LEAD_STATUS_ORDER,
  LOST_REASON_LABELS,
  NEXT_ACTION_LABELS,
} from "@/lib/leads/lead-status";
import { LeadAutomationPanel } from "./lead-automation-panel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DemoBadge, LeadReadinessBadge, LeadStatusBadge, LeadPriorityBadge, OverdueBadge } from "./lead-badges";
import { LeadContextSections } from "./lead-context-cards";
import { isLeadOverdue } from "@/lib/leads/lead-sla";

async function patchLead(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("update_failed");
  return res.json() as Promise<{ lead: StoredLead }>;
}

async function postComment(id: string, text: string) {
  const res = await fetch(`/api/leads/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("comment_failed");
  return res.json() as Promise<{ lead: StoredLead }>;
}

export function LeadDetailClient({ initial }: { initial: StoredLead }) {
  const [lead, setLead] = useState(initial);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nextAction, setNextAction] = useState<LeadNextAction>(
    lead.nextAction ?? { type: "call" },
  );

  const publicLink = getPublicLinkForLead(lead);

  const handleStatus = async (status: LeadStatus) => {
    setLoading(true);
    try {
      const lostReason = status === "lost" ? "other" : undefined;
      const { lead: updated } = await patchLead(lead.id, { status, lostReason });
      setLead(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const { lead: updated } = await postComment(lead.id, comment);
      setLead(updated);
      setComment("");
    } finally {
      setLoading(false);
    }
  };

  const handleNextAction = async () => {
    setLoading(true);
    try {
      const { lead: updated } = await patchLead(lead.id, { nextAction });
      setLead(updated);
    } finally {
      setLoading(false);
    }
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(formatLeadForManager(lead));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/dashboard/leads" className="text-sm text-muted hover:text-foreground">
            ← Все лиды
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="heading-section text-3xl">{lead.contact.name}</h1>
            {lead.isDemo ? <DemoBadge /> : null}
          </div>
          <p className="mt-1 text-lg">{lead.contact.phone}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <LeadStatusBadge status={lead.status} />
            <LeadReadinessBadge readiness={lead.qualification.readiness} />
            {lead.automation?.priority ? <LeadPriorityBadge priority={lead.automation.priority} /> : null}
            {isLeadOverdue(lead) ? <OverdueBadge /> : null}
            <span className="rounded-full bg-sand px-2 py-0.5 text-xs">
              Score: {lead.qualification.leadScore ?? 0}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Создан: {new Date(lead.meta.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={`tel:${lead.contact.phone}`}>Позвонить</a>
          </Button>
          {lead.contact.messenger ? (
            <Button variant="outline" disabled>
              {lead.contact.messenger}
            </Button>
          ) : null}
          <Button variant="outline" onClick={copySummary}>
            {copied ? "Скопировано" : "Скопировать резюме"}
          </Button>
          {publicLink ? (
            <Button asChild variant="outline">
              <Link href={publicLink.href} target="_blank">
                {publicLink.label}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <section className="rounded-sm border border-wood/30 bg-wood/5 p-5">
        <h2 className="font-display text-xl">Быстрое резюме</h2>
        <p className="mt-2 text-muted leading-relaxed">{generateLeadSummary(lead)}</p>
      </section>

      <LeadAutomationPanel lead={lead} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Запрос</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-muted">Тип</dt><dd>{lead.request.type}</dd></div>
            <div><dt className="text-muted">Заголовок</dt><dd>{lead.request.title}</dd></div>
            {lead.request.selectedCTA ? (
              <div><dt className="text-muted">CTA</dt><dd>{lead.request.selectedCTA}</dd></div>
            ) : null}
            {lead.request.comment ? (
              <div><dt className="text-muted">Комментарий</dt><dd className="whitespace-pre-wrap">{lead.request.comment}</dd></div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Квалификация</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {lead.qualification.desiredArea ? <div><dt className="text-muted">Площадь</dt><dd>{lead.qualification.desiredArea} м²</dd></div> : null}
            {lead.qualification.desiredMaterial ? <div><dt className="text-muted">Материал</dt><dd>{lead.qualification.desiredMaterial}</dd></div> : null}
            {lead.qualification.budget?.raw ? <div><dt className="text-muted">Бюджет</dt><dd>{lead.qualification.budget.raw}</dd></div> : null}
            {lead.qualification.landLocation ? <div><dt className="text-muted">Участок</dt><dd>{lead.qualification.landLocation}</dd></div> : null}
            {lead.qualification.hasLand ? <div><dt className="text-muted">Есть участок</dt><dd>{lead.qualification.hasLand}</dd></div> : null}
          </dl>
        </section>
      </div>

      <LeadContextSections lead={lead} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Статус</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEAD_STATUS_ORDER.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={lead.status === s ? "default" : "outline"}
                disabled={loading}
                onClick={() => handleStatus(s)}
              >
                {LEAD_STATUS_META[s].label}
              </Button>
            ))}
          </div>
          {lead.status === "lost" && lead.lostReason ? (
            <p className="mt-2 text-sm text-muted">Причина: {LOST_REASON_LABELS[lead.lostReason] ?? lead.lostReason}</p>
          ) : null}
        </section>

        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Следующий шаг</h2>
          <div className="mt-3 space-y-3">
            <div>
              <Label htmlFor="next-type">Тип</Label>
              <select
                id="next-type"
                className="mt-1 w-full rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
                value={nextAction.type}
                onChange={(e) => setNextAction({ ...nextAction, type: e.target.value as LeadNextAction["type"] })}
              >
                {Object.entries(NEXT_ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="next-at">Дата</Label>
              <Input
                id="next-at"
                type="datetime-local"
                className="mt-1"
                value={nextAction.at ? nextAction.at.slice(0, 16) : ""}
                onChange={(e) => setNextAction({ ...nextAction, at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
            <div>
              <Label htmlFor="next-comment">Комментарий</Label>
              <textarea
                id="next-comment"
                className="mt-1 flex min-h-[80px] w-full rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
                value={nextAction.comment ?? ""}
                onChange={(e) => setNextAction({ ...nextAction, comment: e.target.value })}
              />
            </div>
            <Button onClick={handleNextAction} disabled={loading}>Сохранить шаг</Button>
          </div>
        </section>
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Комментарии менеджера</h2>
        <div className="mt-4 space-y-3">
          {(lead.comments ?? []).length ? (
            lead.comments!.map((c) => (
              <div key={c.id} className="rounded-sm bg-sand/40 p-3 text-sm">
                <p>{c.text}</p>
                <p className="mt-2 text-xs text-muted">
                  {c.authorName ?? "Менеджер"} · {new Date(c.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">Комментариев пока нет.</p>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Добавить комментарий..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button onClick={handleComment} disabled={loading || !comment.trim()}>
            Добавить
          </Button>
        </div>
        {lead.isDemo ? (
          <p className="mt-2 text-xs text-amber-800">Demo-лид: комментарии не сохраняются между перезагрузками.</p>
        ) : null}
      </section>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">История</h2>
        <ul className="mt-4 space-y-3">
          {(lead.timeline ?? []).map((ev) => (
            <li key={ev.id} className="border-l-2 border-graphite/15 pl-4">
              <p className="font-medium text-sm">{ev.title}</p>
              {ev.description ? <p className="text-sm text-muted">{ev.description}</p> : null}
              <p className="text-xs text-muted">{new Date(ev.createdAt).toLocaleString("ru-RU")}</p>
            </li>
          ))}
        </ul>
      </section>

      <Accordion type="single" collapsible>
        <AccordionItem value="raw">
          <AccordionTrigger>Технические данные</AccordionTrigger>
          <AccordionContent>
            <pre className="overflow-x-auto rounded-sm bg-sand/30 p-4 text-xs">
              {JSON.stringify(lead, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
