import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";
import { allCases, getCaseBySlug } from "@/data/cases";
import { isCaseIndexable } from "@/lib/cases";
import { CasePageTemplate } from "@/components/cases/case-page-template";

type Props = { params: Promise<{ caseSlug: string }> };

export async function generateStaticParams() {
  return allCases.map((c) => ({ caseSlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { caseSlug } = await params;
  const item = getCaseBySlug(caseSlug);
  if (!item) return {};
  return pageMetadata({
    title: item.seoTitle,
    description: item.seoDescription,
    path: `/cases/${caseSlug}`,
    image: item.gallery?.[0]?.src,
    noindex: !isCaseIndexable(item),
  });
}

export default async function CaseDetailPage({ params }: Props) {
  const { caseSlug } = await params;
  const item = getCaseBySlug(caseSlug);
  if (!item) notFound();

  const projects = await cms.getProjects();

  return <CasePageTemplate item={item} allCases={allCases} projects={projects} />;
}
