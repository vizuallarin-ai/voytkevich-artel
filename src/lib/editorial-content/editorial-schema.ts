import type { EditorialContentItem } from "@/types/editorial-content";
import type { EditorialAuthor } from "@/types/editorial-content";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo";
import { getEditorialRubricById } from "@/data/editorial-rubrics";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80";

export function buildEditorialSchema(
  item: EditorialContentItem,
  author?: EditorialAuthor,
): Record<string, unknown>[] {
  const rubric = getEditorialRubricById(item.rubricId);
  const authorName = author?.isFictional
    ? `${author.name} (${author.publicLabel})`
    : author?.name ?? "Редакция СтройСтрой";

  const schemas: Record<string, unknown>[] = [
    articleSchema({
      title: item.h1,
      description: item.seoDescription,
      image: DEFAULT_IMAGE,
      datePublished: item.createdAt,
      dateModified: item.updatedAt ?? item.createdAt,
      author: authorName,
      url: `${SITE_URL}${item.url}`,
    }),
    breadcrumbSchema([
      { name: "Главная", url: SITE_URL },
      { name: "Блог", url: `${SITE_URL}/blog` },
      { name: rubric?.title ?? "Редакция", url: `${SITE_URL}/blog` },
      { name: item.h1, url: `${SITE_URL}${item.url}` },
    ]),
  ];

  if (item.faq?.length) {
    schemas.push(faqSchema(item.faq));
  }

  return schemas;
}
