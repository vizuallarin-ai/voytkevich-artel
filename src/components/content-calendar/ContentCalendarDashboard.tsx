"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ContentCalendarItem } from "@/types/content-calendar";
import type { PublicationSlot } from "@/types/content-calendar";
import type { CalendarSettings } from "@/types/content-calendar";
import type { ContentCalendarMetrics } from "@/types/content-calendar";
import type { ContentCapacityRules } from "@/types/content-scheduling";
import type { QueueRow } from "./ContentScheduleQueue";
import { ContentCalendarGrid } from "./ContentCalendarGrid";
import { ContentCapacityPanel } from "./ContentCapacityPanel";
import { ContentBalancePanel } from "./ContentBalancePanel";
import { ContentScheduleQueue } from "./ContentScheduleQueue";
import { trackContentCalendarViewed } from "@/lib/content-calendar/calendar-analytics";

type DashboardData = {
  settings: CalendarSettings;
  metrics: ContentCalendarMetrics;
  scheduled: ContentCalendarItem[];
  slots: PublicationSlot[];
  unscheduled: QueueRow[];
  capacity: ContentCapacityRules;
};

export function ContentCalendarDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const load = useCallback(() => {
    fetch(`/api/dashboard/content-calendar?date=${date}`)
      .then((r) => r.json())
      .then(setData);
  }, [date]);

  useEffect(() => {
    trackContentCalendarViewed({ page: "calendar", date });
    load();
  }, [date, load]);

  if (!data) return <p className="text-sm text-muted">Загрузка календаря...</p>;

  const allWarnings = data.scheduled.flatMap((i) => i.warnings);
  const allBlockers = data.scheduled.flatMap((i) => i.blockers);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Scheduled", value: data.metrics.totalScheduled },
          { label: "Published", value: data.metrics.totalPublished },
          { label: "Unscheduled approved", value: data.metrics.unscheduledApproved },
          { label: "Site today", value: data.metrics.todaySiteCount },
          { label: "External today", value: data.metrics.todayExternalCount },
        ].map((k) => (
          <div key={k.label} className="rounded-sm border border-graphite/10 bg-background p-4">
            <p className="text-xs text-muted">{k.label}</p>
            <p className="mt-1 font-display text-2xl">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center text-sm">
        <Link href="/dashboard/content/calendar/week" className="text-primary underline">
          Неделя →
        </Link>
        <Link href="/dashboard/content/calendar/month" className="text-primary underline">
          Месяц →
        </Link>
        <Link href="/dashboard/content/calendar/queue" className="text-primary underline">
          Очередь →
        </Link>
        <Link href="/dashboard/content/calendar/settings" className="text-primary underline">
          Настройки →
        </Link>
        <label className="ml-auto flex items-center gap-2 text-xs">
          Дата
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-sm border border-graphite/20 px-2 py-1"
          />
        </label>
        <span className="text-xs text-muted">
          Mode: <strong>{data.settings.mode}</strong> · {data.settings.timezone}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContentCalendarGrid date={date} scheduled={data.scheduled} slots={data.slots} />
        </div>
        <div className="space-y-4">
          <ContentCapacityPanel capacity={data.capacity} metrics={data.metrics} />
          <ContentBalancePanel />
          {(allWarnings.length > 0 || allBlockers.length > 0) && (
            <div className="rounded-sm border border-graphite/10 p-4">
              <h3 className="font-medium text-sm mb-2">Day warnings</h3>
              {allBlockers.map((b) => (
                <p key={b} className="text-xs text-destructive">
                  {b}
                </p>
              ))}
              {allWarnings.map((w) => (
                <p key={w} className="text-xs text-muted">
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Unscheduled approved (top)</h2>
        <ContentScheduleQueue queue={data.unscheduled} onRefresh={load} />
      </section>

      <p className="text-xs text-muted max-w-3xl">
        Публикация разрешена только при CMS + SEO + visual + distribution readiness. Scheduled ≠
        published. Teaser — после full article на stroistroy.ru.
      </p>
    </div>
  );
}
