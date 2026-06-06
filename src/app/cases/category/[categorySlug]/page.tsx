import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { allCases } from "@/data/cases";
import { caseCategories, getCaseCategoryBySlug } from "@/data/case-categories";
import { getCasesForCategory } from "@/lib/cases";
import { CasesListClient } from "@/components/cases/cases-list-client";
import { CasesEmptyState } from "@/components/cases/cases-empty-state";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateStaticParams() {
  return caseCategories.map((c) => ({ categorySlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCaseCategoryBySlug(categorySlug);
  if (!category) return {};
  const count = getCasesForCategory(allCases, category).length;
  return pageMetadata({
    title: category.seoTitle,
    description: category.seoDescription,
    path: `/cases/category/${categorySlug}`,
    noindex: category.noindexIfEmpty && count === 0,
  });
}

export default async function CaseCategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const category = getCaseCategoryBySlug(categorySlug);
  if (!category) notFound();

  const cases = getCasesForCategory(allCases, category);

  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Кейсы", href: "/cases" },
            { label: category.title },
          ]}
        />

        <h1 className="heading-section mt-4">{category.title}</h1>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">{category.description}</p>

        {cases.length > 0 ? (
          <CasesListClient cases={cases} showFilters={false} />
        ) : (
          <>
            <CasesEmptyState />
            <Button asChild variant="outline" className="mt-6">
              <Link href="/cases">Все кейсы</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
