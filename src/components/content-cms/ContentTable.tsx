import Link from "next/link";
import type { CMSContentItem } from "@/types/content-cms";
import { ContentStatusBadge } from "./ContentStatusBadge";
import { ContentQualityBadge } from "./ContentQualityBadge";
import { ContentIndexingBadge } from "./ContentIndexingBadge";

export function ContentTable({
  items,
  showKind = true,
}: {
  items: CMSContentItem[];
  showKind?: boolean;
}) {
  if (!items.length) {
    return (
      <p className="rounded-sm border border-dashed border-graphite/20 px-4 py-8 text-center text-sm text-muted">
        Материалов не найдено. Измените фильтры или добавьте контент в очередь.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-graphite/10 text-xs text-muted">
            <th className="py-2 pr-3">Материал</th>
            {showKind ? <th className="py-2 pr-3">Тип</th> : null}
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Quality</th>
            <th className="py-2 pr-3">Priority</th>
            <th className="py-2 pr-3">Index</th>
            <th className="py-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-graphite/5">
              <td className="py-2 pr-3">
                <Link
                  href={`/dashboard/content/items/${encodeURIComponent(item.id)}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {item.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted">{item.slug}</p>
              </td>
              {showKind ? (
                <td className="py-2 pr-3 text-xs text-muted">{item.kind}</td>
              ) : null}
              <td className="py-2 pr-3">
                <ContentStatusBadge status={item.status} />
              </td>
              <td className="py-2 pr-3">
                <ContentQualityBadge level={item.quality.level} score={item.quality.score} />
              </td>
              <td className="py-2 pr-3 text-xs">{item.seo.priority ?? "—"}</td>
              <td className="py-2 pr-3">
                <ContentIndexingBadge
                  indexable={item.indexing.indexable}
                  sitemap={item.indexing.sitemap}
                />
              </td>
              <td className="py-2 text-xs">
                <Link
                  href={`/dashboard/content/preview/${encodeURIComponent(item.id)}`}
                  className="text-muted underline-offset-4 hover:underline"
                >
                  Preview
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
