import type { AnalyticsEventCategory, AnalyticsEventName } from "@/types/analytics";

export type TypedPageView = {
  name: AnalyticsEventName;
  category: AnalyticsEventCategory;
  pageSlug?: string;
  context?: {
    projectSlug?: string;
    blogPostSlug?: string;
    blogCategorySlug?: string;
    caseSlug?: string;
    serviceSlug?: string;
  };
};

const STATIC_ROOT_PAGES = new Set([
  "about",
  "process",
  "faq",
  "privacy",
  "calculator",
  "planirovka",
  "catalog",
  "blog",
  "cases",
  "objects-map",
  "dashboard",
]);

/** Dedicated view events beyond generic page_viewed (funnel / tool-performance). */
export function getTypedPageView(pathname: string): TypedPageView | null {
  if (pathname === "/catalog") {
    return { name: "catalog_viewed", category: "catalog" };
  }

  if (pathname === "/blog") {
    return { name: "blog_viewed", category: "blog" };
  }

  const blogCategory = pathname.match(/^\/blog\/category\/([^/]+)$/);
  if (blogCategory) {
    return {
      name: "blog_category_viewed",
      category: "blog",
      pageSlug: blogCategory[1],
      context: { blogCategorySlug: blogCategory[1] },
    };
  }

  const blogPost = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogPost) {
    return {
      name: "blog_post_viewed",
      category: "blog",
      pageSlug: blogPost[1],
      context: { blogPostSlug: blogPost[1] },
    };
  }

  const casePage = pathname.match(/^\/cases\/([^/]+)$/);
  if (casePage) {
    return {
      name: "case_viewed",
      category: "case",
      pageSlug: casePage[1],
      context: { caseSlug: casePage[1] },
    };
  }

  const servicePage = pathname.match(/^\/([^/]+)$/);
  if (servicePage && !STATIC_ROOT_PAGES.has(servicePage[1])) {
    return {
      name: "service_page_viewed",
      category: "service-page",
      pageSlug: servicePage[1],
      context: { serviceSlug: servicePage[1] },
    };
  }

  return null;
}
