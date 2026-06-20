import type { SitemapSegment } from "@/lib/seo-indexation/sitemap-registry";

function extractPath(urlOrPath: string): string {
  if (urlOrPath.startsWith("http")) {
    try {
      return new URL(urlOrPath).pathname;
    } catch {
      return urlOrPath;
    }
  }
  return urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
}

export function mapUrlToSitemapSegment(urlOrPath: string, pageType?: string): SitemapSegment {
  const path = extractPath(urlOrPath);

  if (path === "/" || path === "/catalog" || path === "/blog" || path === "/cases" || path === "/objects-map") {
    return "static";
  }

  if (
    path === "/about" ||
    path === "/process" ||
    path === "/calculator" ||
    path === "/planirovka" ||
    path === "/faq" ||
    path === "/privacy"
  ) {
    return "static";
  }

  if (pageType === "project-material-page" || path.includes("/material-") || path.includes("/iz-")) {
    return "materials";
  }

  if (pageType === "project-size-page" || /\/\d+x\d+/.test(path)) {
    return "sizes";
  }

  if (pageType === "comparison-page" || path.includes("/sravnenie") || path.includes("/comparison")) {
    return "comparisons";
  }

  if (pageType === "project-location-page" || path.startsWith("/objects-map/")) {
    return "locations";
  }

  if (path.startsWith("/catalog/kategoriya/") || path.startsWith("/blog/category/") || path.startsWith("/cases/category/")) {
    return "categories";
  }

  if (path.startsWith("/catalog/")) {
    return "projects";
  }

  if (path.startsWith("/blog/")) {
    return "editorial";
  }

  if (path.startsWith("/cases/")) {
    return "editorial";
  }

  if (path.startsWith("/proekty-") || pageType?.startsWith("project-")) {
    if (pageType === "project-material-page") return "materials";
    if (pageType === "project-size-page") return "sizes";
    if (pageType === "comparison-page") return "comparisons";
    if (pageType === "project-location-page") return "locations";
    return "programmatic";
  }

  if (pageType === "article" || path.startsWith("/knowledge/") || path.startsWith("/wiki/")) {
    return "knowledge";
  }

  if (pageType === "service" || path.match(/^\/(stroitelstvo|bani|doma|fundament|otdelka|proektirovanie)/)) {
    return "services";
  }

  if (pageType === "technical-article" || path.startsWith("/tech/")) {
    return "technical";
  }

  const serviceSlugs = [
    "stroitelstvo-domov",
    "stroitelstvo-ban",
    "fundament",
    "otdelka",
    "proektirovanie",
  ];
  const slug = path.replace(/^\//, "");
  if (serviceSlugs.some((s) => slug.startsWith(s))) {
    return "services";
  }

  return "static";
}

export function groupEntriesBySegment<T extends { url: string; segment?: SitemapSegment; pageType?: string }>(
  entries: T[],
): Map<SitemapSegment, T[]> {
  const groups = new Map<SitemapSegment, T[]>();

  for (const entry of entries) {
    const segment = entry.segment ?? mapUrlToSitemapSegment(entry.url, entry.pageType);
    const group = groups.get(segment) ?? [];
    group.push({ ...entry, segment });
    groups.set(segment, group);
  }

  return groups;
}
