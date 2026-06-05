import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FunnelHint } from "@/components/planner/funnel-hint";
import { PlannerHero } from "@/components/planner/planner-hero";
import { PlannerWizard } from "@/components/planner/planner-wizard";
import { PlannerFaq } from "@/components/planner/planner-faq";
import { PlannerSeoText } from "@/components/planner/planner-seo-text";
import { Reveal } from "@/components/animations/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Планировщик дома — подобрать планировку и проект в Иркутске",
  description:
    "Соберите предварительную планировку дома: сценарий жизни, площадь, комнаты, этажность и вводные по участку. Подбор проекта и расчёт строительства дома в Иркутске.",
  path: "/planirovka",
  openGraphTitle: "Планировщик дома",
  openGraphDescription:
    "Соберите состав помещений, площадь и сценарий будущего дома перед расчётом стоимости и подбором проекта.",
});

export default function PlanirovkaPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow section-padding !pt-0">
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Планировщик дома" }]}
        />
        <Reveal>
          <PlannerHero />
        </Reveal>
        <FunnelHint page="planirovka" />
        <div className="mt-12">
          <PlannerWizard />
        </div>
        <PlannerFaq />
        <PlannerSeoText />
      </div>
    </div>
  );
}
