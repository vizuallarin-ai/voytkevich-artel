import type { TaxonomyCombination } from "@/types/project-taxonomy";
import { getTaxonomyCombinations } from "@/lib/taxonomy/taxonomy-combination-builder";
import { getObjectTypeById } from "@/data/project-object-types";
import { getMaterialById } from "@/data/project-materials";
import { getLocationUrlPrefix, getProjectUrlPrefix } from "@/lib/taxonomy/taxonomy-slug-builder";
import { blogPosts } from "@/data/blog-posts";

function sameObject(c: TaxonomyCombination, base: TaxonomyCombination) {
  return c.objectTypeId === base.objectTypeId;
}

export function getRelatedCategoryPages(
  combination: TaxonomyCombination,
  limit = 6,
): { title: string; url: string; relation: string }[] {
  const all = getTaxonomyCombinations();
  return all
    .filter(
      (c) =>
        c.id !== combination.id &&
        sameObject(c, combination) &&
        c.pageType === "project-category",
    )
    .slice(0, limit)
    .map((c) => ({ title: c.h1, url: c.url, relation: "Категория" }));
}

export function getRelatedMaterialPages(
  combination: TaxonomyCombination,
  limit = 5,
): { title: string; url: string; relation: string }[] {
  return getTaxonomyCombinations()
    .filter(
      (c) =>
        c.id !== combination.id &&
        sameObject(c, combination) &&
        c.pageType === "project-material-page",
    )
    .slice(0, limit)
    .map((c) => ({
      title: c.h1,
      url: c.url,
      relation: "Материал",
    }));
}

export function getRelatedSizePages(
  combination: TaxonomyCombination,
  limit = 5,
): { title: string; url: string; relation: string }[] {
  return getTaxonomyCombinations()
    .filter(
      (c) =>
        c.id !== combination.id &&
        sameObject(c, combination) &&
        c.pageType === "project-size-page" &&
        !c.materialId &&
        !c.featureId,
    )
    .slice(0, limit)
    .map((c) => ({ title: c.h1, url: c.url, relation: "Размер" }));
}

export function getRelatedLocationPages(
  combination: TaxonomyCombination,
  limit = 4,
): { title: string; url: string; relation: string }[] {
  const ot = combination.objectTypeId
    ? getObjectTypeById(combination.objectTypeId)
    : undefined;
  if (!ot) return [];
  const prefix = getLocationUrlPrefix(ot);
  return getTaxonomyCombinations()
    .filter((c) => c.url.startsWith(prefix) && c.id !== combination.id)
    .slice(0, limit)
    .map((c) => ({ title: c.h1, url: c.url, relation: "Локация" }));
}

export function getRelatedArticles(
  combination: TaxonomyCombination,
  limit = 3,
): { title: string; url: string; relation: string }[] {
  const keywords: string[] = [];
  if (combination.materialId) keywords.push("материал", "смет");
  if (combination.sizeId) keywords.push("площад", "проект");
  if (combination.regionId) keywords.push("участок");
  if (keywords.length === 0) keywords.push("стоимость", "проект");

  return blogPosts
    .filter((p) => keywords.some((k) => p.title.toLowerCase().includes(k)))
    .slice(0, limit)
    .map((p) => ({
      title: p.title,
      url: `/blog/${p.slug}`,
      relation: "Статья",
    }));
}

export function buildRelatedPages(combination: TaxonomyCombination) {
  const pages = [
    ...getRelatedMaterialPages(combination, 3),
    ...getRelatedSizePages(combination, 3),
    ...getRelatedLocationPages(combination, 2),
  ].slice(0, 8);

  const articles = getRelatedArticles(combination, 3);

  const projects = getTaxonomyCombinations()
    .filter(
      (c) =>
        c.id !== combination.id &&
        sameObject(c, combination) &&
        c.level <= 2 &&
        c.pageType !== "project-location-page",
    )
    .slice(0, 4)
    .map((c) => ({ title: c.h1, url: c.url, relation: "Подборка" }));

  return { pages, articles, projects };
}

export function buildFilterLinks(combination: TaxonomyCombination): { label: string; href: string }[] {
  const ot = combination.objectTypeId
    ? getObjectTypeById(combination.objectTypeId)
    : undefined;
  if (!ot) return [];

  const prefix = getProjectUrlPrefix(ot);
  const links: { label: string; href: string }[] = [
    { label: "Калькулятор", href: "/calculator" },
    { label: "Каталог", href: "/catalog" },
  ];

  const materials = getTaxonomyCombinations()
    .filter((c) => c.objectTypeId === ot.id && c.pageType === "project-material-page")
    .slice(0, 3);
  for (const m of materials) {
    links.push({ label: m.h1.split("—")[0]?.trim() ?? m.slug, href: m.url });
  }

  const sizes = getTaxonomyCombinations()
    .filter(
      (c) =>
        c.objectTypeId === ot.id &&
        c.pageType === "project-size-page" &&
        !c.materialId,
    )
    .slice(0, 3);
  for (const s of sizes) {
    links.push({ label: s.h1.split("—")[0]?.trim() ?? s.slug, href: s.url });
  }

  if (combination.materialId) {
    const m = getMaterialById(combination.materialId);
    if (m) links.unshift({ label: `Все ${m.title}`, href: `${prefix}/${m.slug}` });
  }

  return links.slice(0, 8);
}

export function getRelatedLeadMagnets(combination: TaxonomyCombination): string | undefined {
  if (combination.regionId) return "land-checklist";
  if (combination.materialId) return "material-comparison";
  if (combination.sizeId) return "estimate-example";
  return "project-selection-checklist";
}
