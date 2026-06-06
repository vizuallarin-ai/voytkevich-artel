"use client";

import { useMemo, useState } from "react";
import type { CaseItem, CaseListFilters } from "@/types/case";
import { filterCasesList } from "@/lib/cases";
import { CaseCard } from "./case-card";
import { CasesEmptyState } from "./cases-empty-state";
import { Button } from "@/components/ui/button";

const MATERIAL_OPTIONS = [
  { value: "брус", label: "Брус" },
  { value: "каркас", label: "Каркас" },
  { value: "газобетон", label: "Газобетон" },
];

const AREA_OPTIONS: { value: CaseListFilters["areaPreset"]; label: string }[] = [
  { value: "do-100", label: "До 100 м²" },
  { value: "100-150", label: "100–150 м²" },
  { value: "150-200", label: "150–200 м²" },
  { value: "200-plus", label: "200+ м²" },
];

const PURPOSE_OPTIONS = [
  { value: "семья", label: "Для семьи" },
  { value: "постоянное", label: "Постоянное проживание" },
  { value: "дача", label: "Дачный дом" },
];

const TASK_OPTIONS = [
  { value: "slozhny-uchastok", label: "Сложный участок" },
  { value: "pod-klyuch", label: "Под ключ" },
  { value: "udalennoe-stroitelstvo", label: "Удалённое строительство" },
];

type Props = {
  cases: CaseItem[];
  showFilters?: boolean;
};

export function CasesListClient({ cases, showFilters = true }: Props) {
  const [filters, setFilters] = useState<CaseListFilters>({});

  const filtered = useMemo(() => filterCasesList(cases, filters), [cases, filters]);
  const hasActiveFilters = Boolean(
    filters.material?.length ||
      filters.areaPreset ||
      filters.floors?.length ||
      filters.purpose?.length ||
      filters.taskTags?.length,
  );

  const toggleMaterial = (value: string) => {
    setFilters((prev) => {
      const current = prev.material ?? [];
      const next = current.includes(value)
        ? current.filter((m) => m !== value)
        : [...current, value];
      return { ...prev, material: next.length ? next : undefined };
    });
  };

  const toggleFloors = (value: number) => {
    setFilters((prev) => {
      const current = prev.floors ?? [];
      const next = current.includes(value)
        ? current.filter((f) => f !== value)
        : [...current, value];
      return { ...prev, floors: next.length ? next : undefined };
    });
  };

  const togglePurpose = (value: string) => {
    setFilters((prev) => {
      const current = prev.purpose ?? [];
      const next = current.includes(value)
        ? current.filter((p) => p !== value)
        : [...current, value];
      return { ...prev, purpose: next.length ? next : undefined };
    });
  };

  const toggleTask = (value: string) => {
    setFilters((prev) => {
      const current = prev.taskTags ?? [];
      const next = current.includes(value)
        ? current.filter((t) => t !== value)
        : [...current, value];
      return { ...prev, taskTags: next.length ? next : undefined };
    });
  };

  if (!cases.length) {
    return <CasesEmptyState />;
  }

  return (
    <div className="mt-12">
      {showFilters ? (
        <div className="space-y-6 rounded-sm border border-graphite/10 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label-caps">Фильтры</p>
            {hasActiveFilters ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setFilters({})}>
                Сбросить
              </Button>
            ) : null}
          </div>
          <FilterGroup label="Материал">
            {MATERIAL_OPTIONS.map((o) => (
              <FilterChip
                key={o.value}
                active={filters.material?.includes(o.value)}
                onClick={() => toggleMaterial(o.value)}
              >
                {o.label}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Площадь">
            {AREA_OPTIONS.map((o) => (
              <FilterChip
                key={o.value}
                active={filters.areaPreset === o.value}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    areaPreset: prev.areaPreset === o.value ? undefined : o.value,
                  }))
                }
              >
                {o.label}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Этажность">
            {[1, 2].map((f) => (
              <FilterChip
                key={f}
                active={filters.floors?.includes(f)}
                onClick={() => toggleFloors(f)}
              >
                {f} этаж{f === 2 ? "а" : ""}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Сценарий">
            {PURPOSE_OPTIONS.map((o) => (
              <FilterChip
                key={o.value}
                active={filters.purpose?.includes(o.value)}
                onClick={() => togglePurpose(o.value)}
              >
                {o.label}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Задача">
            {TASK_OPTIONS.map((o) => (
              <FilterChip
                key={o.value}
                active={filters.taskTags?.includes(o.value)}
                onClick={() => toggleTask(o.value)}
              >
                {o.label}
              </FilterChip>
            ))}
          </FilterGroup>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <CaseCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <CasesEmptyState filtered />
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-wood bg-wood/10 px-3 py-1.5 text-sm text-wood"
          : "rounded-full border border-graphite/15 px-3 py-1.5 text-sm text-muted transition hover:border-wood/40"
      }
    >
      {children}
    </button>
  );
}
