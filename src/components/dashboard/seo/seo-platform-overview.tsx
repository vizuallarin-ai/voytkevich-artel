"use client";

import Link from "next/link";
import { programmaticSeoSections } from "@/data/programmatic-seo-sections";
import { externalContentPlatforms } from "@/data/external-content-platforms";
import { irkutskRegionTaxonomy } from "@/data/irkutsk-region-taxonomy";
import { getProgrammaticQueueStats } from "@/data/programmatic-seo-initial-queue";
import { seoPageTypes } from "@/data/seo-page-types";

export function SeoPlatformOverview() {
  const stats = getProgrammaticQueueStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-section text-3xl">SEO-платформа</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Фундамент programmatic SEO: типы страниц, региональная таксономия, очередь публикаций, правила
          качества и индексации. Массовая генерация — только после Этапа 19+.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "В очереди", value: stats.total },
          { label: "Разделов контента", value: programmaticSeoSections.length },
          { label: "Типов страниц", value: seoPageTypes.length },
          { label: "Локаций", value: irkutskRegionTaxonomy.length },
        ].map((item) => (
          <div key={item.label} className="rounded-sm border border-graphite/10 bg-background p-4">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 font-display text-2xl">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p>
          <strong>Initial queue:</strong> все {stats.total} страниц в статусе planned / needs-keyword-data —
          <strong> noindex</strong>, не опубликованы. Индексация только после review и keyword validation.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Разделы контента</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {programmaticSeoSections.map((s) => (
              <li key={s.id} className="flex justify-between gap-4">
                <span>{s.title}</span>
                <span className="text-muted">{stats.bySection[s.id] ?? 0} в очереди</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Внешние площадки (teaser)</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {externalContentPlatforms.slice(0, 8).map((p) => (
              <li key={p.id} className="flex justify-between gap-4">
                <span>{p.title}</span>
                <span className="text-muted">{p.adapterStatus}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Полная статья — только на сайте. Внешние — teaser + UTM.</p>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/seo/indexation"
          className="rounded-sm bg-graphite px-4 py-2 text-sm text-background transition hover:bg-graphite/90"
        >
          Indexation →
        </Link>
        <Link
          href="/dashboard/seo/sitemaps"
          className="rounded-sm border border-graphite/15 px-4 py-2 text-sm transition hover:bg-sand"
        >
          Sitemaps →
        </Link>
        <Link
          href="/dashboard/seo/roadmap"
          className="rounded-sm border border-graphite/15 px-4 py-2 text-sm transition hover:bg-sand"
        >
          SEO-очередь →
        </Link>
      </div>
    </div>
  );
}
