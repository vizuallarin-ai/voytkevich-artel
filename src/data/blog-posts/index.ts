import type { BlogPost } from "@/types/blog";
import { enrichBlogPost, estimateReadingTime } from "@/lib/blog";
import { legacyNoindexPosts, legacyUpgradedPosts } from "./legacy";
import { stage10Articles } from "./articles";

function finalize(post: BlogPost): BlogPost {
  const enriched = enrichBlogPost({
    ...post,
    readTime: post.readTime || estimateReadingTime(post.content),
    updatedAt: post.updatedAt ?? post.publishedAt,
  });
  return enriched;
}

/** Все материалы блога (published, draft, noindex) */
export const allBlogPosts: BlogPost[] = [
  ...stage10Articles,
  ...legacyUpgradedPosts,
  ...legacyNoindexPosts,
].map(finalize);

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return allBlogPosts.find((p) => p.slug === slug);
}

/** @deprecated use allBlogPosts */
export const blogPosts = allBlogPosts;
