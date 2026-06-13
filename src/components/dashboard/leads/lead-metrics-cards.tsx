"use client";

import Link from "next/link";
import type { LeadMetrics } from "@/lib/leads/lead-metrics";

export function LeadMetricsCards({ metrics }: { metrics: LeadMetrics }) {
  const items = [
    { label: "Всего лидов", value: metrics.total },
    { label: "Новые", value: metrics.newCount },
    { label: "Горячие", value: metrics.hotCount },
    { label: "Срочные", value: metrics.urgentCount },
    { label: "Просроченные", value: metrics.overdueCount },
    { label: "За 7 дней", value: metrics.last7DaysCount },
    { label: "За 30 дней", value: metrics.last30DaysCount },
    { label: "Без шага", value: metrics.noNextActionCount },
    { label: "Средний score", value: metrics.averageLeadScore },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-sm border border-graphite/10 bg-background p-4">
          <p className="text-xs text-muted">{item.label}</p>
          <p className="mt-1 font-display text-2xl">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function SourceBreakdown({ metrics }: { metrics: LeadMetrics }) {
  const entries = Object.entries(metrics.bySourceType).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;

  return (
    <section className="rounded-sm border border-graphite/10 bg-background p-5">
      <h2 className="font-display text-lg">Источники заявок</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {entries.map(([key, count]) => (
          <li key={key} className="flex justify-between gap-4">
            <span className="text-muted">{key}</span>
            <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function QuickLinks() {
  const links = [
    { href: "/dashboard/leads?group=new", label: "Новые лиды" },
    { href: "/dashboard/leads?group=hot", label: "Горячие" },
    { href: "/dashboard/leads?group=overdue", label: "Просроченные" },
    { href: "/dashboard/leads?group=urgent", label: "Срочные" },
    { href: "/dashboard/leads?group=estimate", label: "Нужна смета" },
    { href: "/dashboard/leads", label: "Все лиды" },
  ];

  return (
    <section className="rounded-sm border border-graphite/10 bg-background p-5">
      <h2 className="font-display text-lg">Быстрые действия</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-sm border border-graphite/15 px-3 py-2 text-sm hover:bg-sand"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
