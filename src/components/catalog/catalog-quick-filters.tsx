"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { catalogCategories } from "@/data/catalog-categories";
import { cn } from "@/lib/utils";

export function CatalogQuickFilters() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <div className="flex flex-wrap gap-2" aria-label="Быстрые категории">
      <Link
        href="/catalog"
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs transition hover:border-graphite",
          !activeCategory && "border-graphite bg-graphite text-background",
        )}
      >
        Все проекты
      </Link>
      {catalogCategories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/catalog/kategoriya/${cat.slug}`}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition hover:border-graphite",
            activeCategory === cat.slug && "border-graphite bg-graphite text-background",
          )}
        >
          {cat.h1}
        </Link>
      ))}
    </div>
  );
}
