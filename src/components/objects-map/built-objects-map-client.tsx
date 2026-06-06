"use client";

import { useMemo, useState } from "react";
import type { BuiltObject, BuiltObjectListFilters } from "@/types/built-object";
import type { BuiltObjectArea } from "@/types/built-object";
import {
  countObjectsByArea,
  filterBuiltObjectsList,
  trackObjectsMapEvent,
} from "@/lib/built-objects";
import { BuiltObjectCard } from "./built-object-card";
import { BuiltObjectsZoneMap } from "./built-objects-zone-map";
import { ObjectsMapEmptyState } from "./objects-map-empty-state";
import { Button } from "@/components/ui/button";

const MATERIAL_OPTIONS = [
  { value: "брус", label: "Брус" },
  { value: "каркас", label: "Каркас" },
  { value: "газобетон", label: "Газобетон" },
];

const AREA_OPTIONS: { value: BuiltObjectListFilters["areaPreset"]; label: string }[] = [
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

const TYPE_OPTIONS: { value: BuiltObject["objectType"]; label: string }[] = [
  { value: "built-house", label: "Построен" },
  { value: "in-progress", label: "В процессе" },
];

type Props = {
  objects: BuiltObject[];
  areas: BuiltObjectArea[];
  initialAreaSlug?: string;
};

export function BuiltObjectsMapClient({ objects, areas, initialAreaSlug }: Props) {
  const [filters, setFilters] = useState<BuiltObjectListFilters>(
    initialAreaSlug ? { areaSlug: initialAreaSlug } : {},
  );
  const [view, setView] = useState<"list" | "zones">("list");

  const filtered = useMemo(() => filterBuiltObjectsList(objects, filters), [objects, filters]);
  const areaCounts = useMemo(() => countObjectsByArea(objects), [objects]);

  const hasActiveFilters = Boolean(
    filters.material?.length ||
      filters.areaPreset ||
      filters.floors?.length ||
      filters.purpose?.length ||
      filters.objectType?.length ||
      filters.areaSlug ||
      filters.hasCase,
  );

  const applyFilter = (next: BuiltObjectListFilters) => {
    setFilters(next);
    trackObjectsMapEvent("objects_map_filter_used", {
      areaSlug: next.areaSlug,
      material: next.material?.join(","),
      areaRange: next.areaPreset,
      floors: next.floors?.[0],
    });
  };

  if (!objects.length) {
    return (
      <>
        <BuiltObjectsZoneMap areas={areas} counts={areaCounts} showCounts={false} />
        <ObjectsMapEmptyState />
      </>
    );
  }

  return (
    <div className="mt-12 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-sm border border-graphite/15 p-1">
          <ViewToggle active={view === "list"} onClick={() => setView("list")}>
            Список
          </ViewToggle>
          <ViewToggle active={view === "zones"} onClick={() => setView("zones")}>
            Зоны
          </ViewToggle>
        </div>
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => applyFilter({})}>
            Сбросить фильтры
          </Button>
        ) : null}
      </div>

      <FiltersPanel
        filters={filters}
        onChange={applyFilter}
        areas={areas}
        hasActiveFilters={hasActiveFilters}
      />

      {view === "zones" ? (
        <BuiltObjectsZoneMap
          areas={areas}
          counts={areaCounts}
          activeAreaSlug={filters.areaSlug}
          onAreaClick={(slug) =>
            applyFilter({
              ...filters,
              areaSlug: filters.areaSlug === slug ? undefined : slug,
            })
          }
        />
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <BuiltObjectCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <ObjectsMapEmptyState filtered />
      )}
    </div>
  );
}

function FiltersPanel({
  filters,
  onChange,
  areas,
  hasActiveFilters,
}: {
  filters: BuiltObjectListFilters;
  onChange: (f: BuiltObjectListFilters) => void;
  areas: BuiltObjectArea[];
  hasActiveFilters: boolean;
}) {
  const toggleMaterial = (value: string) => {
    const current = filters.material ?? [];
    const next = current.includes(value)
      ? current.filter((m) => m !== value)
      : [...current, value];
    onChange({ ...filters, material: next.length ? next : undefined });
  };

  const toggleFloors = (value: number) => {
    const current = filters.floors ?? [];
    const next = current.includes(value)
      ? current.filter((f) => f !== value)
      : [...current, value];
    onChange({ ...filters, floors: next.length ? next : undefined });
  };

  return (
    <div className="space-y-6 rounded-sm border border-graphite/10 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label-caps">Фильтры</p>
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange({})}>
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
              onChange({
                ...filters,
                areaPreset: filters.areaPreset === o.value ? undefined : o.value,
              })
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
            onClick={() => {
              const current = filters.purpose ?? [];
              const next = current.includes(o.value)
                ? current.filter((p) => p !== o.value)
                : [...current, o.value];
              onChange({ ...filters, purpose: next.length ? next : undefined });
            }}
          >
            {o.label}
          </FilterChip>
        ))}
      </FilterGroup>
      <FilterGroup label="Статус">
        {TYPE_OPTIONS.map((o) => (
          <FilterChip
            key={o.value}
            active={filters.objectType?.includes(o.value)}
            onClick={() => {
              const current = filters.objectType ?? [];
              const next = current.includes(o.value)
                ? current.filter((t) => t !== o.value)
                : [...current, o.value];
              onChange({ ...filters, objectType: next.length ? next : undefined });
            }}
          >
            {o.label}
          </FilterChip>
        ))}
        <FilterChip
          active={filters.hasCase}
          onClick={() => onChange({ ...filters, hasCase: filters.hasCase ? undefined : true })}
        >
          Есть кейс
        </FilterChip>
      </FilterGroup>
      <FilterGroup label="Район / зона">
        {areas.map((a) => (
          <FilterChip
            key={a.slug}
            active={filters.areaSlug === a.slug}
            onClick={() =>
              onChange({
                ...filters,
                areaSlug: filters.areaSlug === a.slug ? undefined : a.slug,
              })
            }
          >
            {a.title}
          </FilterChip>
        ))}
      </FilterGroup>
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

function ViewToggle({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-sm bg-wood px-4 py-2 text-sm text-background"
          : "rounded-sm px-4 py-2 text-sm text-muted hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}
