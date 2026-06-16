"use client";

import Link from "next/link";
import type {
  CalculatorEstimateInput,
  CalculatorEstimateResult,
} from "@/lib/calculator";
import {
  CALCULATOR_PURPOSE_LABELS,
  formatMonthsRange,
  formatPriceRange,
} from "@/lib/calculator";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";
import { pageCopy } from "@/data/positioning";

export function CalculatorResult({
  input,
  result,
  onScrollToLead,
}: {
  input: CalculatorEstimateInput;
  result: CalculatorEstimateResult;
  onScrollToLead?: () => void;
}) {
  return (
    <div className="glass rounded-sm p-6 md:p-8" id="calculator-result">
      <p className="label-caps">Предварительный расчёт</p>
      <p className="mt-2 font-display text-3xl md:text-4xl">
        {formatPriceRange(result.totalMin, result.totalMax)}
      </p>
      <p className="mt-2 text-muted">
        {formatPriceRange(result.pricePerM2Min, result.pricePerM2Max)}/м² ·{" "}
        {formatMonthsRange(result.durationMinMonths, result.durationMaxMonths)}
      </p>
      <p className="mt-4 text-sm text-muted">{pageCopy.calculator.disclaimer}</p>

      {result.warnings.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-sm bg-sand/60 p-4 text-sm text-muted">
          {result.warnings.map((w) => (
            <li key={w}>— {w}</li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-graphite/10 pt-6">
        <p className="text-sm font-medium">Выбранные параметры</p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          <li>
            {input.area} м² · {input.floors} эт. · {input.material}
          </li>
          <li>Комплектация: {input.packageType}</li>
          <li>Назначение: {CALCULATOR_PURPOSE_LABELS[input.purpose]}</li>
          {input.projectTitle && (
            <li>
              Проект: {input.projectTitle}
            </li>
          )}
          {input.additionalOptions.length > 0 && (
            <li>Доп. опции: {input.additionalOptions.join(", ")}</li>
          )}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            onScrollToLead?.();
            document.getElementById("calculator-lead-detailed")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Получить подробный расчёт
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="#calculator-lead-detailed">{cta.sendToSpecialist}</Link>
        </Button>
        <Button asChild size="lg" variant="ghost" className="w-full">
          <Link href="/catalog">Смотреть подходящие проекты</Link>
        </Button>
      </div>
    </div>
  );
}
