import type { CMSContentItem } from "@/types/content-cms";

export function validateContentItem(item: CMSContentItem): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!item.title?.trim()) errors.push("Отсутствует title");
  if (!item.slug?.trim()) errors.push("Отсутствует slug");
  if (!item.url?.trim()) errors.push("Отсутствует URL");

  if (!item.seoTitle) warnings.push("Отсутствует seoTitle");
  if (!item.seoDescription) warnings.push("Отсутствует seoDescription");

  if (item.kind === "programmatic-page" || item.kind === "technical-article") {
    if (!item.seo.targetKeyword) warnings.push("Нет target keyword");
  }

  if (item.quality.requiresFictionNotice && !item.ethics?.fictionNoticePresent) {
    errors.push("Требуется fiction notice");
  }

  if (item.quality.requiresSource && item.status !== "needs-source") {
    const hasSource = (item.factCheck?.sourceIds?.length ?? 0) > 0;
    if (!hasSource) errors.push("Требуется источник");
  }

  return { errors, warnings };
}
