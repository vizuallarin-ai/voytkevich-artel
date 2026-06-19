"use client";

import type { PriorityQueueItem } from "@/types/content-prioritization";
import Link from "next/link";
import { PriorityScoreBadge } from "./PriorityScoreBadge";

type Props = {
  queue: PriorityQueueItem[];
  onSendToCalendar?: (contentItemId: string) => void;
};

export function PriorityQueueTable({ queue, onSendToCalendar }: Props) {
  if (!queue.length) {
    return <p className="text-sm text-muted">Очередь пуста</p>;
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-graphite/10">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-graphite/5 text-xs text-muted">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Kind</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Readiness</th>
            <th className="p-3">Action</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {queue.map((row) => (
            <tr key={row.contentItemId} className="border-b border-graphite/5 align-top">
              <td className="p-3 max-w-[200px]">
                <Link
                  href={`/dashboard/content/items/${row.contentItemId}`}
                  className="underline text-primary"
                >
                  {row.title}
                </Link>
              </td>
              <td className="p-3 text-xs">{row.kind}</td>
              <td className="p-3">
                <PriorityScoreBadge score={row.score} />
              </td>
              <td className="p-3 text-xs">{row.score.inputs.readinessScore}</td>
              <td className="p-3 text-xs text-muted max-w-[180px]">{row.score.recommendedAction}</td>
              <td className="p-3">
                {onSendToCalendar && (row.score.level === "P1" || row.score.level === "P2") && (
                  <button
                    type="button"
                    onClick={() => onSendToCalendar(row.contentItemId)}
                    className="text-xs text-primary underline"
                  >
                    → Calendar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
