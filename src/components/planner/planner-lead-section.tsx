"use client";

import { useMemo } from "react";
import type { PlannerRecommendation } from "@/lib/planner-area";
import {
  plannerSummaryForLead,
  type PlannerDraft,
} from "@/lib/planner";
import type { AreaSummary } from "@/lib/planner-area";
import type { PlannerRoomArea } from "@/types";
import { LeadForm } from "@/components/forms/lead-form";

export function PlannerLeadSection({
  draft,
  summary,
  recommendations,
  relatedSlugs,
  roomAreas,
  customized,
  calculatorTotal,
}: {
  draft: PlannerDraft;
  summary: AreaSummary;
  recommendations: PlannerRecommendation[];
  relatedSlugs: string[];
  roomAreas: PlannerRoomArea[];
  customized: boolean;
  calculatorTotal?: number;
}) {
  const comment = useMemo(() => {
    const url = typeof window !== "undefined" ? window.location.href : undefined;
    return plannerSummaryForLead(
      draft,
      { summary, recommendations, relatedSlugs, roomAreas, customized, calculatorTotal },
      url,
    );
  }, [draft, summary, recommendations, relatedSlugs, roomAreas, customized, calculatorTotal]);

  return (
    <section id="planner-lead" className="scroll-mt-28 border-t border-graphite/10 pt-16">
      <LeadForm
        id="planner-lead-form"
        title="Отправить планировку специалисту"
        subtitle="Оставьте контакты — передадим выбранный сценарий, состав помещений, площадь и вводные по участку. Специалист подскажет, насколько планировка реалистична и какой проект можно взять за основу."
        source="planner"
        prefilledArea={String(draft.targetArea)}
        prefilledComment={comment}
        submitLabel="Отправить планировку"
        footnote="Это не финальный проект, а вводные для консультации. Точная планировка создаётся после анализа участка, бюджета и технических требований."
      />
    </section>
  );
}
