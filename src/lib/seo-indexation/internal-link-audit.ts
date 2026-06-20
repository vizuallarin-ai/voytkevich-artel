import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";

export type InternalLinkAuditIssue = {
  url: string;
  pageId: string;
  type: "orphan" | "dead-end" | "missing-internal-links";
  severity: "high" | "medium" | "low";
  message: string;
};

export type InternalLinkAuditReport = {
  issues: InternalLinkAuditIssue[];
  orphanCount: number;
  stub: true;
  note: string;
};

/**
 * Stub: full internal link graph requires crawl data not yet available.
 */
export function detectOrphanPages(
  pages: IndexablePageInput[],
  knownLinkedPaths: string[] = [],
): InternalLinkAuditIssue[] {
  const linked = new Set(knownLinkedPaths.map((p) => (p.startsWith("/") ? p : `/${p}`)));
  linked.add("/");

  const issues: InternalLinkAuditIssue[] = [];

  for (const page of pages) {
    let path: string;
    try {
      path = new URL(page.url).pathname;
    } catch {
      path = page.url.startsWith("/") ? page.url : `/${page.url}`;
    }

    if (path === "/" || page.pageType === "home") continue;

    if (!linked.has(path)) {
      issues.push({
        url: page.url,
        pageId: page.id,
        type: "orphan",
        severity: page.seo.priority === "P1" || page.seo.priority === "P2" ? "high" : "medium",
        message: "Страница без входящих внутренних ссылок (stub detection)",
      });
    }
  }

  return issues;
}

export function auditInternalLinks(
  pages: IndexablePageInput[],
  knownLinkedPaths?: string[],
): InternalLinkAuditReport {
  const issues = detectOrphanPages(pages, knownLinkedPaths);

  return {
    issues,
    orphanCount: issues.filter((i) => i.type === "orphan").length,
    stub: true,
    note: "Stub audit — подключите crawl graph для полной проверки",
  };
}
