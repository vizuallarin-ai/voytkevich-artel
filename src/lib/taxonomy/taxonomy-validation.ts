import type { TaxonomyValidationResult } from "@/types/project-taxonomy";
import { projectObjectTypes } from "@/data/project-object-types";
import { projectMaterials } from "@/data/project-materials";
import { projectSizes } from "@/data/project-size-taxonomy";
import { projectFeatures } from "@/data/project-feature-taxonomy";
import { getTaxonomyCombinations } from "@/lib/taxonomy/taxonomy-combination-builder";

export function validateProjectTaxonomy(): TaxonomyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const slugSet = new Set<string>();
  const urlSet = new Set<string>();
  const h1Set = new Map<string, string>();

  for (const o of projectObjectTypes) {
    if (slugSet.has(o.slug)) errors.push(`Duplicate object slug: ${o.slug}`);
    slugSet.add(o.slug);
    for (const mid of o.allowedMaterials) {
      if (!projectMaterials.find((m) => m.id === mid)) {
        warnings.push(`Object ${o.id} references unknown material ${mid}`);
      }
    }
  }

  for (const m of projectMaterials) {
    if (slugSet.has(m.slug)) errors.push(`Duplicate material slug: ${m.slug}`);
    slugSet.add(m.slug);
  }

  for (const s of projectSizes) {
    if (slugSet.has(s.slug)) errors.push(`Duplicate size slug: ${s.slug}`);
    slugSet.add(s.slug);
  }

  for (const f of projectFeatures) {
    if (slugSet.has(f.slug)) errors.push(`Duplicate feature slug: ${f.slug}`);
    slugSet.add(f.slug);
  }

  const combinations = getTaxonomyCombinations();

  for (const c of combinations) {
    if (urlSet.has(c.url)) errors.push(`Duplicate URL: ${c.url} (${c.id})`);
    urlSet.add(c.url);

    const h1Key = c.h1.toLowerCase().trim();
    const prev = h1Set.get(h1Key);
    if (prev && prev !== c.id) warnings.push(`Similar H1: "${c.h1}" (${prev} vs ${c.id})`);
    h1Set.set(h1Key, c.id);

    if (c.indexing.indexable && c.status === "needs-keyword-data") {
      errors.push(`Indexable but needs-keyword-data: ${c.id}`);
    }

    if (c.indexing.indexable && !c.requirements.requiresCTA) {
      errors.push(`Indexable without CTA requirement: ${c.id}`);
    }

    if (c.indexing.indexable && c.risks.duplicateRisk === "high" && !c.indexing.canonicalUrl) {
      warnings.push(`High duplicate risk without canonical: ${c.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateTaxonomyOrThrow(): void {
  const result = validateProjectTaxonomy();
  if (!result.valid && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.warn("[taxonomy-validation]", result.errors);
  }
}
