"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ContentCalendarItem } from "@/types/content-calendar";

export default function CalendarMonthPage() {
  const now = new Date();
  const [scheduled, setScheduled] = useState<ContentCalendarItem[]>([]);

  useEffect(() => {
    fetch(
      `/api/dashboard/content-calendar/month?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
    )
      .then((r) => r.json())
      .then((d) => setScheduled(d.scheduled ?? []));
  }, [now]);

  const byDay = new Map<string, number>();
  for (const item of scheduled) {
    const day = item.scheduledAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells: Array<{ date: string; count: number } | null> = [];

  for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d).toISOString().slice(0, 10);
    cells.push({ date, count: byDay.get(date) ?? 0 });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/calendar" className="text-sm text-muted underline">
          ← Календарь
        </Link>
        <h1 className="mt-3 heading-section text-3xl">
          Месяц — {now.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
        </h1>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, i) =>
          cell ? (
            <div
              key={cell.date}
              className={`min-h-[72px] rounded-sm border p-2 text-xs ${
                cell.count ? "border-primary/30 bg-primary/5" : "border-graphite/10"
              }`}
            >
              <p className="font-medium">{new Date(cell.date).getDate()}</p>
              {cell.count > 0 && <p className="text-muted mt-1">{cell.count} scheduled</p>}
            </div>
          ) : (
            <div key={`empty-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
