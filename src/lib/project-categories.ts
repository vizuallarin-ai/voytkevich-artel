import { catalogCategories, categoryHref } from "@/data/catalog-categories";
import { filterProjects } from "@/lib/filters";
import type { Project } from "@/types";

export function getProjectCategories(project: Project) {
  return catalogCategories
    .filter((cat) => !cat.queryHref)
    .filter((cat) => filterProjects([project], cat.filters).length > 0)
    .slice(0, 4)
    .map((cat) => ({
      slug: cat.slug,
      label: cat.h1,
      href: categoryHref(cat),
    }));
}
