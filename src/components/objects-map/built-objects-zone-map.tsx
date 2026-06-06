import Link from "next/link";
import { MapPin } from "lucide-react";
import type { BuiltObjectArea } from "@/types/built-object";
import { cn } from "@/lib/utils";

type Props = {
  areas: BuiltObjectArea[];
  counts: Record<string, number>;
  activeAreaSlug?: string;
  onAreaClick?: (slug: string) => void;
  showCounts?: boolean;
};

export function BuiltObjectsZoneMap({
  areas,
  counts,
  activeAreaSlug,
  onAreaClick,
  showCounts = true,
}: Props) {
  return (
    <section aria-labelledby="objects-zone-map" className="mt-12">
      <h2 id="objects-zone-map" className="heading-section text-2xl">
        География объектов
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Схема районов и зон — без точных адресов частных домов. Точки на карте появятся после
        публикации объектов с разрешения заказчиков.
      </p>
      <div className="relative mt-8 overflow-hidden rounded-sm border border-graphite/10 bg-gradient-to-br from-sand/30 via-background to-wood/5 p-6 md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, #8B6914 1px, transparent 1px), radial-gradient(circle at 70% 60%, #8B6914 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => {
            const count = counts[area.slug] ?? 0;
            const active = activeAreaSlug === area.slug;
            const inner = (
              <>
                <MapPin className="h-4 w-4 shrink-0 text-wood" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{area.title}</p>
                  <p className="mt-0.5 text-xs text-muted line-clamp-2">{area.description}</p>
                  {showCounts && count > 0 ? (
                    <p className="mt-2 text-xs font-medium text-wood">
                      {count} {count === 1 ? "объект" : count < 5 ? "объекта" : "объектов"}
                    </p>
                  ) : showCounts ? (
                    <p className="mt-2 text-xs text-muted">Объекты появятся после публикации</p>
                  ) : null}
                </div>
              </>
            );

            const className = cn(
              "flex items-start gap-3 rounded-sm border p-4 text-left transition",
              active
                ? "border-wood bg-wood/10"
                : "border-graphite/10 bg-background/80 hover:border-wood/40 hover:bg-wood/5",
            );

            if (onAreaClick) {
              return (
                <button
                  key={area.slug}
                  type="button"
                  className={className}
                  onClick={() => onAreaClick(area.slug)}
                >
                  {inner}
                </button>
              );
            }

            return (
              <Link key={area.slug} href={`/objects-map/${area.slug}`} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
