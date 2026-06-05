"use client";

import type { CatalogFilters } from "@/types";

const SORT_OPTIONS: { value: NonNullable<CatalogFilters["sort"]>; label: string }[] = [
  { value: "featured", label: "Рекомендуемые" },
  { value: "price-asc", label: "Цена: сначала дешевле" },
  { value: "price-desc", label: "Цена: сначала дороже" },
  { value: "area-asc", label: "Площадь: сначала меньше" },
  { value: "area-desc", label: "Площадь: сначала больше" },
  { value: "duration-asc", label: "Срок: быстрее" },
  { value: "duration-desc", label: "Срок: дольше" },
  { value: "newest", label: "Сначала новые" },
];

type Props = {
  sort: CatalogFilters["sort"];
  onChange: (sort: CatalogFilters["sort"]) => void;
};

export function CatalogSort({ sort, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Сортировка</span>
      <select
        className="rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
        value={sort ?? "featured"}
        onChange={(e) => onChange(e.target.value as CatalogFilters["sort"])}
        aria-label="Сортировка проектов"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
