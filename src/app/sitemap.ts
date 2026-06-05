import type { MetadataRoute } from "next";
import { catalogCategories, seoCategorySlugs } from "@/data/catalog-categories";
import { cms } from "@/lib/cms/local";
import { filterProjects } from "@/lib/filters";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await cms.getProjects();
  const posts = await cms.getBlogPosts();

  const staticRoutes = [
    "",
    "/catalog",
    "/planirovka",
    "/about",
    "/process",
    "/calculator",
    "/blog",
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

  return [...staticRoutes, ...categoryRoutes, ...projectRoutes, ...blogRoutes];
}
