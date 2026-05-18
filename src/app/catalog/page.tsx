import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Каталог проектов домов — NordHaus",
  description:
    "Проекты загородных домов под ключ: фильтры по площади, цене, материалу. Сравнение и избранное.",
  path: "/catalog",
});

export default async function CatalogPage() {
  const projects = await cms.getProjects();

  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
        <h1 className="heading-section">Каталог домов</h1>
        <p className="mt-4 max-w-2xl text-muted">
          {projects.length} архитектурных проектов с фиксированной сметой и сроками строительства.
        </p>
      </div>
      <Suspense fallback={<p className="px-5 text-muted">Загрузка каталога…</p>}>
        <CatalogClient projects={projects} />
      </Suspense>
    </div>
  );
}
