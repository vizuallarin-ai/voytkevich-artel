import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FunnelHint } from "@/components/planner/funnel-hint";
import { PlannerPhoneCta } from "@/components/planner/planner-phone-cta";
import { PlannerWizard } from "@/components/planner/planner-wizard";
import { Reveal } from "@/components/animations/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Подбор планировки дома по параметрам",
  description:
    "Соберите ориентировочную планировку дома: площадь, спальни, этажи, гараж. Смета и похожий проект из каталога за минуту.",
  path: "/planirovka",
});

export default function PlanirovkaPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow section-padding !pt-0">
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Подбор планировки" }]}
        />
        <FunnelHint page="planirovka" />
        <PlannerPhoneCta />
        <Reveal>
          <p className="label-caps">Дополнительно</p>
          <h1 className="heading-section mt-2">Схема планировки за минуту</h1>
          <p className="mt-4 max-w-3xl text-muted">
            Опциональный шаг после калькулятора: задайте параметры, подвиньте комнаты и посмотрите
            похожий проект из каталога. Это эскиз для разговора с менеджером, не проект для
            стройки — финальную планировку сделает проектировщик артели.
          </p>
        </Reveal>
        <div className="mt-12">
          <PlannerWizard />
        </div>
      </div>
    </div>
  );
}
