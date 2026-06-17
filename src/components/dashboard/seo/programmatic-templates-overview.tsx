"use client";

import Link from "next/link";
import { programmaticPageTemplates } from "@/data/programmatic-page-templates";
import { countCombinationsByTemplate } from "@/lib/programmatic-seo/page-template-resolver";
import { getTaxonomyCombinations } from "@/lib/taxonomy/taxonomy-combination-builder";
import { mapCombinationToTemplateType } from "@/lib/programmatic-seo/page-template-resolver";

export function ProgrammaticTemplatesOverview() {
  const counts = countCombinationsByTemplate();
  const combinations = getTaxonomyCombinations();

  const indexableByTemplate = Object.fromEntries(
    programmaticPageTemplates.map((t) => [
      t.type,
      combinations.filter(
        (c) => mapCombinationToTemplateType(c) === t.type && c.indexing.indexable,
      ).length,
    ]),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-section text-3xl">Шаблоны programmatic SEO</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Этап 20: 8 шаблонов посадочных страниц. Страницы рендерятся, но по умолчанию noindex до
          approval и проверки проектов.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {programmaticPageTemplates.map((t) => (
          <div key={t.id} className="rounded-sm border border-graphite/10 bg-background p-4">
            <p className="text-xs text-muted">{t.type}</p>
            <p className="mt-1 font-medium">{t.title}</p>
            <p className="mt-2 text-2xl font-display">{counts[t.type] ?? 0}</p>
            <p className="text-xs text-muted">комбинаций в таксономии</p>
            <p className="mt-2 text-xs">
              indexable: <span className="font-medium">{indexableByTemplate[t.type] ?? 0}</span>
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Шаблоны и блоки</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-xs text-muted">
                <th className="py-2 pr-4">Шаблон</th>
                <th className="py-2 pr-4">Обязательные блоки</th>
                <th className="py-2 pr-4">Index by default</th>
                <th className="py-2">Human review</th>
              </tr>
            </thead>
            <tbody>
              {programmaticPageTemplates.map((t) => (
                <tr key={t.id} className="border-b border-graphite/5">
                  <td className="py-3 pr-4 font-medium">{t.title}</td>
                  <td className="py-3 pr-4 text-xs text-muted">{t.requiredBlocks.join(", ")}</td>
                  <td className="py-3 pr-4">{t.seoRules.indexableByDefault ? "да" : "нет"}</td>
                  <td className="py-3">{t.seoRules.requiresHumanReview ? "да" : "нет"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Примеры URL (первые 12)</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {combinations.slice(0, 12).map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
              <Link href={c.url} className="text-graphite underline-offset-4 hover:underline" target="_blank">
                {c.url}
              </Link>
              <span className="text-xs text-muted">
                {mapCombinationToTemplateType(c)} · {c.indexing.indexable ? "index" : "noindex"}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/dashboard/seo/taxonomy/matrix" className="mt-4 inline-block text-sm underline">
          Полная матрица →
        </Link>
      </section>
    </div>
  );
}
