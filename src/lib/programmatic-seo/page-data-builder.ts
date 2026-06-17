import type { Project } from "@/types";
import type { TaxonomyCombination } from "@/types/project-taxonomy";
import type {
  ProgrammaticPageBlock,
  ProgrammaticPageData,
  ProgrammaticPageTemplate,
} from "@/types/programmatic-page-template";
import { getObjectTypeById } from "@/data/project-object-types";
import {
  mapCombinationToTemplateType,
  resolveTemplateForCombination,
} from "@/lib/programmatic-seo/page-template-resolver";
import { matchProjectsForProgrammaticPage } from "@/lib/programmatic-seo/project-matcher";
import {
  buildFilterLinks,
  buildRelatedPages,
} from "@/lib/programmatic-seo/related-pages-builder";
import { buildProgrammaticSchema } from "@/lib/programmatic-seo/programmatic-schema";
import {
  buildCostFactors,
  buildHowToChoose,
  buildIntro,
  buildProgrammaticFaq,
  buildSeoText,
  buildWhoItFits,
} from "@/lib/programmatic-seo/programmatic-faq";
import { getTaxonomyCombinations } from "@/lib/taxonomy/taxonomy-combination-builder";
import {
  buildProgrammaticCta,
  resolveLeadMagnet,
} from "@/lib/programmatic-seo/programmatic-cta";

function resolveRobots(
  combination: TaxonomyCombination,
  template: ProgrammaticPageTemplate,
  projectCount: number,
): ProgrammaticPageData["robots"] {
  const indexable =
    combination.indexing.indexable &&
    template.seoRules.indexableByDefault !== false &&
    (template.projectMatchingRules.minProjectsCount === 0 || projectCount > 0);

  if (template.type === "combination-page" && projectCount === 0) {
    return { index: false, follow: true };
  }

  return { index: indexable, follow: true };
}

function resolveBlocks(template: ProgrammaticPageTemplate): ProgrammaticPageBlock[] {
  return [...template.requiredBlocks, ...template.optionalBlocks.filter((b) => b !== "schema")];
}

export function buildProgrammaticPageData(
  combination: TaxonomyCombination,
  projects: Project[],
): ProgrammaticPageData {
  const templateType = mapCombinationToTemplateType(combination);
  const template = resolveTemplateForCombination(combination)!;
  const match = matchProjectsForProgrammaticPage(combination, projects);
  const robots = resolveRobots(combination, template, match.matched.length);
  const related = buildRelatedPages(combination);
  const filterLinks = buildFilterLinks(combination);

  const content = {
    intro: buildIntro(combination),
    costFactors: template.requiredBlocks.includes("cost-factors")
      ? buildCostFactors()
      : undefined,
    whoItFits: template.requiredBlocks.includes("who-it-fits")
      ? buildWhoItFits(templateType)
      : undefined,
    howToChoose: template.requiredBlocks.includes("how-to-choose")
      ? buildHowToChoose(templateType)
      : undefined,
    seoText: template.seoRules.requiresSEOText ? buildSeoText(combination, templateType) : undefined,
    disclaimer: match.fallbackUsed ? match.fallbackReason : undefined,
  };

  const pageData: ProgrammaticPageData = {
    id: combination.id,
    slug: combination.slug,
    url: combination.url,
    templateType,
    h1: combination.h1,
    title: combination.h1,
    description: combination.seoDescription,
    seoTitle: combination.seoTitle,
    seoDescription: combination.seoDescription,
    canonicalUrl: combination.indexing.canonicalUrl,
    robots,
    taxonomy: {
      objectTypeId: combination.objectTypeId,
      materialId: combination.materialId,
      sizeId: combination.sizeId,
      featureId: combination.featureId,
      regionId: combination.regionId,
      intentId: combination.intentId,
    },
    content,
    projects: match,
    faq: buildProgrammaticFaq(combination, templateType),
    cta: buildProgrammaticCta(combination, template),
    leadMagnet: resolveLeadMagnet(combination, template),
    related,
    filterLinks,
    schema: [],
    analytics: {
      pageType: template.analytics.pageType,
      pageSlug: combination.slug,
      templateType,
      clusterId: combination.id,
    },
    blocks: resolveBlocks(template),
  };

  pageData.schema = buildProgrammaticSchema(pageData);
  return pageData;
}

/** Корневая категория /proekty-domov или /proekty-ban без slug в таксономии. */
export function buildPrimaryCategoryCombination(
  objectTypeId: "houses" | "bathhouses",
): TaxonomyCombination | null {
  const objectType = getObjectTypeById(objectTypeId);
  if (!objectType) return null;

  const existing = getTaxonomyCombinations().find(
    (c) => c.objectTypeId === objectTypeId && c.pageType === "project-category",
  );
  if (existing) return existing;

  const prefix = objectTypeId === "houses" ? "/proekty-domov" : "/proekty-ban";
  const synthetic: TaxonomyCombination = {
    id: `object:${objectTypeId}`,
    level: 1,
    objectTypeId,
    pageType: "project-category",
    slug: "",
    url: prefix,
    h1: `Проекты ${objectType.pluralTitle.toLowerCase()} для строительства в Иркутске и Иркутской области`,
    seoTitle: `Проекты ${objectType.pluralTitle.toLowerCase()} — Иркутск и область`,
    seoDescription: objectType.description,
    status: "needs-keyword-data",
    indexing: { indexable: false, sitemap: false, noindexReason: "primary category awaiting approval" },
    priority: { publishPriority: "P2", reason: "primary hub" },
    requirements: {
      requiresRealProjects: true,
      minProjectsCount: 1,
      requiresUniqueIntro: true,
      requiresFAQ: true,
      requiresCTA: true,
      requiresLeadMagnet: true,
      requiresHumanReview: true,
    },
    risks: { thinContentRisk: "low", cannibalizationRisk: "low", duplicateRisk: "low" },
  };
  return synthetic;
}
