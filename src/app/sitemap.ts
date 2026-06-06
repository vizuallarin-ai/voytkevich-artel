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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await cms.getProjects();
  const posts = getPublishedPosts(await cms.getAllBlogPosts());

  const staticRoutes = [
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
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${SITE_URL}/catalog/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const categoryRoutes = seoCategorySlugs
    .map((slug) => catalogCategories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .filter((c) => filterProjects(projects, c.filters).length > 0)
    .map((c) => ({
      url: `${SITE_URL}/catalog/kategoriya/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  const blogRoutes = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const serviceRoutes = servicePageSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.88,
  }));

  const blogCategoryRoutes = blogCategories.map((c) => ({
    url: `${SITE_URL}/blog/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const caseRoutes = publishedCases.filter(isCaseIndexable).map((c) => ({
    url: `${SITE_URL}/cases/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  const caseCategoryRoutes = caseCategories
    .filter((c) => getCasesForCategory(allCases, c).length > 0)
    .map((c) => ({
      url: `${SITE_URL}/cases/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const objectsMapAreaRoutes = builtObjectAreas
    .filter((area) => {
      if (!area.noindexIfEmpty) return true;
      return getBuiltObjectsForArea(allBuiltObjects, area).length > 0;
    })
    .filter((area) => getBuiltObjectsForArea(allBuiltObjects, area).length > 0)
    .map((area) => ({
      url: `${SITE_URL}/objects-map/${area.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.68,
    }));

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
