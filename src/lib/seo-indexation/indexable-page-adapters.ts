import type { CMSContentItem } from "@/types/content-cms";
import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import { SITE_URL } from "@/lib/seo";

function normalizeUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function cmsItemToIndexablePage(item: CMSContentItem): IndexablePageInput {
  const pageType =
    item.kind === "programmatic-page"
      ? item.contentType ?? "programmatic-page"
      : item.kind === "technical-article"
        ? "article"
        : item.kind === "editorial-content" || item.kind === "news" || item.kind === "digest"
          ? "article"
          : item.kind === "landing-page"
            ? "service"
            : undefined;

  return {
    id: item.id,
    kind: item.kind,
    slug: item.slug,
    url: item.url.startsWith("http") ? item.url : normalizeUrl(item.url),
    title: item.title,
    status: item.status,
    pageType,
    contentType: item.contentType,
    canonicalUrl: item.indexing.canonicalUrl,
    explicitNoindex: item.status === "noindex" || !item.indexing.indexable,
    explicitIndexable: item.indexing.indexable && item.status !== "noindex",
    noindexReason: item.indexing.noindexReason,
    quality: {
      canPublish: item.quality.canPublish,
      shouldNoindex: item.quality.shouldNoindex,
      blockers: item.quality.blockers,
      warnings: item.quality.warnings,
      level: item.quality.level,
    },
    seo: {
      priority: item.seo.priority,
      cannibalizationRisk: item.seo.cannibalizationRisk,
      thinContentRisk: item.seo.thinContentRisk,
      targetKeyword: item.seo.targetKeyword,
    },
    workflow: {
      publishedAt: item.workflow.publishedAt,
      updatedAt: item.workflow.updatedAt ?? item.updatedAt,
    },
    source: item.source,
  };
}

export type StaticRouteIndexableOptions = {
  path: string;
  title?: string;
  pageType?: string;
  status?: IndexablePageInput["status"];
  priority?: IndexablePageInput["seo"]["priority"];
  lastModified?: string;
};

export function staticRouteToIndexablePage(options: StaticRouteIndexableOptions): IndexablePageInput {
  const path = options.path.startsWith("/") ? options.path : `/${options.path}`;
  const pageType = options.pageType ?? inferPageTypeFromPath(path);

  return {
    id: `static:${path}`,
    kind: "static-page",
    slug: path.replace(/^\//, "") || "home",
    url: normalizeUrl(path),
    title: options.title ?? path,
    status: options.status ?? "published",
    pageType,
    quality: {
      canPublish: true,
      shouldNoindex: false,
      blockers: [],
      warnings: [],
      level: "good",
    },
    seo: {
      priority: options.priority,
    },
    workflow: {
      updatedAt: options.lastModified,
    },
    source: { origin: "manual" },
  };
}

function inferPageTypeFromPath(path: string): string {
  if (path === "/" || path === "") return "home";
  if (path === "/catalog") return "catalog";
  if (path.startsWith("/catalog/kategoriya/")) return "category";
  if (path.startsWith("/catalog/")) return "project";
  if (path.startsWith("/blog/category/")) return "category";
  if (path.startsWith("/blog/")) return "article";
  if (path.startsWith("/cases/category/")) return "category";
  if (path.startsWith("/cases/")) return "case";
  if (path.startsWith("/objects-map/")) return "project-location-page";
  if (path === "/calculator") return "calculator";
  if (path === "/planirovka") return "planner";
  if (path === "/about") return "about";
  if (path === "/process") return "process";
  if (path === "/faq") return "faq";
  if (path.startsWith("/proekty-")) return "programmatic-page";
  return "service";
}
