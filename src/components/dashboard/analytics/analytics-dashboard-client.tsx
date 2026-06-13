"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import type { AnalyticsReport, DateRangeKey } from "@/types/analytics";
import { parseDateRangeKey } from "@/lib/analytics/date-range";
import { formatPercent, formatMinutes, formatNumber } from "@/lib/analytics/report-formatters";
import { AnalyticsKpiCards } from "./analytics-kpi-cards";
import { AnalyticsFunnelTable } from "./analytics-funnel-table";
import { AnalyticsInsights } from "./analytics-insights";

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "funnel", label: "Воронка" },
  { id: "pages", label: "Страницы" },
  { id: "sources", label: "Источники" },
  { id: "tools", label: "Инструменты" },
  { id: "crm", label: "CRM" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AnalyticsDashboardInner({ initial }: { initial: AnalyticsReport }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as TabId) ?? "overview";
  const range = parseDateRangeKey(searchParams.get("range"));

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`/dashboard/analytics?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="heading-section text-3xl">Аналитика сайта и заявок</h1>
          <p className="mt-2 text-sm text-muted">
            Период: {initial.range.label}. Управленческая картина по лидам, событиям и воронке.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/dashboard/analytics-export?range=${range}`}
            className="rounded-sm border border-graphite/15 px-3 py-1.5 text-sm transition hover:bg-sand"
          >
            Экспорт CSV
          </a>
          {(["7d", "30d", "90d", "all"] as DateRangeKey[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setParam("range", r)}
              className={`rounded-sm border px-3 py-1.5 text-sm ${range === r ? "border-wood bg-sand" : "border-graphite/15"}`}
            >
              {r === "7d" ? "7 дней" : r === "30d" ? "30 дней" : r === "90d" ? "90 дней" : "Всё"}
            </button>
          ))}
        </div>
      </div>

      {(initial.meta.isDemo || !initial.meta.storageEnabled) && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {initial.meta.isDemo ? (
            <p>
              <strong>Demo analytics</strong> — показаны демо-события для разработки. Не путать с production-данными.
            </p>
          ) : null}
          {!initial.meta.storageEnabled ? (
            <p className="mt-1">Хранилище событий не подключено. Подключите file store или Supabase.</p>
          ) : null}
          {!initial.meta.externalAnalytics.yandex && !initial.meta.externalAnalytics.ga ? (
            <p className="mt-1">
              Внешняя аналитика (Яндекс.Метрика / GA) не настроена — NEXT_PUBLIC_YM_ID / NEXT_PUBLIC_GA_ID.
            </p>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-graphite/10 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setParam("tab", t.id)}
            className={`rounded-sm px-3 py-1.5 text-sm ${tab === t.id ? "bg-sand font-medium" : "text-muted hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <AnalyticsKpiCards kpis={initial.kpis} />
          <AnalyticsInsights insights={initial.insights} />
          <AnalyticsFunnelTable funnel={initial.funnels[0]} />
        </>
      )}

      {tab === "funnel" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {initial.funnels.map((f) => (
            <AnalyticsFunnelTable key={f.id} funnel={f} />
          ))}
        </div>
      )}

      {tab === "pages" && (
        <DataTable
          headers={["Страница", "Тип", "Просмотры", "CTA", "Лиды", "Conv.", "Score", "Hot"]}
          rows={initial.pages.slice(0, 30).map((p) => [
            p.path,
            p.pageType,
            String(p.views),
            String(p.ctaClicks),
            String(p.leads),
            formatPercent(p.conversionRate),
            p.leads > 0 ? String(Math.round(p.leadQualityAvg)) : "—",
            String(p.hotLeads),
          ])}
          empty="Нет данных по страницам. Отправьте заявки или дождитесь page_viewed событий."
        />
      )}

      {tab === "sources" && (
        <DataTable
          headers={["Source", "Medium", "Campaign", "Лиды", "Hot", "Score", "Sessions"]}
          rows={initial.sources.map((s) => [
            s.source,
            s.medium ?? "—",
            s.campaign ?? "—",
            String(s.leads),
            String(s.hotLeads),
            String(s.averageLeadScore),
            s.sessions != null ? String(s.sessions) : "—",
          ])}
          empty="Нет UTM/источников. Размечайте ссылки utm_source / utm_medium."
        />
      )}

      {tab === "tools" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ToolCard title="Калькулятор" items={[
            ["Старт", initial.tools.calculator.started],
            ["Результат", initial.tools.calculator.resultViewed],
            ["Заявки", initial.tools.calculator.leadSubmitted],
            ["Конверсия", formatPercent(initial.tools.calculator.conversionToLead)],
            ["Ср. площадь", initial.tools.calculator.avgArea ?? "—"],
            ["Материал", initial.tools.calculator.topMaterial ?? "—"],
          ]} />
          <ToolCard title="Планировщик" items={[
            ["Старт", initial.tools.planner.started],
            ["Рекомендации", initial.tools.planner.recommendationsViewed],
            ["Заявки", initial.tools.planner.leadSubmitted],
            ["Конверсия", formatPercent(initial.tools.planner.conversionToLead)],
            ["Ср. площадь", initial.tools.planner.avgArea ?? "—"],
            ["Сценарий", initial.tools.planner.topScenario ?? "—"],
          ]} />
          <ToolCard title="Лид-магниты" items={[
            ["Просмотры", initial.tools.leadMagnets.viewed],
            ["Клики", initial.tools.leadMagnets.clicked],
            ["Отправки", initial.tools.leadMagnets.submitted],
            ["Конверсия", formatPercent(initial.tools.leadMagnets.conversion)],
            ["Ср. score", initial.tools.leadMagnets.avgLeadScore],
          ]} />
          <ToolCard title="Каталог" items={[
            ["Просмотры", initial.tools.catalog.views],
            ["Клики по проектам", initial.tools.catalog.projectClicks],
            ["Лиды", initial.tools.catalog.leads],
          ]} />
        </div>
      )}

      {tab === "crm" && (
        <>
          <AnalyticsKpiCards kpis={initial.kpis} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Всего лидов" value={initial.crm.total} />
            <Metric label="Просрочено" value={initial.crm.overdue} />
            <Metric label="Ср. реакция" value={formatMinutes(initial.crm.avgResponseMinutes)} />
            <Metric label="SLA hit rate" value={formatPercent(initial.crm.slaHitRate)} />
            <Metric label="Hot" value={initial.crm.hot} />
            <Metric label="Warm" value={initial.crm.warm} />
            <Metric label="Won" value={initial.crm.won} />
            <Metric label="Lost" value={initial.crm.lost} />
          </div>
          <DataTable
            headers={["Статус", "Количество"]}
            rows={Object.entries(initial.crm.byStatus).map(([k, v]) => [k, String(v)])}
            empty="Нет CRM-данных за период."
          />
        </>
      )}

      <p className="text-xs text-muted">
        Событий: {formatNumber(initial.meta.eventCount)} · Лидов за период: {formatNumber(initial.meta.leadCount)}
      </p>
    </div>
  );
}

function DataTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (!rows.length) {
    return <p className="rounded-sm border border-dashed p-8 text-center text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-sm border border-graphite/10 bg-background">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-sand/40 text-left text-xs uppercase text-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-graphite/5">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 max-w-xs truncate">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ToolCard({ title, items }: { title: string; items: [string, string | number][] }) {
  return (
    <div className="rounded-sm border border-graphite/10 bg-background p-5">
      <h3 className="font-display text-lg">{title}</h3>
      <dl className="mt-3 space-y-2 text-sm">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-graphite/10 bg-background p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </div>
  );
}

export function AnalyticsDashboardClient({ initial }: { initial: AnalyticsReport }) {
  return (
    <Suspense fallback={<p className="text-muted">Загрузка…</p>}>
      <AnalyticsDashboardInner initial={initial} />
    </Suspense>
  );
}
