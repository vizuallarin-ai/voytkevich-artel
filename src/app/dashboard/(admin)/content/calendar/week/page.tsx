"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ContentCalendarItem } from "@/types/content-calendar";
import { ContentCalendarItemCard } from "@/components/content-calendar/ContentCalendarItemCard";

export default function CalendarWeekPage() {
  const [scheduled, setScheduled] = useState<ContentCalendarItem[]>([]);
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1);
  const startStr = start.toISOString().slice(0, 10);

  useEffect(() => {
    fetch(`/api/dashboard/content-calendar/week?start=${startStr}`)
      .then((r) => r.json())
      .then((d) => setScheduled(d.scheduled ?? []));
  }, [startStr]);

  const byDay = new Map<string, ContentCalendarItem[]>();
  for (const item of scheduled) {
    const day = item.scheduledAt.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), item]);
  }

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/calendar" className="text-sm text-muted underline">
          ← Календарь
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Неделя</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        {days.map((day) => (
          <div key={day} className="space-y-2">
            <p className="text-xs font-medium">
              {new Date(day).toLocaleDateString("ru-RU", { weekday: "short", day: "numeric" })}
            </p>
            {(byDay.get(day) ?? []).map((item) => (
              <ContentCalendarItemCard key={item.id} item={item} />
            ))}
            {!byDay.get(day)?.length && (
              <p className="text-[10px] text-muted">—</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
