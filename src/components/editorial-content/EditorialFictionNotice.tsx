"use client";

import { useEffect } from "react";
import type { EditorialContentItem } from "@/types/editorial-content";
import {
  buildEditorialAnalyticsPayload,
  trackEditorialFictionNoticeViewed,
} from "@/lib/editorial-content/editorial-analytics";

export function EditorialFictionNotice({ item }: { item: EditorialContentItem }) {
  useEffect(() => {
    if (item.storyMeta.fictionNoticeRequired) {
      trackEditorialFictionNoticeViewed(buildEditorialAnalyticsPayload(item));
    }
  }, [item]);

  if (!item.storyMeta.fictionNoticeRequired) return null;

  return (
    <aside
      className="mt-6 rounded-sm border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-950"
      role="note"
      aria-label="Маркировка редакционного материала"
    >
      Это редакционная история / собирательный сценарий по мотивам типовых вопросов клиентов.
      Материал не является отзывом реального клиента и не описывает конкретный построенный объект.
    </aside>
  );
}
