"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalculatorWizard } from "@/components/calculator/calculator-wizard";

function CalculatorWizardKeyed() {
  const searchParams = useSearchParams();
  return <CalculatorWizard key={searchParams.toString()} />;
}

export function CalculatorWizardLoader() {
  return (
    <Suspense fallback={<div className="glass rounded-sm p-8 text-center text-muted">Загрузка калькулятора…</div>}>
      <CalculatorWizardKeyed />
    </Suspense>
  );
}
