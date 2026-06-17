import type { ProgrammaticPageData } from "@/types/programmatic-page-template";
import { breadcrumbSchema, faqSchema, itemListSchema } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo";

export function buildProgrammaticSchema(pageData: ProgrammaticPageData): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [];

  const crumbs = [
    { name: "Главная", url: SITE_URL },
    { name: "Каталог", url: `${SITE_URL}/catalog` },
    { name: pageData.h1, url: `${SITE_URL}${pageData.url}` },
  ];
  schemas.push(breadcrumbSchema(crumbs));

  if (pageData.faq.length > 0) {
    schemas.push(faqSchema(pageData.faq));
  }

  if (pageData.projects.matched.length > 0) {
    schemas.push(
      itemListSchema(
        pageData.projects.matched.map((p) => ({
          name: p.name,
          url: `${SITE_URL}/catalog/${p.slug}`,
        })),
      ),
    );
  }

  return schemas;
}
