"use client";

import type { CalculatorEstimateResult } from "@/lib/calculator";
import { formatPriceRange } from "@/lib/calculator";
import { Button } from "@/components/ui/button";

export function CalculatorStickyCta({
  result,
  visible,
}: {
  result: CalculatorEstimateResult | null;
  visible: boolean;
}) {
  if (!visible || !result) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-graphite/10 bg-background/95 p-4 backdrop-blur-md lg:hidden"
      role="region"
      aria-label="Быстрый расчёт"
    >
      <div className="container-narrow flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">Предварительно</p>
          <p className="truncate font-display text-lg">
            {formatPriceRange(result.totalMin, result.totalMax)}
          </p>
        </div>
        <Button
          size="lg"
          className="shrink-0"
          onClick={() =>
            document.getElementById("calculator-lead")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Получить расчёт
        </Button>
      </div>
    </div>
  );
}
