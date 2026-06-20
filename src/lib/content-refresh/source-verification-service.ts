import { randomUUID } from "crypto";
import type { ContentSourceRecord } from "@/types/content-source";
import type { ContentUpdateBrief } from "@/types/content-update-brief";
import { refreshStore } from "@/lib/content-refresh/refresh-store";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export type SourceVerificationReport = {
  contentItemId: string;
  sources: ContentSourceRecord[];
  unsupportedClaims: string[];
  conflictingSources: string[][];
  requiresExpertReview: boolean;
  passed: boolean;
};

const OFFICIAL_REQUIRED_TYPES = new Set(["regulation", "technical-article"]);

export function collectSourcesForBrief(brief: ContentUpdateBrief): ContentSourceRecord[] {
  refreshAnalytics.trackRefreshSourceVerificationStarted({
    contentItemId: brief.contentItemId,
    briefId: brief.id,
  });

  const existing = refreshStore
    .listSourceRecords()
    .filter((s) => s.contentItemId === brief.contentItemId || s.updateBriefId === brief.id);

  return existing;
}

export function validateSource(source: ContentSourceRecord): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!source.title.trim()) errors.push("Source title required");
  if (source.status === "rejected") errors.push("Source was rejected");
  if (source.status === "unavailable") errors.push("Source unavailable");
  if (source.sourceType === "regulation" && !source.url) {
    errors.push("Regulatory source requires URL");
  }
  return { valid: errors.length === 0, errors };
}

export function detectOutdatedSource(source: ContentSourceRecord): boolean {
  if (source.status === "outdated") return true;
  if (!source.publishedAt) return false;
  const years = (Date.now() - new Date(source.publishedAt).getTime()) / (365 * 86400000);
  return source.sourceType === "regulation" && years > 3;
}

export function detectConflictingSources(sources: ContentSourceRecord[]): string[][] {
  const conflicts: string[][] = [];
  const byClaim = new Map<string, ContentSourceRecord[]>();

  for (const source of sources) {
    for (const claim of source.supportsClaims) {
      const list = byClaim.get(claim) ?? [];
      list.push(source);
      byClaim.set(claim, list);
    }
  }

  for (const [, group] of byClaim) {
    const statuses = new Set(group.map((s) => s.status));
    if (statuses.has("conflicting") || (statuses.has("verified") && statuses.has("rejected"))) {
      conflicts.push(group.map((s) => s.id));
    }
  }

  return conflicts;
}

export function mapClaimsToSources(
  claims: string[],
  sources: ContentSourceRecord[],
): Map<string, ContentSourceRecord[]> {
  const map = new Map<string, ContentSourceRecord[]>();
  for (const claim of claims) {
    const matched = sources.filter((s) => s.supportsClaims.includes(claim));
    map.set(claim, matched);
  }
  return map;
}

export function findUnsupportedClaims(
  content: { claims?: string[]; body?: string },
  sources: ContentSourceRecord[],
): string[] {
  const claims = content.claims ?? [];
  const unsupported: string[] = [];

  for (const claim of claims) {
    const supporting = sources.filter(
      (s) => s.supportsClaims.includes(claim) && s.status === "verified",
    );
    if (supporting.length === 0) unsupported.push(claim);
  }

  return unsupported;
}

export function buildSourceVerificationReport(
  content: { contentItemId: string; claims?: string[]; contentType?: string },
  sources: ContentSourceRecord[],
): SourceVerificationReport {
  const unsupportedClaims = findUnsupportedClaims(content, sources);
  const conflictingSources = detectConflictingSources(sources);
  const outdated = sources.filter(detectOutdatedSource);

  const requiresExpertReview =
    unsupportedClaims.length > 0 ||
    conflictingSources.length > 0 ||
    outdated.length > 0 ||
    Boolean(content.contentType && OFFICIAL_REQUIRED_TYPES.has(content.contentType));

  const passed =
    unsupportedClaims.length === 0 &&
    conflictingSources.length === 0 &&
    sources.every((s) => validateSource(s).valid);

  if (!passed) {
    refreshAnalytics.trackRefreshSourceVerificationFailed({
      contentItemId: content.contentItemId,
      reason: unsupportedClaims.length ? "unsupported_claims" : "source_validation_failed",
    });
  }

  return {
    contentItemId: content.contentItemId,
    sources,
    unsupportedClaims,
    conflictingSources,
    requiresExpertReview,
    passed,
  };
}

export function createSourceRecord(
  input: Omit<ContentSourceRecord, "id" | "accessedAt">,
): ContentSourceRecord {
  const record: ContentSourceRecord = {
    ...input,
    id: randomUUID(),
    accessedAt: new Date().toISOString(),
  };
  refreshStore.saveSourceRecord(record);
  return record;
}

export const sourceVerificationService = {
  collectSourcesForBrief,
  validateSource,
  detectOutdatedSource,
  detectConflictingSources,
  mapClaimsToSources,
  findUnsupportedClaims,
  buildSourceVerificationReport,
  createSourceRecord,
};
