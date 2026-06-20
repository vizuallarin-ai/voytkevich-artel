import type { IndexablePageInput } from "@/lib/seo-indexation/indexable-page";
import { SITE_URL } from "@/lib/seo";

export type CanonicalValidationResult = {
  valid: boolean;
  url?: string;
  issues: string[];
};

export type CanonicalChainResult = {
  hasChain: boolean;
  hasLoop: boolean;
  chain: string[];
  loopAt?: string;
};

export type CanonicalConflict = {
  url: string;
  canonicalUrl: string;
  conflictType: "cross-domain" | "multiple-sources" | "chain" | "loop" | "mismatch";
  message: string;
  relatedUrls: string[];
};

export type CanonicalRecommendation = {
  recommendedUrl: string;
  reason: string;
  confidence: "high" | "medium" | "low";
};

function normalizeAbsoluteUrl(url: string): string {
  try {
    const parsed = new URL(url, SITE_URL);
    parsed.hash = "";
    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString().replace(/\/$/, "") || SITE_URL;
  } catch {
    return url;
  }
}

export function resolveCanonicalUrl(page: IndexablePageInput): string {
  if (page.canonicalUrl) {
    return normalizeAbsoluteUrl(page.canonicalUrl);
  }
  return normalizeAbsoluteUrl(page.url);
}

export function validateCanonicalUrl(url: string): CanonicalValidationResult {
  const issues: string[] = [];

  try {
    const parsed = new URL(url, SITE_URL);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      issues.push("Недопустимый протокол canonical");
    }
    if (parsed.hostname && !parsed.hostname.includes(new URL(SITE_URL).hostname)) {
      issues.push("Canonical указывает на другой домен");
    }
    if (!parsed.pathname) {
      issues.push("Пустой path в canonical");
    }

    return {
      valid: issues.length === 0,
      url: normalizeAbsoluteUrl(parsed.toString()),
      issues,
    };
  } catch {
    return { valid: false, issues: ["Невалидный URL canonical"] };
  }
}

export function isSelfCanonical(page: IndexablePageInput): boolean {
  const canonical = resolveCanonicalUrl(page);
  const self = normalizeAbsoluteUrl(page.url);
  return canonical === self;
}

export function detectCanonicalChain(
  pages: IndexablePageInput[],
  maxDepth = 10,
): CanonicalChainResult {
  const canonicalMap = new Map<string, string>();
  for (const page of pages) {
    const self = normalizeAbsoluteUrl(page.url);
    const canonical = resolveCanonicalUrl(page);
    if (canonical !== self) {
      canonicalMap.set(self, canonical);
    }
  }

  for (const [start] of canonicalMap) {
    const chain: string[] = [start];
    const visited = new Set<string>([start]);
    let current = start;

    for (let depth = 0; depth < maxDepth; depth++) {
      const next = canonicalMap.get(current);
      if (!next) break;
      if (visited.has(next)) {
        return { hasChain: chain.length > 1, hasLoop: true, chain: [...chain, next], loopAt: next };
      }
      chain.push(next);
      visited.add(next);
      current = next;
    }

    if (chain.length > 1) {
      return { hasChain: true, hasLoop: false, chain };
    }
  }

  return { hasChain: false, hasLoop: false, chain: [] };
}

export function detectCanonicalLoop(pages: IndexablePageInput[]): boolean {
  return detectCanonicalChain(pages).hasLoop;
}

export function findCanonicalConflicts(pages: IndexablePageInput[]): CanonicalConflict[] {
  const conflicts: CanonicalConflict[] = [];
  const byCanonical = new Map<string, IndexablePageInput[]>();

  for (const page of pages) {
    const canonical = resolveCanonicalUrl(page);
    const group = byCanonical.get(canonical) ?? [];
    group.push(page);
    byCanonical.set(canonical, group);
  }

  for (const [canonical, group] of byCanonical) {
    if (group.length > 1) {
      const uniqueUrls = [...new Set(group.map((p) => normalizeAbsoluteUrl(p.url)))];
      if (uniqueUrls.length > 1) {
        conflicts.push({
          url: uniqueUrls[0],
          canonicalUrl: canonical,
          conflictType: "multiple-sources",
          message: `${group.length} страниц указывают на один canonical`,
          relatedUrls: uniqueUrls,
        });
      }
    }
  }

  for (const page of pages) {
    const validation = validateCanonicalUrl(resolveCanonicalUrl(page));
    if (!validation.valid) {
      conflicts.push({
        url: normalizeAbsoluteUrl(page.url),
        canonicalUrl: page.canonicalUrl ?? page.url,
        conflictType: "mismatch",
        message: validation.issues.join("; "),
        relatedUrls: [normalizeAbsoluteUrl(page.url)],
      });
    }

    const canonical = resolveCanonicalUrl(page);
    const self = normalizeAbsoluteUrl(page.url);
    if (canonical !== self) {
      try {
        const canonicalHost = new URL(canonical).hostname;
        const selfHost = new URL(self).hostname;
        if (canonicalHost !== selfHost) {
          conflicts.push({
            url: self,
            canonicalUrl: canonical,
            conflictType: "cross-domain",
            message: "Canonical на другом домене",
            relatedUrls: [self, canonical],
          });
        }
      } catch {
        // invalid URL handled above
      }
    }
  }

  const chain = detectCanonicalChain(pages);
  if (chain.hasLoop) {
    conflicts.push({
      url: chain.chain[0] ?? "",
      canonicalUrl: chain.loopAt ?? "",
      conflictType: "loop",
      message: "Обнаружена петля canonical",
      relatedUrls: chain.chain,
    });
  } else if (chain.hasChain) {
    conflicts.push({
      url: chain.chain[0] ?? "",
      canonicalUrl: chain.chain[chain.chain.length - 1] ?? "",
      conflictType: "chain",
      message: "Обнаружена цепочка canonical",
      relatedUrls: chain.chain,
    });
  }

  return conflicts;
}

export function recommendCanonical(page: IndexablePageInput, candidates: IndexablePageInput[] = []): CanonicalRecommendation {
  const self = normalizeAbsoluteUrl(page.url);

  if (page.explicitNoindex && candidates.length > 0) {
    const published = candidates.find((c) => c.status === "published" && c.id !== page.id);
    if (published) {
      return {
        recommendedUrl: normalizeAbsoluteUrl(published.url),
        reason: "noindex-страница должна canonical на опубликованный дубль",
        confidence: "high",
      };
    }
  }

  if (page.seo.cannibalizationRisk === "high" && candidates.length > 0) {
    const primary = candidates.find((c) => c.seo.priority === "P1" || c.seo.priority === "P2");
    if (primary) {
      return {
        recommendedUrl: normalizeAbsoluteUrl(primary.url),
        reason: "High cannibalization — canonical на P1/P2",
        confidence: "medium",
      };
    }
  }

  return {
    recommendedUrl: self,
    reason: "Self-canonical по умолчанию",
    confidence: "high",
  };
}

export function explainCanonicalDecision(page: IndexablePageInput): string {
  const canonical = resolveCanonicalUrl(page);
  const self = normalizeAbsoluteUrl(page.url);

  if (canonical === self) {
    return `Self-canonical: ${self}`;
  }

  const validation = validateCanonicalUrl(canonical);
  if (!validation.valid) {
    return `Canonical ${canonical} невалиден: ${validation.issues.join(", ")}`;
  }

  return `Canonical ${canonical} отличается от URL ${self}`;
}
