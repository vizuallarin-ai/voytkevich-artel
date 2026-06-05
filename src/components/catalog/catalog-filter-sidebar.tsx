"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CatalogFilters, Material, ProjectPurpose } from "@/types";

const AREA_PRESETS = [
  { label: "до 100 м²", areaMax: 100 },
  { label: "100–150 м²", areaMin: 100, areaMax: 150 },
  { label: "150–200 м²", areaMin: 150, areaMax: 200 },
  { label: "200+ м²", areaMin: 200 },
] as const;

const BUDGET_PRESETS = [
  { label: "до 5 млн", priceMax: 5_000_000 },
  { label: "5–8 млн", priceMin: 5_000_000, priceMax: 8_000_000 },
  { label: "8–12 млн", priceMin: 8_000_000, priceMax: 12_000_000 },
  { label: "12+ млн", priceMin: 12_000_000 },
] as const;

const PURPOSES: { value: ProjectPurpose; label: string }[] = [
  { value: "семья", label: "Для семьи" },
  { value: "дача", label: "Для дачи" },
  { value: "постоянное", label: "Постоянное проживание" },
  { value: "загородная", label: "Загородная жизнь" },
];

type Props = {
  filters: CatalogFilters;
  onUpdate: (patch: Partial<CatalogFilters>) => void;
  availableMaterials?: Material[];
};

function presetActive(
  filters: CatalogFilters,
  preset: { areaMin?: number; areaMax?: number; priceMin?: number; priceMax?: number },
) {
  return (
    filters.areaMin === preset.areaMin &&
    filters.areaMax === preset.areaMax &&
    filters.priceMin === preset.priceMin &&
    filters.priceMax === preset.priceMax
  );
}

export function CatalogFilterSidebar({ filters, onUpdate, availableMaterials }: Props) {
  const materials =
    availableMaterials ?? (["каркас", "газобетон", "брус", "клееный брус"] as Material[]);

  return (
    <aside className="space-y-6" aria-label="Фильтры каталога">
      <div>
        <label className="text-sm font-medium">Поиск</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder="Название, материал..."
            defaultValue={filters.q}
            onChange={(e) => onUpdate({ q: e.target.value || undefined })}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Площадь</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AREA_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                onUpdate(
                  presetActive(filters, preset)
                    ? { areaMin: undefined, areaMax: undefined }
                    : {
                        areaMin: "areaMin" in preset ? preset.areaMin : undefined,
                        areaMax: "areaMax" in preset ? preset.areaMax : undefined,
                      },
                )
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                presetActive(filters, preset) && "border-graphite bg-graphite text-background",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Бюджет</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                onUpdate(
                  presetActive(filters, preset)
                    ? { priceMin: undefined, priceMax: undefined }
                    : {
                        priceMin: "priceMin" in preset ? preset.priceMin : undefined,
                        priceMax: "priceMax" in preset ? preset.priceMax : undefined,
                      },
                )
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                presetActive(filters, preset) && "border-graphite bg-graphite text-background",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Этажность</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {([1, 2] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                const cur = filters.floors ?? [];
                onUpdate({
                  floors: cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f],
                });
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                filters.floors?.includes(f) && "border-graphite bg-graphite text-background",
              )}
            >
              {f} эт.
            </button>
          ))}
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
                onUpdate({
                  material: cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m],
                });
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize",
                filters.material?.includes(m) && "border-graphite bg-graphite text-background",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Назначение</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PURPOSES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                const cur = filters.purpose ?? [];
                onUpdate({
                  purpose: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value],
                });
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                filters.purpose?.includes(value) && "border-graphite bg-graphite text-background",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Особенности</p>
        <div className="mt-2 space-y-2">
          {[
            { key: "terrace" as const, label: "Терраса" },
            { key: "garage" as const, label: "Гараж" },
            { key: "cabinet" as const, label: "Кабинет" },
            { key: "sauna" as const, label: "Баня / сауна" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!filters[key]}
                onChange={(e) => onUpdate({ [key]: e.target.checked || undefined })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
