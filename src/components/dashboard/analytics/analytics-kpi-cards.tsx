"use client";

import type { AnalyticsKPIs } from "@/types/analytics";
import { formatPercent, formatNumber } from "@/lib/analytics/report-formatters";

function Trend({ value }: { value?: number | null }) {
  if (value == null) return null;
  const positive = value >= 0;
  return (
    <span className={positive ? "text-emerald-700" : "text-red-700"}>
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

export function AnalyticsKpiCards({ kpis }: { kpis: AnalyticsKPIs }) {
  const items = [
    { label: "Лиды", value: formatNumber(kpis.leads), trend: kpis.trends?.leads },
    { label: "Горячие", value: formatNumber(kpis.hotLeads), trend: kpis.trends?.hotLeads },
    { label: "Средний score", value: kpis.avgLeadScore, trend: kpis.trends?.avgLeadScore },
    { label: "Просмотры", value: formatNumber(kpis.pageViews) },
    { label: "Клики CTA", value: formatNumber(kpis.ctaClicks) },
    { label: "Конверсия форм", value: formatPercent(kpis.formSubmitRate) },
    { label: "Просрочено SLA", value: formatNumber(kpis.overdueSLA) },
    { label: "Топ источник", value: kpis.topSource ?? "—", small: true },
    { label: "Топ страница", value: kpis.topPage ?? "—", small: true },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-sm border border-graphite/10 bg-background p-4">
          <p className="text-xs text-muted">{item.label}</p>
          <p className={`mt-1 font-display ${item.small ? "text-base break-all" : "text-2xl"}`}>{item.value}</p>
          {item.trend != null ? (
            <p className="mt-1 text-xs">
              vs пред. период: <Trend value={item.trend} />
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
