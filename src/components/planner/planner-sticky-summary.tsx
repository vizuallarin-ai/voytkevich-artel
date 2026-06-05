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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-graphite/10 bg-background/95 p-4 backdrop-blur-md lg:hidden"
      role="region"
      aria-label="Сводка планировки"
    >
      <div className="container-narrow flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{summary.statusLabel}</p>
          <p className="truncate font-display text-lg">
            {formatNumber(summary.totalArea)} м²
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0" variant="outline">
          <Link
            href={calcUrl}
            onClick={() => trackPlannerEvent("planner_calculator_clicked")}
          >
            Рассчитать
          </Link>
        </Button>
        <Button
          size="lg"
          className="shrink-0"
          onClick={() =>
            document.getElementById("planner-lead")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Отправить
        </Button>
      </div>
    </div>
  );
}
