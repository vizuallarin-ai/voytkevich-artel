"use client";

import type { EditorialContentItem } from "@/types/editorial-content";
import {
  buildEditorialAnalyticsPayload,
  trackEditorialSourceClicked,
} from "@/lib/editorial-content/editorial-analytics";

export function EditorialSourceNotice({ item }: { item: EditorialContentItem }) {
  if (!item.storyMeta.sourceRequired && !item.storyMeta.sourceUrls?.length) return null;

  const factStatus = item.storyMeta.factCheckStatus ?? "pending";

  return (
    <aside
      className="mt-6 rounded-sm border border-graphite/10 bg-sand/30 px-4 py-3 text-sm"
      role="note"
      aria-label="Источники и проверка"
    >
      <p className="font-display text-sm">Источники и проверка</p>
      {item.storyMeta.sourceUrls?.length ? (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {item.storyMeta.sourceUrls.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
                onClick={() =>
                  trackEditorialSourceClicked(buildEditorialAnalyticsPayload(item, { sourceUrl: url }))
                }
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-amber-900">Источник требуется перед публикацией</p>
      )}
      {item.storyMeta.sourceNotes ? (
        <p className="mt-2 text-xs text-muted">{item.storyMeta.sourceNotes}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted">
        Статус проверки:{" "}
        {factStatus === "passed" ? "проверено" : factStatus === "failed" ? "требует доработки" : "ожидает проверки"}
      </p>
    </aside>
  );
}
