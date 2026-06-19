"use client";

import type { ContentCalendarItem } from "@/types/content-calendar";
import Link from "next/link";
import { ContentReadinessBadge } from "./ContentReadinessBadge";

type Props = {
  item: ContentCalendarItem;
};

export function ContentCalendarItemCard({ item }: Props) {
  return (
    <div className="rounded-sm border border-graphite/10 bg-background p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">{item.contentTitle}</p>
          <p className="text-xs text-muted mt-0.5">
            {item.contentKind} · {item.publicationType} · {item.priority}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted">{item.status}</span>
      </div>
      <p className="text-xs text-muted mt-2">
        {new Date(item.scheduledAt).toLocaleString("ru-RU", { timeZone: "Asia/Irkutsk" })}
      </p>
      <div className="mt-2">
        <ContentReadinessBadge readiness={item.readiness} compact />
      </div>
      {item.blockers.length > 0 && (
        <p className="text-[10px] text-destructive mt-1">{item.blockers[0]}</p>
      )}
      <Link
        href={`/dashboard/content/items/${item.contentItemId}`}
        className="mt-2 inline-block text-xs text-primary underline"
      >
        Открыть материал
      </Link>
    </div>
  );
}
