import type { BuiltObjectsStats } from "@/lib/built-objects";

export function BuiltObjectsStatsBlock({ stats }: { stats: BuiltObjectsStats | null }) {
  return (
    <section aria-labelledby="objects-map-stats" className="mt-16">
      <h2 id="objects-map-stats" className="heading-section text-2xl">
        Что можно увидеть на карте
      </h2>
      {!stats ? (
        <p className="mt-4 max-w-xl text-sm text-muted">
          Статистика появится после публикации реальных объектов с разрешения заказчиков.
        </p>
      ) : (
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatItem label="Опубликованных объектов" value={String(stats.total)} />
          {stats.materials.length ? (
            <StatItem label="Материалы" value={stats.materials.join(", ")} />
          ) : null}
          {stats.areaRange.min != null && stats.areaRange.max != null ? (
            <StatItem
              label="Диапазон площадей"
              value={`${stats.areaRange.min}–${stats.areaRange.max} м²`}
            />
          ) : null}
          {stats.floors.length ? (
            <StatItem
              label="Этажность"
              value={stats.floors.map((f) => `${f} эт.`).join(", ")}
            />
          ) : null}
          {stats.areas.length ? (
            <StatItem label="Зоны на карте" value={`${stats.areas.length} районов`} />
          ) : null}
          {stats.withCases > 0 ? (
            <StatItem label="С опубликованными кейсами" value={String(stats.withCases)} />
          ) : null}
        </dl>
      )}
    </section>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-graphite/10 p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-display text-lg">{value}</dd>
    </div>
  );
}
