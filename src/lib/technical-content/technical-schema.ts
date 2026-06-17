import type { TechnicalArticle, TechnicalAuthor } from "@/types/technical-content";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo";
import { getTechnicalClusterById } from "@/data/technical-content-clusters";

const DEFAULT_TECH_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80";

export function buildTechnicalSchema(
  article: TechnicalArticle,
  author?: TechnicalAuthor,
): Record<string, unknown>[] {
  const cluster = getTechnicalClusterById(article.clusterId);
  const schemas: Record<string, unknown>[] = [
    articleSchema({
      title: article.h1,
      description: article.seoDescription,
      image: DEFAULT_TECH_IMAGE,
      datePublished: article.createdAt,
      dateModified: article.updatedAt ?? article.createdAt,
      author: author?.name ?? "Редакция СтройСтрой",
      url: `${SITE_URL}${article.url}`,
    }),
    breadcrumbSchema([
      { name: "Главная", url: SITE_URL },
      { name: "Блог", url: `${SITE_URL}/blog` },
      { name: cluster?.title ?? "Технические материалы", url: `${SITE_URL}/blog` },
      { name: article.h1, url: `${SITE_URL}${article.url}` },
    ]),
  ];

  if (article.faq.length > 0) {
    schemas.push(faqSchema(article.faq));
  }

  return schemas;
}
