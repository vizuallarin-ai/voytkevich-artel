import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FunnelHint } from "@/components/planner/funnel-hint";
import { PlannerPhoneCta } from "@/components/planner/planner-phone-cta";
import { PlannerWizard } from "@/components/planner/planner-wizard";
import { Reveal } from "@/components/animations/reveal";
import { pageMeta } from "@/data/copy";
import { pageCopy } from "@/data/positioning";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: pageMeta.planner.title,
  description: pageMeta.planner.description,
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
          <h1 className="heading-section mt-2">{pageCopy.planner.h1}</h1>
          <p className="mt-4 max-w-3xl text-muted">{pageCopy.planner.intro}</p>
        </Reveal>
        <div className="mt-12">
          <PlannerWizard />
        </div>
      </div>
    </div>
  );
}
