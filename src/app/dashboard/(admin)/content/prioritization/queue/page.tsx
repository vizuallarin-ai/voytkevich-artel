"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PriorityQueueItem } from "@/types/content-prioritization";
import { PriorityQueueTable } from "@/components/content-prioritization/PriorityQueueTable";
import { PriorityFilters } from "@/components/content-prioritization/PriorityFilters";
import { trackPriorityQueueViewed } from "@/lib/content-prioritization/priority-analytics";

export default function PriorityQueuePage() {
  const [queue, setQueue] = useState<PriorityQueueItem[]>([]);
  const [levelFilter, setLevelFilter] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("");

  const load = useCallback(() => {
    fetch("/api/dashboard/content-prioritization/queue")
      .then((r) => r.json())
      .then((d) => setQueue(d.queue ?? []));
  }, []);

  useEffect(() => {
    trackPriorityQueueViewed({ page: "priority-queue" });
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return queue.filter((q) => {
      if (levelFilter && q.score.level !== levelFilter) return false;
      if (confidenceFilter && q.score.confidence !== confidenceFilter) return false;
      return true;
    });
  }, [queue, levelFilter, confidenceFilter]);

  async function sendToCalendar(contentItemId: string) {
    const at = new Date(Date.now() + 86400000).toISOString();
    await fetch("/api/dashboard/content-calendar/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentItemId, scheduledAt: at }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/prioritization" className="text-sm text-muted underline">
          ← Приоритизация
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Приоритетная очередь</h1>
      </div>
      <PriorityFilters
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
        confidenceFilter={confidenceFilter}
        onConfidenceChange={setConfidenceFilter}
      />
      <PriorityQueueTable queue={filtered} onSendToCalendar={(id) => void sendToCalendar(id)} />
    </div>
  );
}
