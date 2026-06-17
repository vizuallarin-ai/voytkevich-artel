import type { TechnicalContentCluster, TechnicalContentQueueItem } from "@/types/technical-content";
import { technicalContentInitialQueue } from "@/data/technical-content-initial-queue";
import { getTaxonomyCombinations } from "@/lib/taxonomy/taxonomy-combination-builder";

const PROGRAMMATIC_BY_CLUSTER: Record<string, string[]> = {
  "foundation-choice": ["/proekty-domov/karkasnye-doma", "/stroitelstvo-domov/irkutsk"],
  "frame-house-technology": ["/proekty-domov/karkasnye-doma", "/calculator"],
  "timber-house-technology": ["/proekty-domov/doma-iz-brusa"],
  "gas-concrete-technology": ["/proekty-domov/doma-iz-gazobetona"],
  "land-plot-check": ["/proekty-domov", "/calculator"],
  "estimate-reading": ["/calculator", "/proekty-domov"],
  "roof-insulation": ["/proekty-domov/doma-100-120-m2"],
  "bathhouse-building": ["/proekty-ban"],
};

const CATEGORY_LINKS: Record<string, string> = {
  karkasnye: "/catalog/kategoriya/karkasnye",
  "iz-brusa": "/catalog/kategoriya/iz-brusa",
  "iz-gazobetona": "/catalog/kategoriya/iz-gazobetona",
  odnoetazhnye: "/catalog/kategoriya/odnoetazhnye",
  dvukhetazhnye: "/catalog/kategoriya/dvukhetazhnye",
  banya: "/proekty-ban",
};

export function buildTechnicalRelatedLinks(
  item: TechnicalContentQueueItem,
  cluster: TechnicalContentCluster,
) {
  const programmaticPages =
    PROGRAMMATIC_BY_CLUSTER[cluster.id] ??
    getTaxonomyCombinations()
      .filter((c) => c.level <= 2 && c.objectTypeId === "houses")
      .slice(0, 3)
      .map((c) => c.url);

  const projectCategories = cluster.relatedProjectCategories
    .map((slug) => CATEGORY_LINKS[slug])
    .filter(Boolean) as string[];

  const articles = technicalContentInitialQueue
    .filter((q) => q.id !== item.id && q.clusterId === cluster.id)
    .slice(0, 2)
    .map((q) => `/blog/${q.slug}`);

  const crossCluster = technicalContentInitialQueue
    .filter((q) => q.id !== item.id && q.clusterId !== cluster.id)
    .slice(0, 3)
    .map((q) => `/blog/${q.slug}`);

  return {
    projectCategories,
    projects: [],
    articles: [...articles, ...crossCluster].slice(0, 5),
    leadMagnets: cluster.relatedLeadMagnets,
    calculators: ["/calculator"],
    programmaticPages: programmaticPages.slice(0, 4),
  };
}

export function resolveRelatedLinkLabel(href: string): string {
  if (href === "/calculator") return "Калькулятор стоимости";
  if (href === "/catalog") return "Каталог проектов";
  if (href.startsWith("/proekty-") || href.startsWith("/stroitelstvo-")) {
    const combo = getTaxonomyCombinations().find((c) => c.url === href);
    return combo?.h1 ?? href;
  }
  const queue = technicalContentInitialQueue.find((q) => `/blog/${q.slug}` === href);
  return queue?.title ?? href;
}
