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
import { LeadMagnetsBlock } from "@/components/lead-magnets/lead-magnets-block";

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
      <LeadMagnetsBlock
        pageType="planner"
        magnetIds={["layout-review", "land-checklist"]}
        maxItems={2}
        mode="cards"
        prefilledArea={String(draft.targetArea)}
        context={{
          plannerSummary: {
            scenario: draft.scenario,
            targetArea: draft.targetArea,
            totalArea: summary.totalArea,
            floors: draft.input.floors,
            hasLand: draft.hasLand,
            landLocation: draft.landLocation,
            rooms: roomAreas,
            customized,
            calculatorTotal,
            recommendations: recommendations.map((r) => r.text),
            relatedSlugs,
          },
        }}
      />
      <div className="mt-12">
      <LeadForm
        id="planner-lead-form"
        title="Отправить планировку специалисту"
        subtitle="Оставьте контакты — передадим выбранный сценарий, состав помещений, площадь и вводные по участку. Специалист подскажет, насколько планировка реалистична и какой проект можно взять за основу."
        prefilledArea={String(draft.targetArea)}
        prefilledComment={comment}
        submitLabel="Отправить планировку"
        footnote="Это не финальный проект, а вводные для консультации. Точная планировка создаётся после анализа участка, бюджета и технических требований."
        leadConfig={{
          sourceType: "planner",
          formId: "planner-lead-form",
          formName: "Планировщик дома",
          requestType: "planner-review",
          requestTitle: "Отправить планировку специалисту",
          selectedCTA: "Отправить планировку",
          conversionGoal: "planner_submit",
          context: {
            planner: {
              scenario: draft.scenario ?? undefined,
              targetArea: draft.targetArea,
              totalArea: summary.totalArea,
              livingArea: summary.livingArea,
              floors: draft.input.floors,
              residents: draft.residents,
              hasLand: draft.hasLand,
              landLocation: draft.landLocation || undefined,
              priority: draft.priority,
              rooms: roomAreas.map((r) => ({
                type: r.id,
                name: r.name,
                area: r.area,
              })),
              recommendations: recommendations.map((r) => r.text),
            },
          },
        }}
        successMessage="Планировка отправлена. Мы получили сценарий, комнаты и площадь."
      />
      </div>
    </section>
  );
}
