"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProjectCard } from "@/components/catalog/project-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { filterProjects, filtersToSearchParams, parseCatalogFilters } from "@/lib/filters";
import type { CatalogFilters, Project } from "@/types";
import { cn } from "@/lib/utils";

const materials = ["каркас", "газобетон", "кирпич", "брус", "клееный брус"] as const;
const styles = ["скандинавский", "минимализм", "шале", "барнхаус", "хай-тек", "классика"] as const;

export function CatalogClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseCatalogFilters(Object.fromEntries(searchParams.entries()));
  const [compare, setCompare] = useState<string[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => filterProjects(projects, filters), [projects, filters]);

  const update = (patch: Partial<CatalogFilters>) => {
    const next = { ...filters, ...patch };
    router.push(`/catalog?${filtersToSearchParams(next)}`, { scroll: false });
  };

  const toggleCompare = (id: string) => {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const FilterSidebar = () => (
    <aside className="space-y-6" aria-label="Фильтры каталога">
      <div>
        <label className="text-sm font-medium">Поиск</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder="Название, стиль..."
            defaultValue={filters.q}
            onChange={(e) => update({ q: e.target.value || undefined })}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Площадь, м²</p>
        <div className="mt-2 flex gap-2">
          <Input
            type="number"
            placeholder="от"
            defaultValue={filters.areaMin}
            onBlur={(e) => update({ areaMin: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="до"
            defaultValue={filters.areaMax}
            onBlur={(e) => update({ areaMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Цена, ₽</p>
        <div className="mt-2 flex gap-2">
          <Input
            type="number"
            placeholder="от"
            defaultValue={filters.priceMin}
            onBlur={(e) => update({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="до"
            defaultValue={filters.priceMax}
            onBlur={(e) => update({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Материал</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {materials.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                const cur = filters.material ?? [];
                update({
                  material: cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m],
                });
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize",
                filters.material?.includes(m) && "border-graphite bg-graphite text-background"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Стиль</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                const cur = filters.style ?? [];
                update({
                  style: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
                });
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize",
                filters.style?.includes(s) && "border-graphite bg-graphite text-background"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {[
          { key: "terrace" as const, label: "Терраса" },
          { key: "garage" as const, label: "Гараж" },
          { key: "sauna" as const, label: "Сауна" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!filters[key]}
              onChange={(e) => update({ [key]: e.target.checked || undefined })}
            />
            {label}
          </label>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium">Сортировка</p>
        <select
          className="mt-2 w-full rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
          value={filters.sort ?? "newest"}
          onChange={(e) => update({ sort: e.target.value as CatalogFilters["sort"] })}
        >
          <option value="newest">Сначала новые</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
          <option value="area-asc">Площадь ↑</option>
          <option value="area-desc">Площадь ↓</option>
        </select>
      </div>
    </aside>
  );

  return (
    <div className="container-narrow px-5 md:px-10 lg:px-16">
      <div className="flex gap-10">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28">
            <FilterSidebar />
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted">
              Найдено <strong className="text-foreground">{filtered.length}</strong> проектов
            </p>
            <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters(true)}>
              Фильтры
            </Button>
            {compare.length > 0 && (
              <p className="text-sm">Сравнение: {compare.length} из 3</p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-sm border border-dashed border-graphite/20 py-20 text-center">
              <p className="text-muted">По вашим фильтрам ничего не найдено</p>
              <Button className="mt-4" variant="outline" onClick={() => router.push("/catalog")}>
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  compare={compare}
                  onCompare={toggleCompare}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-background/95 p-6 lg:hidden">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setMobileFilters(false)}>
              Закрыть
            </Button>
          </div>
          <FilterSidebar />
        </div>
      )}
    </div>
  );
}
