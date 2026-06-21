import type { SearchSynonymEntry, SynonymRelationType } from "@/data/search-synonyms";
import { searchSynonyms } from "@/data/search-synonyms";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";

function normalizeTerm(value: string): string {
  return queryNormalizationService.normalizeSearchQuery(value);
}

function buildSynonymIndex(entries: SearchSynonymEntry[]): Map<string, SearchSynonymEntry> {
  const index = new Map<string, SearchSynonymEntry>();
  for (const entry of entries) {
    index.set(normalizeTerm(entry.term), entry);
    for (const variant of entry.variants) {
      index.set(normalizeTerm(variant), entry);
    }
  }
  return index;
}

const synonymIndex = buildSynonymIndex(searchSynonyms);

export function classifySynonymRelationType(
  base: string,
  candidate: string,
): SynonymRelationType {
  const normalizedBase = normalizeTerm(base);
  const normalizedCandidate = normalizeTerm(candidate);
  if (normalizedBase === normalizedCandidate) return "exact-synonym";

  const source = synonymIndex.get(normalizedBase) ?? synonymIndex.get(normalizedCandidate);
  if (source) return source.relation;

  if (normalizedCandidate.startsWith(normalizedBase) || normalizedBase.startsWith(normalizedCandidate)) {
    return "close-synonym";
  }
  return "related-term";
}

export function expandSynonyms(terms: string[]): string[] {
  const expanded = new Set<string>();
  for (const term of terms) {
    const normalized = normalizeTerm(term);
    expanded.add(normalized);
    const entry = synonymIndex.get(normalized);
    if (!entry) continue;
    expanded.add(normalizeTerm(entry.term));
    entry.variants.forEach((variant) => expanded.add(normalizeTerm(variant)));
  }
  return [...expanded];
}

export function findSynonyms(term: string): SearchSynonymEntry | null {
  return synonymIndex.get(normalizeTerm(term)) ?? null;
}

export const searchSynonymService = {
  expandSynonyms,
  findSynonyms,
  classifySynonymRelationType,
  list: () => searchSynonyms,
};
