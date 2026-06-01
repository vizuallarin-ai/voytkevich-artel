import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { ProjectCard } from "@/components/catalog/project-card";
import { FunnelHint } from "@/components/planner/funnel-hint";
import { PlannerPromo } from "@/components/planner/planner-promo";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Button } from "@/components/ui/button";
import { catalogAdaptation, cta } from "@/data/copy";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Каталог проектов домов под ключ — Иркутск",
  description:
    "Готовые проекты загородных домов: площадь, материал, срок и ориентировочная цена. Адаптация под участок и смета по договору.",
  path: "/catalog",
});

function CatalogGridFallback({
  projects,
}: {
  projects: Awaited<ReturnType<typeof cms.getProjects>>;
}) {
  const preview = projects.slice(0, 12);
  return (
    <div className="container-narrow grid gap-8 px-5 pb-16 md:grid-cols-2 lg:grid-cols-3 md:px-10 lg:px-16">
      {preview.map((p) => (
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
        <h1 className="heading-section">Каталог домов</h1>
        <p className="mt-4 max-w-2xl text-muted">
          {projects.length} проектов с ориентировочной ценой, сроком и материалом. Смету по выбранному
          проекту подготовим после консультации.
        </p>

        <section className="mt-10 rounded-sm border border-graphite/10 bg-muted-bg/60 p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl">{catalogAdaptation.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted">{catalogAdaptation.description}</p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/#lead">{cta.buildConsultation}</Link>
          </Button>
        </section>

        <div className="mt-8">
          <FunnelHint page="catalog" />
          <div className="mt-4">
            <PlannerPromo variant="compact" />
          </div>
        </div>
      </div>

      <noscript>
        <div className="container-narrow grid gap-8 px-5 pb-16 md:grid-cols-2 lg:grid-cols-3 md:px-10 lg:px-16">
          {projects.slice(0, 12).map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </noscript>

      <Suspense fallback={<CatalogGridFallback projects={projects} />}>
        <CatalogClient projects={projects} />
      </Suspense>
    </div>
  );
}
