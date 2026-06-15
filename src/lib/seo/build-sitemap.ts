import type { MetadataRoute } from "next";
import { catalogCategories, seoCategorySlugs } from "@/data/catalog-categories";
import { servicePageSlugs } from "@/data/service-pages";
import { blogCategories } from "@/data/blog-categories";
import { cms } from "@/lib/cms/local";
import { getPublishedPosts } from "@/lib/blog";
import { filterProjects } from "@/lib/filters";
import { allCases, publishedCases } from "@/data/cases";
import { caseCategories } from "@/data/case-categories";
import { getCasesForCategory, isCaseIndexable } from "@/lib/cases";
import { allBuiltObjects } from "@/data/built-objects";
import { builtObjectAreas } from "@/data/built-object-areas";
import { getBuiltObjectsForArea } from "@/lib/built-objects";
import { SITE_URL } from "@/lib/seo";

function safeLastModified(value?: string): Date {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function entry(
  path: string,
  options: Omit<MetadataRoute.Sitemap[number], "url">,
): MetadataRoute.Sitemap[number] {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return {
    url: `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`,
    ...options,
  };
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const projects = await cms.getProjects();
  const posts = getPublishedPosts(await cms.getAllBlogPosts());

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/catalog",
    "/planirovka",
    "/about",
    "/process",
    "/calculator",
    "/blog",
    "/cases",
    "/objects-map",
    "/faq",
    "/privacy",
  ].map((path) =>
    entry(path || "/", {
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) =>
    entry(`/catalog/${p.slug}`, {
      lastModified: safeLastModified(p.createdAt),
      changeFrequency: "monthly",
      priority: 0.9,
    }),
  );

  const categoryRoutes: MetadataRoute.Sitemap = seoCategorySlugs
    .map((slug) => catalogCategories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .filter((c) => filterProjects(projects, c.filters).length > 0)
    .map((c) =>
      entry(`/catalog/kategoriya/${c.slug}`, {
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.85,
      }),
    );

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) =>
    entry(`/blog/${p.slug}`, {
      lastModified: safeLastModified(p.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const serviceRoutes: MetadataRoute.Sitemap = servicePageSlugs.map((slug) =>
    entry(`/${slug}`, {
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    }),
  );

  const blogCategoryRoutes: MetadataRoute.Sitemap = blogCategories.map((c) =>
    entry(`/blog/category/${c.slug}`, {
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }),
  );

  const caseRoutes: MetadataRoute.Sitemap = publishedCases.filter(isCaseIndexable).map((c) =>
    entry(`/cases/${c.slug}`, {
      lastModified: safeLastModified(c.timeline?.finishDate ?? c.timeline?.startDate),
      changeFrequency: "monthly",
      priority: 0.72,
    }),
  );

  const caseCategoryRoutes: MetadataRoute.Sitemap = caseCategories
    .filter((c) => getCasesForCategory(allCases, c).length > 0)
    .map((c) =>
      entry(`/cases/category/${c.slug}`, {
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );

  const objectsMapAreaRoutes: MetadataRoute.Sitemap = builtObjectAreas
    .filter((area) => getBuiltObjectsForArea(allBuiltObjects, area).length > 0)
    .filter((area) => !area.noindexIfEmpty || getBuiltObjectsForArea(allBuiltObjects, area).length > 0)
    .map((area) =>
      entry(`/objects-map/${area.slug}`, {
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.68,
      }),
    );

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...categoryRoutes,
    ...projectRoutes,
    ...blogCategoryRoutes,
    ...blogRoutes,
    ...caseRoutes,
    ...caseCategoryRoutes,
    ...objectsMapAreaRoutes,
  ];
}

export function buildFallbackSitemapEntries(): MetadataRoute.Sitemap {
  return [
    entry("/", { lastModified: new Date(), changeFrequency: "weekly", priority: 1 }),
    entry("/catalog", { lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 }),
    entry("/blog", { lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 }),
  ];
}
