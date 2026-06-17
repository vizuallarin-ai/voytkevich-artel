import type { EditorialContentQueueItem } from "@/types/editorial-content";
import { getEditorialRubricById } from "@/data/editorial-rubrics";
import { editorialContentInitialQueue } from "@/data/editorial-content-initial-queue";
import { technicalContentInitialQueue } from "@/data/technical-content-initial-queue";

const CATEGORY_LINKS: Record<string, string> = {
  "do-150-m2": "/catalog/kategoriya/do-150-m2",
  odnoetazhnye: "/catalog/kategoriya/odnoetazhnye",
  dvukhetazhnye: "/catalog/kategoriya/dvukhetazhnye",
  karkasnye: "/catalog/kategoriya/karkasnye",
  "iz-brusa": "/catalog/kategoriya/iz-brusa",
  banya: "/proekty-ban",
};

const SLUG_RELATED: Record<string, Partial<ReturnType<typeof buildDefaultRelated>>> = {
  "kak-semya-vybirala-dom-150-m2": {
    projectCategories: ["/catalog/kategoriya/do-150-m2", "/planner"],
    technicalArticles: ["kak-vybrat-proekt-pod-uchastok", "kak-chitat-smetu"],
    calculators: ["/calculator"],
    leadMagnets: ["budget-project-selection"],
  },
  "kak-uchastok-menyaet-proekt-doma": {
    technicalArticles: ["kak-proverit-uchastok-pered-stroitelstvom"],
    leadMagnets: ["land-checklist"],
    calculators: ["/calculator"],
    projectCategories: ["/catalog"],
  },
  "banya-3-na-3-ili-4-na-6-chto-vybrat": {
    programmaticPages: ["/proekty-ban/banya-3-na-3", "/proekty-ban/banya-4-na-6"],
    projectCategories: ["/proekty-ban"],
    technicalArticles: ["kak-vybrat-mesto-pod-banyu"],
  },
};

const CLUSTER_TO_TECH_SLUG: Record<string, string[]> = {
  "land-plot-check": ["kak-proverit-uchastok-pered-stroitelstvom", "chto-proverit-na-uchastke"],
  "estimate-reading": ["kak-chitat-smetu", "iz-chego-skladyvaetsya-stoimost-doma"],
  "foundation-choice": ["kak-vybrat-fundament-dlya-doma"],
  "bathhouse-building": ["kak-vybrat-mesto-pod-banyu", "chto-uchest-pered-stroitelstvom-bani"],
  "construction-mistakes": ["tipichnye-oshibki-pri-stroitelstve-doma"],
};

function buildDefaultRelated(item: EditorialContentQueueItem) {
  const rubric = getEditorialRubricById(item.rubricId);
  const projectCategories = (rubric?.relatedProjectCategories ?? [])
    .map((slug) => CATEGORY_LINKS[slug])
    .filter(Boolean) as string[];

  const technicalArticles = (rubric?.relatedTechnicalClusters ?? [])
    .flatMap((cluster) => CLUSTER_TO_TECH_SLUG[cluster] ?? [])
    .slice(0, 3);

  const editorialPeers = editorialContentInitialQueue
    .filter((q) => q.id !== item.id && q.rubricId === item.rubricId)
    .slice(0, 2)
    .map((q) => q.slug);

  return {
    projects: [] as string[],
    projectCategories: projectCategories.length ? projectCategories : ["/catalog"],
    technicalArticles: [...technicalArticles, ...editorialPeers].slice(0, 5),
    programmaticPages: ["/proekty-domov", "/calculator"].slice(0, 2),
    leadMagnets: rubric?.defaultLeadMagnet ? [rubric.defaultLeadMagnet] : [],
    calculators: ["/calculator"],
  };
}

export function buildEditorialRelatedLinks(item: EditorialContentQueueItem) {
  const defaults = buildDefaultRelated(item);
  const override = SLUG_RELATED[item.slug];
  if (!override) return defaults;

  return {
    projects: override.projects ?? defaults.projects,
    projectCategories: override.projectCategories ?? defaults.projectCategories,
    technicalArticles: override.technicalArticles ?? defaults.technicalArticles,
    programmaticPages: override.programmaticPages ?? defaults.programmaticPages,
    leadMagnets: override.leadMagnets ?? defaults.leadMagnets,
    calculators: override.calculators ?? defaults.calculators,
  };
}

export function resolveEditorialTechnicalArticleUrl(slug: string): string {
  const exists = technicalContentInitialQueue.some((q) => q.slug === slug);
  return exists ? `/blog/${slug}` : `/blog`;
}

export function resolveEditorialLinkLabel(href: string, slug?: string): string {
  if (href === "/calculator") return "Калькулятор стоимости";
  if (href === "/catalog") return "Каталог проектов";
  if (href === "/planner") return "Планировщик";
  if (slug) {
    const tech = technicalContentInitialQueue.find((q) => q.slug === slug);
    if (tech) return tech.title;
    const editorial = editorialContentInitialQueue.find((q) => q.slug === slug);
    if (editorial) return editorial.title;
  }
  return href;
}
