"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/catalog/project-card";
import { CompareBar } from "@/components/catalog/compare-bar";
import { CompareModal } from "@/components/catalog/compare-modal";
import { CatalogFilterSidebar } from "@/components/catalog/catalog-filter-sidebar";
import { CatalogActiveFilters } from "@/components/catalog/catalog-active-filters";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { Button } from "@/components/ui/button";
import { catalogEmptyState } from "@/data/catalog-copy";
import {
  filterProjects,
  filtersToSearchParams,
  getMaterialsInCatalog,
  parseCatalogFilters,
} from "@/lib/filters";
import type { CatalogFilters, Project } from "@/types";

type Props = {
  projects: Project[];
  initialFilters?: CatalogFilters;
  basePath?: string;
  leadSource?: string;
  categorySlug?: string;
};

export function CatalogClient({
  projects,
  initialFilters,
  basePath = "/catalog",
  leadSource = "catalog",
  categorySlug,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFilters = parseCatalogFilters(Object.fromEntries(searchParams.entries()));
  const filters = initialFilters ? { ...initialFilters, ...urlFilters } : urlFilters;
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => filterProjects(projects, filters), [projects, filters]);
  const compareProjects = useMemo(
    () => projects.filter((p) => compare.includes(p.id)),
    [projects, compare],
  );
  const availableMaterials = useMemo(() => getMaterialsInCatalog(projects), [projects]);

  const pushFilters = (next: CatalogFilters) => {
    const qs = filtersToSearchParams(next);
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  };

  const update = (patch: Partial<CatalogFilters>) => {
    pushFilters({ ...filters, ...patch });
  };

  const resetFilters = () => {
    if (initialFilters) {
      pushFilters({ ...initialFilters, sort: filters.sort });
    } else {
      router.push(basePath, { scroll: false });
    }
  };

  const toggleCompare = (id: string) => {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  const filterContext = [
    categorySlug ? `категория: ${categorySlug}` : null,
    ...Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== false && v !== "")
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(",") : v}`),
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <div className="container-narrow px-5 md:px-10 lg:px-16">
      <div className="flex gap-10">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28">
            <CatalogFilterSidebar
              filters={filters}
              onUpdate={update}
              availableMaterials={availableMaterials}
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted">
              Найдено <strong className="text-foreground">{filtered.length}</strong> проектов
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <CatalogSort sort={filters.sort} onChange={(sort) => update({ sort })} />
              <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters(true)}>
                Фильтры
              </Button>
            </div>
          </div>

          <CatalogActiveFilters filters={filters} onUpdate={pushFilters} onReset={resetFilters} />

          {compare.length > 0 && (
            <button
              type="button"
              className="mb-4 text-sm underline-offset-4 hover:underline"
              onClick={() => setCompareOpen(true)}
            >
              Сравнение: {compare.length} из 3
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-sm border border-dashed border-graphite/20 px-6 py-16 text-center">
              <h3 className="font-display text-xl">{catalogEmptyState.title}</h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted">{catalogEmptyState.text}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={resetFilters}>
                  Сбросить фильтры
                </Button>
                <Button asChild>
                  <Link href="/catalog#catalog-picker">{catalogEmptyState.cta}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    compare={compare}
                    onCompare={toggleCompare}
                    leadSource={leadSource}
                    filterContext={filterContext}
                  />
                ))}
              </div>
              <div className="mt-12 rounded-sm border border-graphite/10 bg-muted-bg/40 p-6 text-center md:p-8">
                <p className="font-display text-lg">Получить подборку проектов под мой бюджет</p>
                <p className="mt-2 text-sm text-muted">
                  Уточним площадь, участок и материал — предложим 2–3 варианта из каталога
                </p>
                <Button asChild className="mt-4">
                  <Link href="/catalog#catalog-picker">Получить подборку</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background p-6 lg:hidden">
          <div className="mb-4 flex justify-between">
            <p className="font-medium">Фильтры</p>
            <Button variant="ghost" onClick={() => setMobileFilters(false)}>
              Закрыть
            </Button>
          </div>
          <CatalogFilterSidebar
            filters={filters}
            onUpdate={(patch) => {
              update(patch);
            }}
            availableMaterials={availableMaterials}
          />
          <Button className="mt-6 w-full" onClick={() => setMobileFilters(false)}>
            Показать {filtered.length} проектов
          </Button>
        </div>
      )}

      <CompareBar
        projects={compareProjects}
        onRemove={(id) => setCompare((prev) => prev.filter((x) => x !== id))}
        onClear={() => setCompare([])}
        onOpen={() => setCompareOpen(true)}
      />

      <CompareModal
        projects={compareProjects}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemove={(id) => {
          setCompare((prev) => {
            const next = prev.filter((x) => x !== id);
            if (next.length < 2) setCompareOpen(false);
            return next;
          });
        }}
      />
    </div>
  );
}
