import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { CatalogPickerBlock } from "@/components/catalog/catalog-picker-block";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, breadcrumbSchema, itemListSchema } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import {
  categoryHref,
  getCategoryBySlug,
  getRelatedCategories,
  seoCategorySlugs,
} from "@/data/catalog-categories";
import { catalogEmptyState } from "@/data/catalog-copy";
import { cta } from "@/data/copy";
import { cms } from "@/lib/cms/local";
import { filterProjects } from "@/lib/filters";
import { pageMetadata, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return seoCategorySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat || cat.queryHref) return {};

  const projects = await cms.getProjects();
  const filtered = filterProjects(projects, cat.filters);
  const meta = pageMetadata({
    title: cat.title,
    description: cat.description,
    path: `/catalog/kategoriya/${slug}`,
  });

  if (filtered.length === 0) {
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

export default async function CatalogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category || category.queryHref) notFound();

  const projects = await cms.getProjects();
  const filtered = filterProjects(projects, category.filters);
  const related = getRelatedCategories(slug);

  return (
    <div className="pt-28 pb-32">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Главная", url: SITE_URL },
            { name: "Каталог", url: `${SITE_URL}/catalog` },
            { name: category.h1, url: `${SITE_URL}/catalog/kategoriya/${slug}` },
          ]),
          ...(filtered.length > 0
            ? [
                itemListSchema(
                  filtered.map((p) => ({
                    name: p.name,
                    url: `${SITE_URL}/catalog/${p.slug}`,
                  })),
                ),
              ]
            : []),
        ]}
      />

      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: category.h1 },
          ]}
        />
        <h1 className="heading-section">{category.h1}</h1>
        <p className="mt-4 max-w-3xl text-muted">{category.intro}</p>
        <p className="mt-2 text-sm text-muted">
          {filtered.length}{" "}
          {filtered.length === 1 ? "проект" : filtered.length < 5 ? "проекта" : "проектов"} в
          подборке
        </p>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-sm border border-dashed border-graphite/20 p-8 text-center">
            <h2 className="font-display text-xl">{catalogEmptyState.title}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              В этой категории пока нет проектов. Посмотрите общий каталог или оставьте заявку на
              индивидуальный подбор.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/catalog">Весь каталог</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/catalog#catalog-picker">{catalogEmptyState.cta}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Button asChild className="mt-6" variant="outline">
            <Link href="/catalog#catalog-picker">{category.ctaText}</Link>
          </Button>
        )}

        {related.length > 0 && (
          <nav className="mt-10" aria-label="Связанные категории">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Похожие категории
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {related.map((c) => (
                <Link
                  key={c.slug}
                  href={categoryHref(c)}
                  className="rounded-full border border-graphite/15 px-3 py-1 text-xs hover:border-graphite"
                >
                  {c.h1}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <nav className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
          <Link href="/catalog" className="underline underline-offset-4 hover:text-foreground">
            Весь каталог
          </Link>
          <Link href="/calculator" className="underline underline-offset-4 hover:text-foreground">
            {cta.calculateCost}
          </Link>
        </nav>
      </div>

      {filtered.length > 0 && (
        <div className="mt-12">
          <Suspense fallback={null}>
            <CatalogClient
              projects={projects}
              initialFilters={category.filters}
              basePath={`/catalog/kategoriya/${slug}`}
              leadSource={`catalog-${slug}`}
              categorySlug={slug}
            />
          </Suspense>
        </div>
      )}

      <div className="container-narrow mt-16 px-5 md:px-10 lg:px-16">
        <CatalogPickerBlock />
      </div>
    </div>
  );
}
