import type { BlogPost } from "@/types/blog";
import { getCategoryTitle } from "@/data/blog-categories";
import { getServicePageBySlug } from "@/data/service-pages";
import { catalogCategories } from "@/data/catalog-categories";

const STATIC_LINK_LABELS: Record<string, string> = {
  "/calculator": "Калькулятор стоимости",
  "/catalog": "Каталог проектов",
  "/planirovka": "Планировщик дома",
  "/process": "Процесс строительства",
  "/about": "О компании",
  "/smeta-na-stroitelstvo-doma": "Смета на строительство",
  "/doma-pod-klyuch-do-10-mln": "Дома до 10 млн ₽",
  "/stroitelstvo-domov-pod-klyuch-irkutsk": "Строительство под ключ в Иркутске",
  "/stroitelstvo-domov-v-irkutskoy-oblasti": "Строительство в области",
  "/stroitelstvo-doma-v-ipoteku": "Строительство в ипотеку",
  "/odnoetazhnye-doma-pod-klyuch": "Одноэтажные дома",
  "/dvuhetazhnye-doma-pod-klyuch": "Двухэтажные дома",
  "/stroitelstvo-domov-iz-brusa": "Дома из бруса",
  "/karkasnye-doma-pod-klyuch": "Каркасные дома",
  "/stroitelstvo-domov-iz-gazobetona": "Дома из газобетона",
  "/proektirovanie-domov": "Проектирование домов",
};

export type BlogServiceLink = { href: string; label: string };

export function resolveBlogServiceLink(href: string): BlogServiceLink {
  if (STATIC_LINK_LABELS[href]) return { href, label: STATIC_LINK_LABELS[href] };
  const catalogMatch = href.match(/^\/catalog\/kategoriya\/(.+)$/);
  if (catalogMatch) {
    const cat = catalogCategories.find((c) => c.slug === catalogMatch[1]);
    if (cat) return { href, label: cat.title };
  }
  const slug = href.replace(/^\//, "");
  const page = getServicePageBySlug(slug);
  if (page) return { href, label: page.title };
  return { href, label: href };
}

export function getRelatedServiceLinks(hrefs: string[] | undefined): BlogServiceLink[] {
  return (hrefs ?? []).map(resolveBlogServiceLink);
}

export type TocItem = { id: string; title: string };

export function extractTocFromMarkdown(content: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^##\s+(.+)$/);
    if (!m) continue;
    const title = m[1].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-");
    items.push({ id, title });
  }
  return items;
}

export function isBlogPostPublic(post: BlogPost): boolean {
  return post.status === "published" && !post.noindex;
}

export function getPublishedPosts(posts: BlogPost[]): BlogPost[] {
  return posts
    .filter(isBlogPostPublic)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostsByCategory(posts: BlogPost[], categorySlug: string): BlogPost[] {
  return getPublishedPosts(posts).filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedPosts(posts: BlogPost[], limit = 3): BlogPost[] {
  return getPublishedPosts(posts)
    .filter((p) => p.priority === "high")
    .slice(0, limit);
}

export function getRelatedPosts(all: BlogPost[], post: BlogPost, limit = 4): BlogPost[] {
  const slugs = post.relatedPosts ?? [];
  const bySlug = slugs
    .map((s) => all.find((p) => p.slug === s && isBlogPostPublic(p)))
    .filter((p): p is BlogPost => !!p);

  if (bySlug.length >= limit) return bySlug.slice(0, limit);

  const sameCategory = getPublishedPosts(all).filter(
    (p) => p.slug !== post.slug && p.categorySlug === post.categorySlug && !bySlug.some((b) => b.slug === p.slug),
  );

  return [...bySlug, ...sameCategory].slice(0, limit);
}

export function buildBlogLeadComment(post: BlogPost, opts?: { leadMagnetId?: string; ctaId?: string }): string {
  const lines = [
    `Блог: ${post.title}`,
    `postSlug: ${post.slug}`,
    `categorySlug: ${post.categorySlug}`,
    `clusterId: ${post.clusterId}`,
    `URL: /blog/${post.slug}`,
  ];
  if (opts?.leadMagnetId) lines.push(`leadMagnetId: ${opts.leadMagnetId}`);
  if (opts?.ctaId) lines.push(`ctaId: ${opts.ctaId}`);
  return lines.join("\n");
}

export function buildBlogLeadSource(post: BlogPost): string {
  return `blog:${post.slug}`;
}

/** Sync legacy category display name */
export function enrichBlogPost(post: BlogPost): BlogPost {
  return {
    ...post,
    category: post.category || getCategoryTitle(post.categorySlug),
    h1: post.h1 || post.title,
  };
}

export function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.round(words / 180));
}
