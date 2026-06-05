import type { CatalogFilters } from "@/types";

export type BlogPostStatus = "draft" | "published" | "needs-update";

export type BlogIntent =
  | "informational"
  | "commercial"
  | "comparison"
  | "local"
  | "transactional";

export type BlogFunnelStage = "cold" | "warm" | "hot";

export type BlogPriority = "high" | "medium" | "low";

export type BlogPost = {
  slug: string;
  title: string;
  h1: string;
  excerpt: string;
  content: string;
  coverImage: string;
  /** @deprecated display label — use categorySlug */
  category: string;
  categorySlug: string;
  clusterId: string;
  intent: BlogIntent;
  funnelStage: BlogFunnelStage;
  priority: BlogPriority;
  status: BlogPostStatus;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  author: string;
  shortAnswer?: string;
  badge?: string;
  seo: { title: string; description: string };
  targetQueries?: string[];
  faqs?: { question: string; answer: string }[];
  relatedServicePages?: string[];
  relatedProjectFilters?: Partial<CatalogFilters>;
  relatedPosts?: string[];
  leadMagnetId?: string;
  heroCTA?: { label: string; href: string };
  noindex?: boolean;
  needsRegularUpdate?: boolean;
};

export type BlogCategory = {
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  relatedClusters: string[];
  primaryCTA: string;
  primaryCTAHref: string;
  relatedServicePages: string[];
};
