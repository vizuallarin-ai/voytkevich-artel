import { LeadForm } from "@/components/forms/lead-form";
import { cta } from "@/data/copy";

/** Всегда на странице калькулятора — якорь #calculator-lead для hero, FAQ и sticky */
export function CalculatorQuickLead() {
  return (
    <section id="calculator-lead" className="mt-10 scroll-mt-28">
      <LeadForm
        id="calculator-quick-lead-form"
        title="Получить расчёт без калькулятора"
        subtitle="Имя, телефон и вводные — специалист даст ориентир по стоимости в течение рабочего дня."
        submitLabel={cta.preliminaryEstimate}
        footnote="Можно пройти калькулятор выше — параметры попадут в заявку автоматически."
        leadConfig={{
          sourceType: "calculator",
          formId: "calculator-quick-lead-form",
          formName: "Калькулятор — быстрая заявка",
          requestType: "calculator-result",
          requestTitle: "Запрос расчёта с калькулятора",
          selectedCTA: cta.preliminaryEstimate,
          conversionGoal: "calculator_submit",
        }}
      />
    </section>
  );
}
