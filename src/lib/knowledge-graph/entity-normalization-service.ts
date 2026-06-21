import type { RegistryEntity } from "@/lib/knowledge-graph/entity-registry";

const SIZE_PATTERN = /(\d+)\s*[x×хна]\s*(\d+)/i;

export function normalizeEntityName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .replace(/[–—−]/g, "-")
    .replace(/×/g, "x");
}

export function normalizeEntitySlug(value: string): string {
  return normalizeEntityName(value)
    .replace(/[^a-z0-9а-я\-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeSizeNotation(value: string): string {
  const match = value.match(SIZE_PATTERN);
  if (!match) return normalizeEntityName(value);
  return `${match[1]}x${match[2]}`;
}

export function resolveEntityAlias(value: string): string {
  const normalized = normalizeEntityName(value);
  const sizeNorm = normalizeSizeNotation(value);
  return sizeNorm !== normalized ? sizeNorm : normalized;
}

export function findEntityByAlias(
  value: string,
  entities: RegistryEntity[],
): RegistryEntity | undefined {
  const key = resolveEntityAlias(value);
  return entities.find(
    (e) =>
      normalizeEntityName(e.canonicalName) === key ||
      e.aliases.some((a) => normalizeEntityName(a) === key),
  );
}

export type EntityDuplicateCandidate = {
  entityA: RegistryEntity;
  entityB: RegistryEntity;
  reason: string;
  confidence: "low" | "medium" | "high";
};

export function detectEntityDuplicates(entities: RegistryEntity[]): EntityDuplicateCandidate[] {
  const results: EntityDuplicateCandidate[] = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const a = entities[i];
      const b = entities[j];
      if (a.entityType !== b.entityType) continue;

      const nameA = normalizeEntityName(a.canonicalName);
      const nameB = normalizeEntityName(b.canonicalName);
      if (nameA === nameB) {
        results.push({ entityA: a, entityB: b, reason: "identical normalized name", confidence: "high" });
        continue;
      }

      const aliasOverlap = a.aliases.some((alias) =>
        b.aliases.some((bAlias) => normalizeEntityName(alias) === normalizeEntityName(bAlias)),
      );
      if (aliasOverlap) {
        results.push({ entityA: a, entityB: b, reason: "shared alias", confidence: "medium" });
      }
    }
  }
  return results;
}

export function mergeEntityAliases(entityId: string, aliases: string[], entity: RegistryEntity): RegistryEntity {
  const merged = new Set([...entity.aliases, ...aliases.map(normalizeEntityName)]);
  merged.delete(normalizeEntityName(entity.canonicalName));
  return { ...entity, aliases: [...merged] };
}

export function recommendEntityMerge(
  duplicates: EntityDuplicateCandidate[],
): EntityDuplicateCandidate[] {
  return duplicates.filter((d) => d.confidence !== "low");
}

export type EntityMergeValidation = {
  valid: boolean;
  reasons: string[];
};

export function validateEntityMerge(source: RegistryEntity, target: RegistryEntity): EntityMergeValidation {
  const reasons: string[] = [];
  if (source.entityType !== target.entityType) {
    reasons.push("Different entity types cannot merge automatically");
  }
  if (source.id === target.id) {
    reasons.push("Cannot merge entity with itself");
  }
  if (source.status === "deprecated" || target.status === "deprecated") {
    reasons.push("Deprecated entities require manual review before merge");
  }
  const sameLocationFamily =
    source.entityType === "location" &&
    target.entityType === "location" &&
    normalizeEntityName(source.canonicalName).includes("област") !==
      normalizeEntityName(target.canonicalName).includes("област");
  if (sameLocationFamily && source.canonicalName !== target.canonicalName) {
    reasons.push("Location entities with different geographic scope need expert review");
  }
  return { valid: reasons.length === 0, reasons };
}

export type EntityNormalizationReport = {
  totalEntities: number;
  duplicateCandidates: EntityDuplicateCandidate[];
  mergeRecommendations: EntityDuplicateCandidate[];
  generatedAt: string;
};

export function buildEntityNormalizationReport(entities: RegistryEntity[]): EntityNormalizationReport {
  const duplicates = detectEntityDuplicates(entities);
  return {
    totalEntities: entities.length,
    duplicateCandidates: duplicates,
    mergeRecommendations: recommendEntityMerge(duplicates),
    generatedAt: new Date().toISOString(),
  };
}

export const entityNormalizationService = {
  normalizeEntityName,
  normalizeEntitySlug,
  normalizeSizeNotation,
  resolveEntityAlias,
  findEntityByAlias,
  detectEntityDuplicates,
  mergeEntityAliases,
  recommendEntityMerge,
  validateEntityMerge,
  buildEntityNormalizationReport,
};
