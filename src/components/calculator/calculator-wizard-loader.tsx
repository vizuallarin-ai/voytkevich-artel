"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalculatorWizard } from "@/components/calculator/calculator-wizard";
import { LeadForm } from "@/components/forms/lead-form";
import { Button } from "@/components/ui/button";
import { cta } from "@/data/copy";

function CalculatorLoadingFallback() {
  return (
    <div className="glass rounded-sm p-8">
      <div className="mx-auto max-w-md text-center">
        <div
          className="mx-auto h-10 w-10 animate-pulse rounded-full bg-sand"
          aria-hidden
        />
        <p className="mt-4 font-medium">Загрузка калькулятора стоимости…</p>
        <p className="mt-2 text-sm text-muted">
          Подбираем параметры расчёта. Обычно это занимает пару секунд.
        </p>
      </div>
    </div>
  );
}

function CalculatorLoadErrorFallback() {
  return (
    <div className="glass rounded-sm border border-dashed border-graphite/20 p-8 text-center">
      <p className="font-display text-xl">Калькулятор не загрузился?</p>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        Если экран пустой или расчёт не открывается — оставьте заявку на предварительный расчёт.
        Специалист уточнит площадь, материал, участок и комплектацию.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="#calculator-fallback-lead">{cta.preliminaryEstimate}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog">{cta.viewProjects}</Link>
        </Button>
      </div>
      <div id="calculator-fallback-lead" className="mx-auto mt-10 max-w-lg text-left">
        <LeadForm
          id="calculator-fallback-form"
          title={cta.preliminaryEstimate}
          subtitle="Опишите площадь, материал и участок — подготовим ориентир по стоимости."
          leadConfig={{
            sourceType: "calculator",
            formId: "calculator-fallback-form",
            formName: "Калькулятор — fallback заявка",
            requestType: "calculator-result",
            requestTitle: "Заявка при ошибке загрузки калькулятора",
            selectedCTA: cta.preliminaryEstimate,
            conversionGoal: "calculator_submit",
          }}
        />
      </div>
    </div>
  );
}

function CalculatorWizardKeyed() {
  const searchParams = useSearchParams();
  return <CalculatorWizard key={searchParams.toString()} />;
}

export function CalculatorWizardLoader() {
  return (
    <>
      <Suspense fallback={<CalculatorLoadingFallback />}>
        <CalculatorWizardKeyed />
      </Suspense>
      <noscript>
        <CalculatorLoadErrorFallback />
      </noscript>
    </>
  );
}
