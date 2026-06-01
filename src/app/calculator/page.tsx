import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { FunnelHint } from "@/components/planner/funnel-hint";
import { PlannerPromo } from "@/components/planner/planner-promo";
import { Reveal } from "@/components/animations/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Калькулятор стоимости строительства дома",
  description:
    "Рассчитайте ориентировочную стоимость дома под ключ: площадь, материал, фундамент, отделка.",
  path: "/calculator",
});

export default function CalculatorPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow section-padding !pt-0">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Калькулятор" }]} />
        <Reveal>
          <p className="label-caps">Калькулятор</p>
          <h1 className="heading-section mt-2">Стоимость вашего дома</h1>
          <p className="mt-4 max-w-2xl text-muted">
            Ориентировочный расчёт за минуту. После уточнения проекта и участка подготовим смету с
            разбивкой по этапам — до подписания договора.
          </p>
        </Reveal>
        <FunnelHint page="calculator" />
        <div className="mt-8">
          <PlannerPromo />
        </div>
        <div className="mt-12">
          <CalculatorForm />
        </div>
      </div>
    </div>
  );
}
