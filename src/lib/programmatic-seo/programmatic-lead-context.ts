import type { ProgrammaticLeadContext, ProgrammaticPageData } from "@/types/programmatic-page-template";

export function buildProgrammaticLeadContext(
  pageData: ProgrammaticPageData,
  sourceCTA: string,
  sourceSection?: string,
): ProgrammaticLeadContext {
  return {
    pageType: pageData.analytics.pageType,
    pageSlug: pageData.slug,
    pageUrl: pageData.url,
    h1: pageData.h1,
    objectTypeId: pageData.taxonomy.objectTypeId,
    materialId: pageData.taxonomy.materialId,
    sizeId: pageData.taxonomy.sizeId,
    featureId: pageData.taxonomy.featureId,
    regionId: pageData.taxonomy.regionId,
    intentId: pageData.taxonomy.intentId,
    templateType: pageData.templateType,
    matchedProjectsCount: pageData.projects.matched.length,
    sourceCTA,
    sourceSection,
  };
}

export function formatProgrammaticLeadSummary(ctx: ProgrammaticLeadContext): string {
  const parts = [`Страница: «${ctx.h1}»`, `URL: ${ctx.pageUrl}`, `CTA: «${ctx.sourceCTA}»`];
  if (ctx.matchedProjectsCount != null) {
    parts.push(`Проектов в подборке: ${ctx.matchedProjectsCount}`);
  }
  return parts.join("\n");
}
