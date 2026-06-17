import type { Metadata } from "next";
import Link from "next/link";
import { contentService } from "@/lib/content-cms/content-service";
import { getIndexingIssues } from "@/lib/content-cms/content-indexing-service";
import { ContentIndexingBadge } from "@/components/content-cms/ContentIndexingBadge";

export const metadata: Metadata = {
  title: "CRM — Indexing",
  robots: { index: false, follow: false },
};

export default async function ContentIndexingPage() {
  const items = await contentService.list();
  const withIssues = getIndexingIssues(items);
  const indexable = items.filter((i) => i.indexing.indexable);
  const noindex = items.filter((i) => !i.indexing.indexable);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Indexing dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Indexable: {indexable.length} · Noindex: {noindex.length} · Issues: {withIssues.length}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs text-muted">
              <th className="py-2 pr-3">Материал</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Index</th>
              <th className="py-2">Issue</th>
            </tr>
          </thead>
          <tbody>
            {withIssues.map(({ item, decision }) => (
              <tr key={item.id} className="border-b border-graphite/5">
                <td className="py-2 pr-3">
                  <Link
                    href={`/dashboard/content/items/${encodeURIComponent(item.id)}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="py-2 pr-3 text-xs">{item.status}</td>
                <td className="py-2 pr-3">
                  <ContentIndexingBadge indexable={item.indexing.indexable} sitemap={item.indexing.sitemap} />
                </td>
                <td className="py-2 text-xs text-amber-900">
                  {decision.issues.map((i) => i.message).join("; ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
