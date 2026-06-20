export type SitemapSegment =
  | "static"
  | "services"
  | "projects"
  | "categories"
  | "programmatic"
  | "technical"
  | "editorial"
  | "locations"
  | "materials"
  | "sizes"
  | "comparisons"
  | "knowledge";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapEntry = {
  url: string;
  path: string;
  segment: SitemapSegment;
  lastModified?: string | Date;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
  pageId?: string;
  contentItemId?: string;
};

export const SITEMAP_SEGMENT_FILENAMES: Record<SitemapSegment, string> = {
  static: "sitemap-static.xml",
  services: "sitemap-services.xml",
  projects: "sitemap-projects.xml",
  categories: "sitemap-categories.xml",
  programmatic: "sitemap-programmatic.xml",
  technical: "sitemap-technical.xml",
  editorial: "sitemap-editorial.xml",
  locations: "sitemap-locations.xml",
  materials: "sitemap-materials.xml",
  sizes: "sitemap-sizes.xml",
  comparisons: "sitemap-comparisons.xml",
  knowledge: "sitemap-knowledge.xml",
};

export const ALL_SITEMAP_SEGMENTS: SitemapSegment[] = [
  "static",
  "services",
  "projects",
  "categories",
  "programmatic",
  "technical",
  "editorial",
  "locations",
  "materials",
  "sizes",
  "comparisons",
  "knowledge",
];

export const SITEMAP_MAX_URLS_PER_FILE = 50000;
