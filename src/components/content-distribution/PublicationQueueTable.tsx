"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicationQueueItem } from "@/types/content-distribution";
import { PublicationStatusBadge } from "@/components/content-distribution/PublicationStatusBadge";

export function PublicationQueueTable() {
  const [queue, setQueue] = useState<PublicationQueueItem[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/content-distribution/queue")
      .then((r) => r.json())
      .then((d) => setQueue(d.queue ?? []));
  }, []);

  if (queue.length === 0) {
    return (
      <p className="rounded-xl border p-6 text-center text-sm text-muted">
        Очередь пуста. Создайте publication draft для опубликованного материала.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted-bg text-xs uppercase text-muted text-left">
          <tr>
            <th className="px-4 py-3">Материал</th>
            <th className="px-4 py-3">Площадка</th>
            <th className="px-4 py-3">Статус</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">W/B</th>
            <th className="px-4 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-4 py-3 max-w-[180px] truncate">{item.contentTitle}</td>
              <td className="px-4 py-3 text-xs">{item.platformId}</td>
              <td className="px-4 py-3">
                <PublicationStatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3">{item.priority}</td>
              <td className="px-4 py-3 text-xs">
                {item.warnings.length}/{item.blockers.length}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/content/distribution/publications/${item.id}`}
                  className="text-primary text-xs underline"
                >
                  открыть
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
