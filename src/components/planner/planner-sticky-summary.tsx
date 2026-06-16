"use client";

import Link from "next/link";
import type { AreaSummary } from "@/lib/planner-area";
import { buildPlannerCalculatorUrl, type PlannerDraft } from "@/lib/planner";
import { trackPlannerEvent } from "@/lib/planner-analytics";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

export function PlannerStickySummary({
  draft,
  summary,
  visible,
}: {
  draft: PlannerDraft;
  summary: AreaSummary;
  visible: boolean;
}) {
  if (!visible) return null;

  const calcUrl = buildPlannerCalculatorUrl(draft);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-graphite/10 bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
      role="region"
      aria-label="Сводка планировки"
    >
      <div className="container-narrow flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{summary.statusLabel}</p>
          <p className="truncate font-display text-xl sm:text-lg">
            {formatNumber(summary.totalArea)} м²
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
        <Button asChild size="lg" className="w-full sm:w-auto" variant="outline">
          <Link
            href={calcUrl}
            onClick={() => trackPlannerEvent("planner_calculator_clicked")}
          >
            Рассчитать
          </Link>
        </Button>
        <Button
          size="lg"
          className="w-full sm:w-auto sm:shrink-0"
          onClick={() =>
            document.getElementById("planner-lead")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Отправить
        </Button>
        </div>
      </div>
    </div>
  );
}
