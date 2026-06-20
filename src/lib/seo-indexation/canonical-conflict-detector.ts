import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import {
  detectCanonicalChain,
  findCanonicalConflicts,
  type CanonicalConflict,
} from "@/lib/seo-indexation/canonical-resolver";

export type CanonicalConflictReport = {
  conflicts: CanonicalConflict[];
  hasBlockingConflicts: boolean;
  summary: string;
};

export function detectCanonicalConflicts(pages: IndexablePageInput[]): CanonicalConflictReport {
  const conflicts = findCanonicalConflicts(pages);
  const hasBlockingConflicts = conflicts.some(
    (c) => c.conflictType === "loop" || c.conflictType === "cross-domain" || c.conflictType === "mismatch",
  );

  return {
    conflicts,
    hasBlockingConflicts,
    summary:
      conflicts.length === 0
        ? "Конфликтов canonical не обнаружено"
        : `Обнаружено ${conflicts.length} конфликт(ов) canonical`,
  };
}

export function hasCanonicalLoop(pages: IndexablePageInput[]): boolean {
  return detectCanonicalChain(pages).hasLoop;
}

export function getPagesWithCanonicalConflicts(pages: IndexablePageInput[]): IndexablePageInput[] {
  const conflictUrls = new Set(
    findCanonicalConflicts(pages).flatMap((c) => c.relatedUrls),
  );
  return pages.filter((p) => conflictUrls.has(p.url));
}
