"use client";

import { X } from "lucide-react";
import type { CatalogFilters } from "@/types";
import { clearFilterKey, getActiveFilterLabels } from "@/lib/filters";

type Props = {
  filters: CatalogFilters;
  onUpdate: (next: CatalogFilters) => void;
  onReset: () => void;
};

export function CatalogActiveFilters({ filters, onUpdate, onReset }: Props) {
  const labels = getActiveFilterLabels(filters);
  if (!labels.length) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Активные фильтры">
      {labels.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onUpdate(clearFilterKey(filters, key))}
          className="inline-flex items-center gap-1 rounded-full border border-graphite/20 bg-muted-bg/60 px-3 py-1 text-xs transition hover:border-graphite"
        >
          {label}
          <X className="h-3 w-3" aria-hidden />
          <span className="sr-only">Сбросить фильтр {label}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        Сбросить все
      </button>
    </div>
  );
}
