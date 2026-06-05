import type { BreakdownItem } from "@/lib/calculator";
import { formatPriceRange } from "@/lib/calculator";

export function CalculatorBreakdown({ items }: { items: BreakdownItem[] }) {
  if (!items.length) return null;

  return (
    <section aria-labelledby="calc-breakdown-title">
      <h2 id="calc-breakdown-title" className="font-display text-2xl">
        Из чего складывается стоимость
      </h2>
      <p className="mt-2 text-sm text-muted">
        Диапазоны по этапам — ориентир. Точный состав фиксируется в смете после уточнения
        вводных.
      </p>
      <ul className="mt-6 space-y-4">
        {items.map((item) => {
          const midPercent = Math.round((item.percentMin + item.percentMax) / 2);
          return (
            <li
              key={item.id}
              className="rounded-sm border border-graphite/10 p-4 md:p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                </div>
                <p className="shrink-0 font-display text-lg sm:text-right">
                  {formatPriceRange(item.amountMin, item.amountMax)}
                </p>
              </div>
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full bg-graphite/70 transition-all duration-300"
                    style={{ width: `${Math.min(midPercent, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  ~{item.percentMin}–{item.percentMax}% от общей суммы
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
