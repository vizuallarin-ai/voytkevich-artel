import { createHash } from "crypto";
import type { CMSContentItem, CMSContentKind } from "@/types/content-cms";
import type { SearchDocument, SearchDocumentType } from "@/types/search-document";
import { contentRepository } from "@/lib/content-cms/content-repository";
import { getTechnicalArticleBySlug } from "@/lib/technical-content/technical-page-builder";
import { cmsItemToIndexablePage } from "@/lib/seo-indexation/indexable-page-adapters";
import { evaluateIndexability } from "@/lib/seo-indexation/indexability-service";
import { cmsIndexationIntegration } from "@/lib/seo-indexation/cms-indexation-integration";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { entityRegistry } from "@/lib/knowledge-graph/entity-registry";
import { searchSourceRegistry } from "@/lib/search/search-source-registry";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /(?:\+?7|8)\s*\(?\d{3}\)?[\s-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g;

function stripPII(value: string): string {
  return value.replace(EMAIL_RE, "[redacted-email]").replace(PHONE_RE, "[redacted-phone]").trim();
}

function mapKindToDocumentType(item: CMSContentItem): SearchDocumentType {
  const byKind: Record<CMSContentKind, SearchDocumentType> = {
    "programmatic-page": "programmatic",
    "technical-article": "technical",
    "editorial-content": "editorial",
    news: "editorial",
    digest: "editorial",
    "landing-page": "service",
    "lead-magnet": "knowledge",
    "future-ai-draft": "other",
  };

  if (item.kind === "programmatic-page") {
    const haystack = `${item.title} ${item.h1 ?? ""} ${item.seo.targetKeyword ?? ""}`.toLowerCase();
    if (/сравн|vs|или/.test(haystack)) return "comparison";
    if (/faq|вопрос/.test(haystack)) return "faq";
    if (/иркутск|район|область/.test(haystack)) return "location";
    if (/каркас|технолог|материал/.test(haystack)) return "project";
  }

  return byKind[item.kind] ?? "other";
}

function buildTechnicalBodyText(slug: string): string {
  const article = getTechnicalArticleBySlug(slug);
  if (!article) return "";
  return [
    article.content.shortAnswer,
    article.content.intro,
    article.content.whereUsed,
    article.content.howItWorks,
    article.content.howUsuallyDone,
    article.content.materials?.join(" "),
    article.content.steps?.join(" "),
    article.content.mistakes?.join(" "),
    article.content.risks?.join(" "),
    article.content.whenToCallExpert?.join(" "),
    article.content.exampleSituation,
    article.content.checklist?.join(" "),
    article.content.costFactors?.join(" "),
    article.content.conclusion,
    article.faq.map((faq) => `${faq.question} ${faq.answer}`).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

export function extractSearchableText(item: CMSContentItem): string {
  const sections = [
    item.title,
    item.h1,
    item.seoDescription,
    item.seo.targetKeyword,
    item.seo.secondaryKeywords?.join(" "),
    item.url,
  ];

  if (item.kind === "technical-article") {
    sections.push(buildTechnicalBodyText(item.slug));
  }

  return sections.filter(Boolean).join("\n");
}

function buildHeadings(item: CMSContentItem, content: string): string[] {
  const headings = [item.h1, item.title].filter(Boolean) as string[];
  const markdownHeadings = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, ""));
  return [...new Set([...headings, ...markdownHeadings])];
}

function inferBusinessSignals(item: CMSContentItem): SearchDocument["business"] {
  const isCommercialKind = item.kind === "landing-page" || item.kind === "programmatic-page";
  const hasCommercialKeyword = /цена|стоимость|под ключ|купить|заказать/i.test(
    [item.title, item.h1, item.seo.targetKeyword].filter(Boolean).join(" "),
  );

  return {
    priorityLevel: item.seo.priority,
    commercialIntent: isCommercialKind || hasCommercialKeyword ? "high" : "medium",
    leadPotential: item.kind === "landing-page" ? "high" : hasCommercialKeyword ? "medium" : "low",
    destinationType: item.kind === "landing-page"
      ? "conversion"
      : hasCommercialKeyword
        ? "commercial"
        : "informational",
  };
}

function inferTaxonomy(item: CMSContentItem): SearchDocument["taxonomy"] {
  return {
    services: item.related.projects ?? [],
    buildingTypes: item.related.projectCategories ?? [],
    technologies: [],
    materials: [],
    sizes: [],
    areas: [],
    floors: [],
    layouts: [],
    locations: /иркутск|область/i.test(item.title) ? ["иркутск"] : [],
  };
}

function resolveEntities(item: CMSContentItem): {
  entities: string[];
  entityNodeIds: string[];
  synonyms: string[];
} {
  const extracted = entityResolutionService.extractEntitiesFromContent(item);
  const resolved = extracted.map((entity) =>
    entityResolutionService.resolveExtractedEntity(entity, entityRegistry.listEntities()),
  );

  const entities = new Set<string>();
  const entityNodeIds = new Set<string>();
  const synonyms = new Set<string>();

  for (const result of resolved) {
    if (result.entity) {
      entities.add(result.entity.canonicalName);
      entityNodeIds.add(result.entity.id);
      result.entity.aliases.forEach((alias) => synonyms.add(alias));
    } else {
      entities.add(result.extracted.normalized);
    }
  }

  return {
    entities: [...entities],
    entityNodeIds: [...entityNodeIds],
    synonyms: [...synonyms],
  };
}

export function shouldIndexSearchDocument(item: CMSContentItem, existingItems: CMSContentItem[] = []): boolean {
  if (item.status !== "published") return false;
  if (["draft", "review", "noindex"].includes(item.status)) return false;

  const source = searchSourceRegistry.getSourceByCMSKind(item.kind);
  if (!source) return false;
  if (source.excludedStatuses.includes(item.status)) return false;
  if (searchSourceRegistry.shouldExclude(item.kind, item.status, item.url)) return false;

  const decision = evaluateIndexability(cmsItemToIndexablePage(item), { existingItems });
  return decision.indexable && item.indexing.indexable;
}

export function sanitizeSearchDocument(document: SearchDocument): SearchDocument {
  return {
    ...document,
    title: stripPII(document.title),
    description: document.description ? stripPII(document.description) : document.description,
    content: stripPII(document.content),
    search: {
      ...document.search,
      keywords: document.search.keywords.map(stripPII),
      synonyms: document.search.synonyms.map(stripPII),
      aliases: document.search.aliases.map(stripPII),
    },
  };
}

export async function buildSearchDocument(
  item: CMSContentItem,
  existingItems: CMSContentItem[] = [],
): Promise<SearchDocument | null> {
  if (!shouldIndexSearchDocument(item, existingItems)) return null;

  const content = extractSearchableText(item);
  const { entities, entityNodeIds, synonyms } = resolveEntities(item);
  const now = new Date().toISOString();
  const normalizedText = queryNormalizationService.normalizeSearchQuery(
    [item.title, item.h1, item.seoDescription, content].filter(Boolean).join(" "),
  );
  const contentHash = createHash("sha256").update(content).digest("hex");

  const document: SearchDocument = {
    id: `search-doc:${item.id}`,
    contentItemId: item.id,
    type: mapKindToDocumentType(item),
    title: item.title,
    description: item.seoDescription,
    content,
    canonicalUrl: item.indexing.canonicalUrl ?? item.url,
    slug: item.slug,
    headings: buildHeadings(item, content),
    entities,
    entityNodeIds,
    clusterIds: item.clusterId ? [item.clusterId] : [],
    taxonomy: inferTaxonomy(item),
    search: {
      keywords: [item.seo.targetKeyword, ...(item.seo.secondaryKeywords ?? [])].filter(Boolean) as string[],
      synonyms,
      aliases: [item.slug, item.h1 ?? ""].filter(Boolean),
      normalizedText,
      language: "ru",
    },
    business: inferBusinessSignals(item),
    source: {
      versionId: item.updatedAt ?? item.createdAt,
      publishedAt: item.workflow.publishedAt,
      updatedAt: item.updatedAt,
      indexedAt: now,
      contentHash,
    },
    indexability: {
      indexable: true,
      canonical: Boolean(item.indexing.canonicalUrl),
      published: item.status === "published",
    },
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  return sanitizeSearchDocument(document);
}

async function buildSearchDocuments(items: CMSContentItem[]): Promise<SearchDocument[]> {
  const documents = await Promise.all(items.map((item) => buildSearchDocument(item, items)));
  return documents.filter((entry): entry is SearchDocument => Boolean(entry));
}

export async function buildSearchDocumentsFromRepository(): Promise<SearchDocument[]> {
  const items = await contentRepository.listContent();
  return buildSearchDocuments(items);
}

export async function buildSearchDocumentsFromIndexableCMS(): Promise<SearchDocument[]> {
  const items = await cmsIndexationIntegration.getCMSItemsByIndexability(true);
  return buildSearchDocuments(items);
}

export const searchDocumentService = {
  buildSearchDocument,
  buildSearchDocumentsFromRepository,
  buildSearchDocumentsFromIndexableCMS,
  shouldIndexSearchDocument,
  extractSearchableText,
  sanitizeSearchDocument,
  mapCMSKindToSearchDocumentType: mapKindToDocumentType,
};
