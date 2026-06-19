"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ContentScheduleQueue, type QueueRow } from "@/components/content-calendar/ContentScheduleQueue";
import { trackContentScheduleQueueViewed } from "@/lib/content-calendar/calendar-analytics";

export default function CalendarQueuePage() {
  const [queue, setQueue] = useState<QueueRow[]>([]);

  const load = useCallback(() => {
    fetch("/api/dashboard/content-calendar/queue")
      .then((r) => r.json())
      .then((d) => setQueue(d.queue ?? []));
  }, []);

  useEffect(() => {
    trackContentScheduleQueueViewed({ page: "calendar-queue" });
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/calendar" className="text-sm text-muted underline">
          ← Календарь
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Очередь к планированию</h1>
        <p className="mt-2 text-sm text-muted">
          Approved материалы без расписания. Schedule только при readiness без blockers.
        </p>
      </div>
      <ContentScheduleQueue queue={queue} onRefresh={load} />
    </div>
  );
}
