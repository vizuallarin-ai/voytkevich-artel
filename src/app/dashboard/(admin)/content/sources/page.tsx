import type { Metadata } from "next";
import Link from "next/link";
import { contentService } from "@/lib/content-cms/content-service";

export const metadata: Metadata = {
  title: "CRM — Источники",
  robots: { index: false, follow: false },
};

export default async function ContentSourcesPage() {
  const sources = await contentService.listSources();
  const newsItems = await contentService.list({
    kind: ["news", "digest"],
    requiresSource: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Источники и fact-check</h1>
        <p className="mt-2 text-sm text-muted">
          Source management для новостей и нормативных материалов. Добавление источников — через
          редактирование материала (TODO: форма на Этапе 24).
        </p>
      </div>

      {sources.length === 0 ? (
        <p className="rounded-sm border border-dashed border-graphite/20 px-4 py-8 text-center text-sm text-muted">
          Источники ещё не добавлены. Материалы с needs-source: {newsItems.length}
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {sources.map((s) => (
            <li key={s.id} className="rounded-sm border border-graphite/10 p-4">
              {s.title} — {s.reliability}
            </li>
          ))}
        </ul>
      )}

      <section>
        <h2 className="font-display text-lg">Требуют источника</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {newsItems.slice(0, 15).map((item) => (
            <li key={item.id}>
              <Link
                href={`/dashboard/content/items/${encodeURIComponent(item.id)}`}
                className="underline-offset-4 hover:underline"
              >
                {item.title}
              </Link>
              <span className="text-muted"> — {item.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
