"use client";

import { useMemo } from "react";
import type {
  CalculatorEstimateInput,
  CalculatorEstimateResult,
} from "@/lib/calculator";
import { buildCalculatorLeadComment } from "@/lib/calculator";
import { LeadForm } from "@/components/forms/lead-form";
import { cta } from "@/data/copy";

function buildCalculatorContext(
  input: CalculatorEstimateInput,
  result: CalculatorEstimateResult,
) {
  return {
    calculator: {
      area: input.area,
      floors: input.floors,
      material: input.material,
      packageType: input.packageType,
      foundation: input.foundation,
      finish: input.packageType,
      totalMin: result.totalMin,
      totalMax: result.totalMax,
      total: Math.round((result.totalMin + result.totalMax) / 2),
      pricePerM2Min: result.pricePerM2Min,
      pricePerM2Max: result.pricePerM2Max,
      durationMinMonths: result.durationMinMonths,
      durationMaxMonths: result.durationMaxMonths,
      hasLand: input.hasLand,
      landLocation: input.landLocation || undefined,
      projectSlug: input.projectSlug,
      projectTitle: input.projectTitle,
    },
  };
}

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

  return (
    <section id="calculator-lead-detailed" className="mt-16 scroll-mt-28">
      <div className="mb-8 rounded-sm border border-wood/30 bg-wood/5 p-6 md:p-8">
        <p className="font-display text-xl md:text-2xl">Ваш предварительный расчёт готов</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Чтобы специалист проверил участок, фундамент, комплектацию и возможные скрытые расходы —
          отправьте расчёт на разбор. Это не финальная смета: мы уточним вводные и подскажем
          реалистичный следующий шаг.
        </p>
      </div>
      <LeadForm
        id="calculator-lead-form"
        title="Отправить расчёт специалисту"
        subtitle="Передадим выбранные параметры, диапазон стоимости и срок — уточним участок и комплектацию."
        prefilledArea={String(input.area)}
        prefilledComment={comment}
        submitLabel={cta.sendToSpecialist}
        footnote="Сначала уточним вводные. Без навязчивых звонков и обещаний цены без анализа участка."
        leadConfig={{
          sourceType: "calculator",
          formId: "calculator-lead-form",
          formName: "Калькулятор — отправка расчёта",
          requestType: "calculator-result",
          requestTitle: "Расчёт калькулятора",
          selectedCTA: cta.sendToSpecialist,
          conversionGoal: "calculator_submit",
          context: buildCalculatorContext(input, result),
        }}
      />
    </section>
  );
}
