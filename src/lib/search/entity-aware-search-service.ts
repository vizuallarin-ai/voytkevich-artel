import type { SearchResult } from "@/types/search-result";
import { entityRegistry } from "@/lib/knowledge-graph/entity-registry";
import { entityResolutionService } from "@/lib/knowledge-graph/entity-resolution-service";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";

export type QueryEntity = {
  value: string;
  normalized: string;
  nodeId?: string;
  confidence: "low" | "medium" | "high";
};

export function extractQueryEntities(query: string): QueryEntity[] {
  const normalizedQuery = queryNormalizationService.normalizeSearchQuery(query);
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  const entities: QueryEntity[] = [];

  for (const entity of entityRegistry.listEntities()) {
    const canonical = queryNormalizationService.normalizeSearchQuery(entity.canonicalName);
    if (normalizedQuery.includes(canonical)) {
      entities.push({
        value: entity.canonicalName,
        normalized: canonical,
        nodeId: entity.id,
        confidence: "high",
      });
      continue;
    }

    const aliasHit = entity.aliases.find((alias) => words.includes(queryNormalizationService.normalizeSearchQuery(alias)));
    if (!aliasHit) continue;
    entities.push({
      value: aliasHit,
      normalized: queryNormalizationService.normalizeSearchQuery(aliasHit),
      nodeId: entity.id,
      confidence: "medium",
    });
  }

  return entities;
}

export function resolveQueryEntities(query: string): QueryEntity[] {
  const extracted = extractQueryEntities(query);
  const resolved = extracted.map((entity) =>
    entityResolutionService.resolveExtractedEntity(
      { raw: entity.value, normalized: entity.normalized },
      entityRegistry.listEntities(),
    ),
  );

  return resolved.map((match, index) => ({
    ...extracted[index],
    nodeId: match.entity?.id ?? extracted[index]?.nodeId,
    confidence: match.confidence,
  }));
}

export function boostExactEntityMatches(results: SearchResult[], queryEntities: QueryEntity[]): SearchResult[] {
  if (queryEntities.length === 0) return results;

  const nodeIds = new Set(queryEntities.map((entity) => entity.nodeId).filter(Boolean));
  const names = queryEntities.map((entity) => entity.normalized);

  return results
    .map((result) => {
      const entityMatch = result.entities.some((entity) =>
        names.includes(queryNormalizationService.normalizeSearchQuery(entity)),
      );
      const nodeMatch = result.breadcrumbs.some((crumb) => nodeIds.has(crumb));
      if (!entityMatch && !nodeMatch) return result;
      return {
        ...result,
        score: result.score * 1.15,
        explanation: [result.explanation, "entity-match-boost"].filter(Boolean).join(" | "),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export const entityAwareSearchService = {
  extractQueryEntities,
  resolveQueryEntities,
  boostExactEntityMatches,
};
