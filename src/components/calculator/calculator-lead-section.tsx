"use client";

import { useMemo } from "react";
import type {
  CalculatorEstimateInput,
  CalculatorEstimateResult,
} from "@/lib/calculator";
import { buildCalculatorLeadComment } from "@/lib/calculator";
import { LeadForm } from "@/components/forms/lead-form";

export function CalculatorLeadSection({
  input,
  result,
}: {
  input: CalculatorEstimateInput;
  result: CalculatorEstimateResult;
}) {
  const comment = useMemo(() => {
    const url =
      typeof window !== "undefined" ? window.location.href : undefined;
    return buildCalculatorLeadComment(input, result, url);
  }, [input, result]);

  const source = input.projectSlug
    ? `calculator-project-${input.projectSlug}`
    : "calculator";

  return (
    <section id="calculator-lead" className="mt-16 scroll-mt-28">
      <LeadForm
        id="calculator-lead-form"
        title="Получить подробный расчёт по моим параметрам"
        subtitle="Оставьте контакты — передадим специалисту выбранные параметры, уточним участок и подготовим более точный ориентир по стоимости."
        source={source}
        prefilledArea={String(input.area)}
        prefilledComment={comment}
        submitLabel="Получить подробный расчёт"
        footnote="Сначала уточним вводные. Без навязчивых звонков и обещаний цены без анализа участка."
      />
    </section>
  );
}
