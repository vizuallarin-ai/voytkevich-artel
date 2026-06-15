import { SITE_URL } from "@/lib/seo";
import type {
  ProgrammaticIntent,
  ProgrammaticPageType,
  ProgrammaticSEOPage,
  ProgrammaticSection,
} from "@/types/programmatic-seo";
import { defaultPriorityForPageType } from "@/data/seo-priority-model";
import { getProgrammaticSection } from "@/data/programmatic-seo-sections";

export type QueuePageInput = {
  id: string;
  url: string;
  pageType: ProgrammaticPageType;
  section: ProgrammaticSection;
  title: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  clusterId: string;
  targetKeyword: string;
  intent: ProgrammaticIntent;
  secondaryKeywords?: string[];
  region?: string;
  objectType?: string;
  material?: string;
  size?: string;
  area?: number;
  floors?: number;
  rooms?: number;
  features?: string[];
  status?: ProgrammaticSEOPage["status"];
  notes?: string;
  isFictionalAuthor?: boolean;
  priorityOverrides?: Partial<ProgrammaticSEOPage["priority"]>;
};

export function buildProgrammaticPageSlug(page: Pick<ProgrammaticSEOPage, "url">): string {
  const path = page.url.replace(/^\//, "");
  return path.split("/").filter(Boolean).join("-") || "home";
}

export function buildProgrammaticPageTitle(page: Pick<ProgrammaticSEOPage, "title" | "region">): string {
  return page.title;
}

export function buildProgrammaticPageH1(page: Pick<ProgrammaticSEOPage, "h1">): string {
  return page.h1;
}

export function buildProgrammaticMeta(page: Pick<ProgrammaticSEOPage, "seoTitle" | "seoDescription">) {
  return {
    title: page.seoTitle.slice(0, 60),
    description: page.seoDescription.slice(0, 160),
  };
}

export function buildCanonicalUrl(page: Pick<ProgrammaticSEOPage, "url" | "indexing">): string {
  return page.indexing.canonicalUrl ?? `${SITE_URL}${page.url}`;
}

export function buildInternalLinks(page: ProgrammaticSEOPage): string[] {
  const links = new Set<string>(["/calculator", "/catalog"]);
  if (page.section === "projects") links.add("/process");
  if (page.section === "technical") links.add("/faq");
  if (page.region) links.add(`/objects-map/${page.region}`);
  page.relatedPages?.forEach((l) => links.add(l));
  return [...links];
}

export function buildCTAForIntent(page: Pick<ProgrammaticSEOPage, "intent" | "section">): string {
  const section = getProgrammaticSection(page.section);
  if (page.intent === "commercial" || page.intent === "transactional") {
    return section?.defaultCTA ?? "Получить предварительный расчёт";
  }
  if (page.intent === "local") return "Консультация по строительству в вашей локации";
  if (page.intent === "comparison") return "Помочь выбрать материал и проект";
  if (page.intent === "editorial") return "Обсудить ваш сценарий строительства";
  return "Получить консультацию";
}

export function buildLeadMagnetForIntent(page: Pick<ProgrammaticSEOPage, "intent" | "section">): string | undefined {
  const section = getProgrammaticSection(page.section);
  if (page.intent === "informational" || page.intent === "comparison") {
    return section?.defaultLeadMagnet ?? "estimate-example";
  }
  if (page.intent === "commercial") return "estimate-example";
  return section?.defaultLeadMagnet;
}

export function createQueuedProgrammaticPage(input: QueuePageInput): ProgrammaticSEOPage {
  const slug = buildProgrammaticPageSlug({ url: input.url });
  const priority = { ...defaultPriorityForPageType(input.pageType), ...input.priorityOverrides };
  const sectionDef = getProgrammaticSection(input.section);
  const requiresDisclaimer =
    input.section === "technical" ||
    input.section === "regulations" ||
    input.pageType === "editorial-story";

  const status = input.status ?? "planned";
  const canonicalFullArticleUrl = `${SITE_URL}${input.url}`;

  return {
    id: input.id,
    slug,
    url: input.url,
    pageType: input.pageType,
    title: input.title,
    h1: input.h1,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    clusterId: input.clusterId,
    targetKeyword: input.targetKeyword,
    secondaryKeywords: input.secondaryKeywords,
    intent: input.intent,
    section: input.section,
    region: input.region,
    objectType: input.objectType,
    material: input.material,
    size: input.size,
    area: input.area,
    floors: input.floors,
    rooms: input.rooms,
    features: input.features,
    isFictionalAuthor: input.isFictionalAuthor,
    requiresDisclaimer,
    status,
    indexing: {
      indexable: false,
      noindexReason: "Initial queue — planned, needs keyword data and human review",
      sitemap: false,
    },
    distribution: {
      allowExternalTeasers: sectionDef?.distributionAllowed ?? false,
      teaserRequired: false,
      platforms: sectionDef?.distributionAllowed ? ["telegram", "dzen", "manual-export"] : [],
      canonicalFullArticleUrl,
      utmCampaignId: input.clusterId,
    },
    priority,
    contentRequirements: {
      minWords: sectionDef?.qualityRequirements.minWords,
      requiresFAQ: sectionDef?.qualityRequirements.requiresFAQ ?? true,
      requiresCTA: true,
      requiresLeadMagnet: input.intent === "informational",
      requiresRelatedProjects: input.section === "projects",
      requiresDisclaimer,
      requiresHumanReview: true,
      requiresTeasers: false,
    },
    notes: input.notes,
    createdAt: "2026-06-05T00:00:00.000Z",
  };
}
