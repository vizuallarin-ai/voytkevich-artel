"use client";

import Link from "next/link";
import { projectObjectTypes, getActiveObjectTypes } from "@/data/project-object-types";
import { projectMaterials, getActiveMaterials } from "@/data/project-materials";
import { projectSizes } from "@/data/project-size-taxonomy";
import { getSeoFeatures } from "@/data/project-feature-taxonomy";
import { projectSearchIntents } from "@/data/project-intent-taxonomy";
import { irkutskRegionTaxonomy } from "@/data/irkutsk-region-taxonomy";
import { taxonomyMatrixRules } from "@/data/project-taxonomy-matrix";
import { getTaxonomyCombinationStats } from "@/lib/taxonomy/taxonomy-combination-builder";
import { validateProjectTaxonomy } from "@/lib/taxonomy/taxonomy-validation";

export function TaxonomyOverview() {
  const comboStats = getTaxonomyCombinationStats();
  const validation = validateProjectTaxonomy();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-section text-3xl">Таксономия проектов</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Этап 19: управляемая система объектов, материалов, размеров, особенностей, географии и
          интентов. Страницы не публикуются — только кандидаты и правила индексации.
        </p>
      </div>

      {!validation.valid && (
        <section className="rounded-sm border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Ошибки валидации: {validation.errors.length}</p>
          <ul className="mt-2 list-inside list-disc text-muted">
            {validation.errors.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      {validation.warnings.length > 0 && (
        <section className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Предупреждений: {validation.warnings.length} — см. validateProjectTaxonomy()
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Типы объектов", value: getActiveObjectTypes().length },
          { label: "Материалы", value: getActiveMaterials().length },
          { label: "Размеры / площади", value: projectSizes.length },
          { label: "Особенности (SEO)", value: getSeoFeatures().length },
          { label: "География", value: irkutskRegionTaxonomy.length },
          { label: "Интенты", value: projectSearchIntents.length },
          { label: "Комбинаций", value: comboStats.total },
          { label: "Правил матрицы", value: taxonomyMatrixRules.length },
        ].map((item) => (
          <div key={item.label} className="rounded-sm border border-graphite/10 bg-background p-4">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 font-display text-2xl">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Комбинации</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Indexable (approved)</span>
              <span>{comboStats.indexable}</span>
            </li>
            <li className="flex justify-between">
              <span>Needs keyword data</span>
              <span>{comboStats.needsKeywordData}</span>
            </li>
            <li className="flex justify-between">
              <span>Filter-only</span>
              <span>{comboStats.filterOnly}</span>
            </li>
          </ul>
          <Link
            href="/dashboard/seo/taxonomy/matrix"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Открыть матрицу комбинаций →
          </Link>
        </section>

        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Объекты</h2>
          <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
            {projectObjectTypes.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span>{o.pluralTitle}</span>
                <span className="text-muted">{o.priority}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Материалы</h2>
          <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
            {projectMaterials.map((m) => (
              <li key={m.id} className="flex justify-between gap-2">
                <span>{m.title}</span>
                <span className="text-muted">{m.commercialIntent}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">География</h2>
          <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
            {irkutskRegionTaxonomy.map((r) => (
              <li key={r.id} className="flex justify-between gap-2">
                <span>{r.title}</span>
                <span className="text-muted">{r.indexableByDefault ? "index" : "review"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
