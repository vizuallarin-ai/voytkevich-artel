import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CalculatorHero } from "@/components/calculator/calculator-hero";
import { CalculatorWizardLoader } from "@/components/calculator/calculator-wizard-loader";
import { CalculatorQuickLead } from "@/components/calculator/calculator-quick-lead";
import { CalculatorFaq } from "@/components/calculator/calculator-faq";
import { CalculatorSeoText } from "@/components/calculator/calculator-seo-text";
import { FunnelHint } from "@/components/planner/funnel-hint";
import { Reveal } from "@/components/animations/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Калькулятор стоимости строительства дома в Иркутске",
  description:
    "Рассчитайте предварительную стоимость строительства дома под ключ в Иркутске и Иркутской области. Площадь, материал, этажность, комплектация, фундамент и инженерия.",
  path: "/calculator",
  openGraphTitle: "Калькулятор стоимости строительства дома",
  openGraphDescription:
    "Предварительный расчёт дома под ключ по площади, материалу, этажности и комплектации.",
});

export default function CalculatorPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow section-padding !pt-0">
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Калькулятор" }]}
        />
        <Reveal>
          <CalculatorHero />
        </Reveal>
        <FunnelHint page="calculator" />
        <CalculatorQuickLead />
        <div className="mt-12">
          <CalculatorWizardLoader />
        </div>
        <CalculatorFaq />
        <CalculatorSeoText />
      </div>
    </div>
  );
}
