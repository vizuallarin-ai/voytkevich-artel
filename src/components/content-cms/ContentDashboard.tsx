import Link from "next/link";
import type { ContentDashboardMetrics } from "@/lib/content-cms/content-dashboard-metrics";
import { contentCmsSections } from "@/data/content-cms-sections";
import { ContentTable } from "./ContentTable";

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-graphite/10 bg-background p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

export function ContentDashboard({ metrics, reviewItems }: {
  metrics: ContentDashboardMetrics;
  reviewItems: import("@/types/content-cms").CMSContentItem[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-section text-3xl">Контент CMS</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Операционная система управления programmatic, technical и editorial контентом. Все
          материалы из data-файлов; mock repository до подключения БД.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard label="Всего материалов" value={metrics.total} />
        <KpiCard label="Опубликовано" value={metrics.published} />
        <KpiCard label="На проверке" value={metrics.review} />
        <KpiCard label="Требует внимания" value={metrics.requiresAttention} />
        <KpiCard label="Blockers" value={metrics.quality.blockersCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Quality</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>poor: {metrics.quality.poor}</li>
            <li>acceptable: {metrics.quality.acceptable}</li>
            <li>good: {metrics.quality.good}</li>
            <li>strong: {metrics.quality.strong}</li>
            <li>warnings: {metrics.quality.warningsCount}</li>
          </ul>
        </div>
        <div className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Indexing</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>indexable: {metrics.indexing.indexable}</li>
            <li>noindex: {metrics.indexing.noindex}</li>
            <li>sitemap: {metrics.indexing.sitemapEligible}</li>
            <li>canonical missing: {metrics.indexing.canonicalMissing}</li>
          </ul>
        </div>
        <div className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">По типам</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {Object.entries(metrics.byKind).map(([kind, count]) => (
              <li key={kind}>
                {kind}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Разделы CMS</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {contentCmsSections.map((section) => (
            <Link
              key={section.id}
              href={section.route}
              className="rounded-sm border border-graphite/10 px-4 py-3 transition hover:bg-sand/40"
            >
              <p className="font-medium text-sm">{section.title}</p>
              <p className="mt-1 text-xs text-muted">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg">На проверке</h2>
          <Link href="/dashboard/content/review" className="text-sm underline-offset-4 hover:underline">
            Все →
          </Link>
        </div>
        <div className="mt-4">
          <ContentTable items={reviewItems} />
        </div>
      </section>
    </div>
  );
}
