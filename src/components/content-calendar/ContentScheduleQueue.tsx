"use client";

import type { CMSContentItem } from "@/types/content-cms";
import type { ContentReadinessStatus } from "@/types/content-scheduling";
import type { RecommendedDate } from "@/types/content-scheduling";
import Link from "next/link";
import { ContentReadinessBadge } from "./ContentReadinessBadge";
import { ContentScheduleActions } from "./ContentScheduleActions";
import { ContentScheduleWarningsPanel } from "./ContentScheduleWarningsPanel";

export type QueueRow = {
  item: CMSContentItem;
  readiness: ContentReadinessStatus;
  recommended?: RecommendedDate;
};

type Props = {
  queue: QueueRow[];
  onRefresh?: () => void;
};

export function ContentScheduleQueue({ queue, onRefresh }: Props) {
  if (!queue.length) {
    return (
      <div className="rounded-sm border border-graphite/10 p-6 text-center text-sm text-muted">
        Нет approved материалов для планирования. Отправьте материалы на review/approve.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-graphite/10">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-graphite/10 bg-graphite/5 text-xs text-muted">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Kind</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Readiness</th>
            <th className="p-3">Suggested</th>
            <th className="p-3">Blockers</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((row) => (
            <tr key={row.item.id} className="border-b border-graphite/5 align-top">
              <td className="p-3 max-w-[200px]">
                <Link href={`/dashboard/content/items/${row.item.id}`} className="underline text-primary">
                  {row.item.title}
                </Link>
              </td>
              <td className="p-3 text-xs">{row.item.kind}</td>
              <td className="p-3 text-xs">{row.item.seo.priority ?? "P3"}</td>
              <td className="p-3">
                <ContentReadinessBadge readiness={row.readiness} />
              </td>
              <td className="p-3 text-xs text-muted">
                {row.recommended
                  ? `${row.recommended.date} ${row.recommended.time}`
                  : "—"}
              </td>
              <td className="p-3 text-xs text-destructive max-w-[160px]">
                {row.readiness.blockers[0] ?? "—"}
              </td>
              <td className="p-3">
                <ContentScheduleActions
                  contentItemId={row.item.id}
                  recommendedAt={
                    row.recommended
                      ? `${row.recommended.date}T${row.recommended.time}:00`
                      : undefined
                  }
                  onScheduled={onRefresh}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 lg:hidden space-y-4">
        {queue.map((row) => (
          <div key={row.item.id} className="rounded-sm border border-graphite/10 p-3 space-y-2">
            <p className="font-medium text-sm">{row.item.title}</p>
            <ContentReadinessBadge readiness={row.readiness} />
            <ContentScheduleWarningsPanel
              warnings={row.readiness.warnings}
              blockers={row.readiness.blockers}
            />
            <ContentScheduleActions
              contentItemId={row.item.id}
              onScheduled={onRefresh}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
