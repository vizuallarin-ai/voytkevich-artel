import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePageTemplate } from "@/components/service/service-page-template";
import { JsonLd, breadcrumbSchema, faqSchema, serviceSchema } from "@/components/seo/json-ld";
import { getServicePageBySlug, servicePageSlugs } from "@/data/service-pages";
import { cms } from "@/lib/cms/local";
import { filterProjects } from "@/lib/filters";
import { getServicePagePath } from "@/lib/service-pages";
import { pageMetadata, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return servicePageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getServicePageBySlug(slug);
  if (!page) return {};

  const meta = pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: getServicePagePath(slug),
    openGraphTitle: page.seoTitle,
    openGraphDescription: page.seoDescription,
  });

  if (page.noindex) {
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

export default async function ServicePageRoute({ params }: Props) {
  const { slug } = await params;
  const page = getServicePageBySlug(slug);
  if (!page) notFound();

  const allProjects = await cms.getProjects();
  const projects = page.relatedProjectFilters
    ? filterProjects(allProjects, page.relatedProjectFilters)
    : [];

  const pageUrl = `${SITE_URL}${getServicePagePath(slug)}`;

  return (
    <div className="pt-28 pb-20">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Главная", url: SITE_URL },
            { name: page.title, url: pageUrl },
          ]),
          serviceSchema({
            name: page.h1,
            description: page.seoDescription,
            url: pageUrl,
            serviceType: page.serviceType,
          }),
          faqSchema(page.faqs),
        ]}
      />

      <div className="container-narrow section-padding !pt-0">
        <ServicePageTemplate page={page} projects={projects} />
      </div>
    </div>
  );
}
