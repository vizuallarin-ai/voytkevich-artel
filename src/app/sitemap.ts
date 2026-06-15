import type { MetadataRoute } from "next";
import { buildFallbackSitemapEntries, buildSitemapEntries } from "@/lib/seo/build-sitemap";

export const dynamic = "force-static";
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemapEntries();
  } catch (error) {
    console.error("[sitemap] generation failed, using fallback entries", error);
    return buildFallbackSitemapEntries();
  }
}
