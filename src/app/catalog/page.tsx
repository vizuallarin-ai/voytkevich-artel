import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { CatalogHero } from "@/components/catalog/catalog-hero";
import { CatalogQuickCategories } from "@/components/catalog/catalog-quick-categories";
import { CatalogPickerBlock } from "@/components/catalog/catalog-picker-block";
import { LeadMagnetsBlock } from "@/components/lead-magnets/lead-magnets-block";
import { CatalogSeoSection } from "@/components/catalog/catalog-seo-section";
import { CatalogFaq } from "@/components/catalog/catalog-faq";
import { ProjectCard } from "@/components/catalog/project-card";
import { FunnelHint } from "@/components/planner/funnel-hint";
import { PlannerPromo } from "@/components/planner/planner-promo";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { catalogPageMeta } from "@/data/catalog-copy";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: catalogPageMeta.title,
  description: catalogPageMeta.description,
  path: "/catalog",
});

function CatalogGridFallback({
  projects,
}: {
  projects: Awaited<ReturnType<typeof cms.getProjects>>;
}) {
  return (
    <div className="container-narrow grid gap-8 px-5 pb-16 md:grid-cols-2 lg:grid-cols-3 md:px-10 lg:px-16">
      {projects.slice(0, 12).map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

export default async function CatalogPage() {
  const projects = await cms.getProjects();

  return (
    <div className="pt-28 pb-32">
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
        <CatalogHero projectCount={projects.length} />

        <div className="mt-12">
          <CatalogQuickCategories />
        </div>
        <div className="mt-8">
          <FunnelHint page="catalog" />
          <div className="mt-4">
            <PlannerPromo variant="compact" />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Suspense fallback={<CatalogGridFallback projects={projects} />}>
          <CatalogClient projects={projects} leadSource="catalog" />
        </Suspense>
      </div>

      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <LeadMagnetsBlock
          pageType="catalog"
          magnetIds={["budget-project-selection"]}
          maxItems={1}
          mode="cards"
        />
        <CatalogPickerBlock />
        <CatalogSeoSection />
        <CatalogFaq />
      </div>
    </div>
  );
}
