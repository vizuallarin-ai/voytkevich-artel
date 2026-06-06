import type {
  CaseCategory,
  CaseCategoryFilter,
  CaseItem,
  CaseListFilters,
  CaseStatus,
} from "@/types/case";
import type { BlogPost } from "@/types/blog";
import { getServicePageBySlug } from "@/data/service-pages";
import { allBlogPosts } from "@/data/blog-posts";
import { isBlogPostPublic } from "@/lib/blog";

const AREA_PRESETS: Record<NonNullable<CaseListFilters["areaPreset"]>, { min?: number; max?: number }> = {
  "do-100": { max: 100 },
  "100-150": { min: 100, max: 150 },
  "150-200": { min: 150, max: 200 },
  "200-plus": { min: 200 },
};

export function isCasePublic(item: CaseItem): boolean {
  return item.status === "published";
}

export function isCaseIndexable(item: CaseItem): boolean {
  return item.status === "published";
}

export function getPublishedCases(cases: CaseItem[]): CaseItem[] {
  return cases.filter(isCasePublic);
}

export function getFeaturedCases(cases: CaseItem[], limit = 3): CaseItem[] {
  return getPublishedCases(cases).slice(0, limit);
}

function normalizeMaterial(m?: string): string {
  return (m ?? "").toLowerCase();
}

function matchesCategoryFilter(item: CaseItem, filter: CaseCategoryFilter): boolean {
  if (filter.material?.length) {
    const m = normalizeMaterial(item.house.material);
    if (!filter.material.some((f) => m.includes(f.toLowerCase()))) return false;
  }
  if (filter.floors?.length && item.house.floors != null) {
    if (!filter.floors.includes(item.house.floors)) return false;
  }
  if (filter.areaMin != null && (item.house.area ?? 0) < filter.areaMin) return false;
  if (filter.areaMax != null && (item.house.area ?? Infinity) > filter.areaMax) return false;
  if (filter.purpose?.length) {
    const purposes = item.house.purpose ?? [];
    if (!filter.purpose.some((p) => purposes.includes(p))) return false;
  }
  if (filter.taskTags?.length) {
    const tags = item.taskTags ?? [];
    if (!filter.taskTags.some((t) => tags.includes(t))) return false;
  }
  if (filter.region) {
    const region = item.location?.region ?? "";
    if (!region.includes(filter.region)) return false;
  }
  return true;
}

export function filterCasesList(cases: CaseItem[], filters: CaseListFilters): CaseItem[] {
  let result = getPublishedCases(cases);

  if (filters.material?.length) {
    result = result.filter((c) =>
      filters.material!.some((m) => normalizeMaterial(c.house.material).includes(m.toLowerCase())),
    );
  }
  if (filters.floors?.length) {
    result = result.filter((c) => c.house.floors != null && filters.floors!.includes(c.house.floors!));
  }
  if (filters.areaPreset) {
    const preset = AREA_PRESETS[filters.areaPreset];
    if (preset.min != null) result = result.filter((c) => (c.house.area ?? 0) >= preset.min!);
    if (preset.max != null) result = result.filter((c) => (c.house.area ?? 0) <= preset.max!);
  }
  if (filters.purpose?.length) {
    result = result.filter((c) =>
      filters.purpose!.some((p) => c.house.purpose?.includes(p)),
    );
  }
  if (filters.taskTags?.length) {
    result = result.filter((c) =>
      filters.taskTags!.some((t) => c.taskTags?.includes(t)),
    );
  }

  return result;
}

export function getCasesForCategory(cases: CaseItem[], category: CaseCategory): CaseItem[] {
  return getPublishedCases(cases).filter((c) => matchesCategoryFilter(c, category.filter));
}

export function getRelatedCases(all: CaseItem[], item: CaseItem, limit = 4): CaseItem[] {
  const slugs = item.relatedCaseSlugs ?? [];
  const bySlug = slugs
    .map((s) => all.find((c) => c.slug === s && isCasePublic(c)))
    .filter((c): c is CaseItem => !!c);

  if (bySlug.length >= limit) return bySlug.slice(0, limit);

  const similar = getPublishedCases(all).filter((c) => {
    if (c.slug === item.slug) return false;
    if (bySlug.some((b) => b.slug === c.slug)) return false;
    const sameMaterial =
      item.house.material &&
      c.house.material &&
      normalizeMaterial(c.house.material) === normalizeMaterial(item.house.material);
    const sameFloors = item.house.floors != null && c.house.floors === item.house.floors;
    return sameMaterial || sameFloors;
  });

  return [...bySlug, ...similar].slice(0, limit);
}

export function getCasesForProject(cases: CaseItem[], projectSlug: string, limit = 3): CaseItem[] {
  return getPublishedCases(cases)
    .filter(
      (c) =>
        c.project?.projectSlug === projectSlug ||
        c.relatedProjectSlugs?.includes(projectSlug),
    )
    .slice(0, limit);
}

export function getCasesForService(cases: CaseItem[], serviceSlug: string, limit = 3): CaseItem[] {
  const page = getServicePageBySlug(serviceSlug);
  if (!page) return [];

  return getPublishedCases(cases)
    .filter((c) => {
      if (c.relatedServiceSlugs?.includes(serviceSlug)) return true;
      const mat = page.calculatorParams?.material?.toLowerCase();
      if (mat && c.house.material?.toLowerCase().includes(mat)) return true;
      const floors = page.calculatorParams?.floors;
      if (floors && c.house.floors === floors) return true;
      return false;
    })
    .slice(0, limit);
}

export function getRelatedBlogPostsForCase(item: CaseItem, limit = 4): BlogPost[] {
  const slugs = item.relatedBlogSlugs ?? [];
  return slugs
    .map((s) => allBlogPosts.find((p) => p.slug === s && isBlogPostPublic(p)))
    .filter((p): p is BlogPost => !!p)
    .slice(0, limit);
}

export function getCasesForBlogPost(cases: CaseItem[], post: BlogPost, limit = 3): CaseItem[] {
  const published = getPublishedCases(cases);
  if (!published.length) return [];

  const materialHints: Record<string, string[]> = {
    brus: ["брус", "клееный брус"],
    frame: ["каркас"],
    gazobeton: ["газобетон"],
    fundaments: [],
    plot: [],
    remote: [],
    budget: [],
  };

  const cluster = post.clusterId ?? "";
  const hints = materialHints[cluster] ?? [];

  if (hints.length) {
    return published
      .filter((c) =>
        hints.some((h) => normalizeMaterial(c.house.material).includes(h)),
      )
      .slice(0, limit);
  }

  if (post.categorySlug === "materialy") {
    return published.slice(0, limit);
  }

  return [];
}

export type CaseServiceLink = { href: string; label: string };

export function resolveCaseServiceLink(slug: string): CaseServiceLink {
  const page = getServicePageBySlug(slug);
  return { href: `/${slug}`, label: page?.title ?? slug };
}

export function buildCaseLeadSource(item: CaseItem): string {
  return `case:${item.slug}`;
}

export function buildCaseLeadComment(item: CaseItem, ctaId?: string): string {
  const lines = [
    `Кейс: ${item.title}`,
    `caseSlug: ${item.slug}`,
    `source: case-page`,
    `URL: /cases/${item.slug}`,
  ];
  if (item.house.area) lines.push(`houseArea: ${item.house.area}`);
  if (item.house.material) lines.push(`material: ${item.house.material}`);
  if (item.house.floors) lines.push(`floors: ${item.house.floors}`);
  if (item.location?.displayLabel) lines.push(`location: ${item.location.displayLabel}`);
  if (item.relatedProjectSlugs?.length) {
    lines.push(`relatedProjectSlugs: ${item.relatedProjectSlugs.join(", ")}`);
  }
  if (ctaId) lines.push(`selectedCTA: ${ctaId}`);
  return lines.join("\n");
}

export function caseStatusLabel(status: CaseStatus): string {
  switch (status) {
    case "published":
      return "Опубликован";
    case "draft":
      return "Черновик";
    case "needs-data":
      return "Требуются данные";
    case "noindex":
      return "Не для индексации";
    default:
      return status;
  }
}

export function formatCaseLocation(item: CaseItem): string | undefined {
  if (item.location?.displayLabel) return item.location.displayLabel;
  const parts = [
    item.location?.settlement,
    item.location?.district,
    item.location?.city,
    item.location?.region,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}
