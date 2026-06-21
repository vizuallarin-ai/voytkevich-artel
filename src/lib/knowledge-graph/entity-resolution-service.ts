import { randomUUID } from "crypto";
import type { CMSContentItem } from "@/types/content-cms";
import type { KnowledgeNodeType } from "@/types/knowledge-graph";
import type { RegistryEntity } from "@/lib/knowledge-graph/entity-registry";
import { entityRegistry } from "@/lib/knowledge-graph/entity-registry";
import {
  findEntityByAlias,
  normalizeEntityName,
  resolveEntityAlias,
} from "@/lib/knowledge-graph/entity-normalization-service";

export type ExtractedEntity = {
  raw: string;
  normalized: string;
  inferredType?: KnowledgeNodeType;
};

export type EntityResolutionMatchType =
  | "exact"
  | "alias"
  | "taxonomy"
  | "semantic"
  | "ambiguous"
  | "unresolved";

export type EntityResolutionResult = {
  extracted: ExtractedEntity;
  matchType: EntityResolutionMatchType;
  entity?: RegistryEntity;
  candidates?: RegistryEntity[];
  confidence: "low" | "medium" | "high";
};

const ENTITY_PATTERNS: Array<{ pattern: RegExp; type: KnowledgeNodeType }> = [
  { pattern: /каркас/i, type: "technology" },
  { pattern: /брус|деревян/i, type: "material" },
  { pattern: /газобетон|газоблок/i, type: "material" },
  { pattern: /иркутск|ангарск|шелехов|хомутово|мамон|марков/i, type: "location" },
  { pattern: /фундамент/i, type: "construction-stage" },
  { pattern: /под ключ/i, type: "service" },
];

function extractCandidateStrings(item: CMSContentItem): string[] {
  const parts = [
    item.title,
    item.h1,
    item.seo.targetKeyword,
    ...(item.seo.secondaryKeywords ?? []),
    item.seoDescription,
  ].filter(Boolean) as string[];
  return parts;
}

export function extractEntitiesFromContent(contentItem: CMSContentItem): ExtractedEntity[] {
  const seen = new Set<string>();
  const results: ExtractedEntity[] = [];

  for (const text of extractCandidateStrings(contentItem)) {
    for (const { pattern, type } of ENTITY_PATTERNS) {
      const match = text.match(pattern);
      if (!match) continue;
      const raw = match[0];
      const normalized = resolveEntityAlias(raw);
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      results.push({ raw, normalized, inferredType: type });
    }

    const words = text.split(/[,;.\s]+/).filter((w) => w.length > 3);
    for (const word of words) {
      const normalized = resolveEntityAlias(word);
      if (seen.has(normalized)) continue;
      const registryHit = entityRegistry.findByAlias(word);
      if (registryHit) {
        seen.add(normalized);
        results.push({ raw: word, normalized, inferredType: registryHit.entityType });
      }
    }
  }

  return results;
}

export function resolveExtractedEntity(
  entity: ExtractedEntity,
  registry: RegistryEntity[] = entityRegistry.listEntities(),
): EntityResolutionResult {
  const exact = registry.find(
    (e) => normalizeEntityName(e.canonicalName) === entity.normalized,
  );
  if (exact) {
    return { extracted: entity, matchType: "exact", entity: exact, confidence: "high" };
  }

  const aliasHit = findEntityByAlias(entity.raw, registry);
  if (aliasHit) {
    return { extracted: entity, matchType: "alias", entity: aliasHit, confidence: "high" };
  }

  if (entity.inferredType) {
    const typed = registry.filter(
      (e) =>
        e.entityType === entity.inferredType &&
        normalizeEntityName(e.canonicalName).includes(entity.normalized),
    );
    if (typed.length === 1) {
      return { extracted: entity, matchType: "semantic", entity: typed[0], confidence: "medium" };
    }
    if (typed.length > 1) {
      return {
        extracted: entity,
        matchType: "ambiguous",
        candidates: typed,
        confidence: "low",
      };
    }
  }

  const partial = registry.filter(
    (e) =>
      normalizeEntityName(e.canonicalName).includes(entity.normalized) ||
      e.aliases.some((a) => normalizeEntityName(a).includes(entity.normalized)),
  );
  if (partial.length === 1) {
    return { extracted: entity, matchType: "semantic", entity: partial[0], confidence: "medium" };
  }
  if (partial.length > 1) {
    return { extracted: entity, matchType: "ambiguous", candidates: partial, confidence: "low" };
  }

  return { extracted: entity, matchType: "unresolved", confidence: "low" };
}

export function mapContentToEntities(
  contentItem: CMSContentItem,
  entities: ExtractedEntity[],
): EntityResolutionResult[] {
  const registry = entityRegistry.listEntities();
  return entities.map((e) => resolveExtractedEntity(e, registry));
}

export function calculateEntityResolutionConfidence(
  results: EntityResolutionResult[],
): "low" | "medium" | "high" {
  if (results.length === 0) return "low";
  const highCount = results.filter((r) => r.confidence === "high").length;
  const unresolved = results.filter((r) => r.matchType === "unresolved").length;
  if (unresolved > results.length / 2) return "low";
  if (highCount >= results.length * 0.7) return "high";
  return "medium";
}

export async function findUnresolvedEntities(
  contentItems: CMSContentItem[],
): Promise<Array<{ contentItemId: string; unresolved: EntityResolutionResult[] }>> {
  return contentItems.map((item) => {
    const extracted = extractEntitiesFromContent(item);
    const resolved = mapContentToEntities(item, extracted);
    return {
      contentItemId: item.id,
      unresolved: resolved.filter((r) => r.matchType === "unresolved" || r.matchType === "ambiguous"),
    };
  }).filter((r) => r.unresolved.length > 0);
}

export function requestEntityResolutionReview(result: EntityResolutionResult): {
  reviewId: string;
  requiresHumanReview: true;
  result: EntityResolutionResult;
} {
  return {
    reviewId: randomUUID(),
    requiresHumanReview: true,
    result,
  };
}

export function createApprovedEntity(result: EntityResolutionResult): RegistryEntity | null {
  if (result.matchType === "unresolved" || result.matchType === "ambiguous") return null;
  return result.entity ?? null;
}

export const entityResolutionService = {
  extractEntitiesFromContent,
  resolveExtractedEntity,
  mapContentToEntities,
  calculateEntityResolutionConfidence,
  findUnresolvedEntities,
  requestEntityResolutionReview,
  createApprovedEntity,
};
