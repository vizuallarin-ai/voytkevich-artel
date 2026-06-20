export type DiffChange<T = string> = {
  added: T[];
  removed: T[];
  changed: { before: T; after: T }[];
  moved: { item: T; from: number; to: number }[];
};

export type ContentDiffResult = {
  text: DiffChange;
  headings: DiffChange<{ level: number; text: string }>;
  metadata: DiffChange;
  internalLinks: DiffChange;
  externalLinks: DiffChange;
  cta: DiffChange;
  images: DiffChange;
  structuredData: DiffChange;
  canonical: { before?: string; after?: string; changed: boolean };
  magnitude: number;
  riskLevel: "low" | "medium" | "high";
  seoCriticalChanges: string[];
  businessCriticalChanges: string[];
  protectedElementsAffected: string[];
  humanReadable: string[];
};

type ContentLike = {
  title?: string;
  h1?: string;
  seoTitle?: string;
  seoDescription?: string;
  url?: string;
  body?: string;
  indexing?: { canonicalUrl?: string };
  related?: Record<string, string[] | undefined>;
};

function extractLinks(content: ContentLike): string[] {
  const links: string[] = [];
  if (content.related) {
    for (const arr of Object.values(content.related)) {
      if (arr) links.push(...arr);
    }
  }
  const body = content.body ?? "";
  const matches = body.match(/href="([^"]+)"/g) ?? [];
  for (const m of matches) {
    const url = m.replace(/href="([^"]+)"/, "$1");
    links.push(url);
  }
  return [...new Set(links)];
}

function extractHeadings(content: ContentLike): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  if (content.h1) headings.push({ level: 1, text: content.h1 });
  const body = content.body ?? "";
  for (let level = 1; level <= 6; level++) {
    const regex = new RegExp(`<h${level}[^>]*>([^<]+)</h${level}>`, "gi");
    let match;
    while ((match = regex.exec(body)) !== null) {
      headings.push({ level, text: match[1].trim() });
    }
  }
  return headings;
}

function diffArrays<T>(before: T[], after: T[]): DiffChange<T> {
  const beforeSet = new Set(before.map(String));
  const afterSet = new Set(after.map(String));
  return {
    added: after.filter((x) => !beforeSet.has(String(x))),
    removed: before.filter((x) => !afterSet.has(String(x))),
    changed: [],
    moved: [],
  };
}

export function compareTextContent(before: string, after: string): DiffChange {
  if (before === after) {
    return { added: [], removed: [], changed: [], moved: [] };
  }
  return {
    added: after.length > before.length ? ["content expanded"] : [],
    removed: after.length < before.length ? ["content reduced"] : [],
    changed: [{ before: `${before.length} chars`, after: `${after.length} chars` }],
    moved: [],
  };
}

export function compareHeadings(
  before: ContentLike,
  after: ContentLike,
): DiffChange<{ level: number; text: string }> {
  return diffArrays(extractHeadings(before), extractHeadings(after));
}

export function compareMetadata(before: ContentLike, after: ContentLike): DiffChange {
  const beforeMeta = [before.seoTitle, before.seoDescription, before.title].filter(Boolean) as string[];
  const afterMeta = [after.seoTitle, after.seoDescription, after.title].filter(Boolean) as string[];
  const result = diffArrays(beforeMeta, afterMeta);

  if (before.seoTitle !== after.seoTitle && before.seoTitle && after.seoTitle) {
    result.changed.push({ before: before.seoTitle, after: after.seoTitle });
  }
  if (before.seoDescription !== after.seoDescription && before.seoDescription && after.seoDescription) {
    result.changed.push({ before: before.seoDescription, after: after.seoDescription });
  }
  return result;
}

export function compareInternalLinks(before: ContentLike, after: ContentLike): DiffChange {
  return diffArrays(extractLinks(before), extractLinks(after));
}

export function compareExternalLinks(before: ContentLike, after: ContentLike): DiffChange {
  const filterExternal = (links: string[]) =>
    links.filter((l) => l.startsWith("http") && !l.includes("stroistroy"));
  return diffArrays(filterExternal(extractLinks(before)), filterExternal(extractLinks(after)));
}

export function compareCTA(before: ContentLike, after: ContentLike): DiffChange {
  const extractCta = (c: ContentLike) => {
    const body = c.body ?? "";
    return (body.match(/data-cta="[^"]+"/g) ?? []) as string[];
  };
  return diffArrays(extractCta(before), extractCta(after));
}

export function compareImages(before: ContentLike, after: ContentLike): DiffChange {
  const extractImages = (c: ContentLike) => (c.body?.match(/<img[^>]+>/g) ?? []) as string[];
  return diffArrays(extractImages(before), extractImages(after));
}

export function compareStructuredData(before: ContentLike, after: ContentLike): DiffChange {
  const extract = (c: ContentLike) =>
    (c.body?.match(/application\/ld\+json[^<]+<\/script>/g) ?? []) as string[];
  return diffArrays(extract(before), extract(after));
}

export function compareCanonical(before: ContentLike, after: ContentLike): ContentDiffResult["canonical"] {
  const b = before.indexing?.canonicalUrl ?? before.url;
  const a = after.indexing?.canonicalUrl ?? after.url;
  return { before: b, after: a, changed: b !== a };
}

export function calculateChangeMagnitude(diff: Omit<ContentDiffResult, "magnitude" | "riskLevel" | "humanReadable">): number {
  let score = 0;
  score += diff.text.removed.length * 3 + diff.text.added.length;
  score += diff.headings.removed.length * 5 + diff.headings.added.length * 2;
  score += diff.metadata.changed.length * 4;
  score += diff.internalLinks.removed.length * 3;
  score += diff.canonical.changed ? 10 : 0;
  score += diff.structuredData.changed.length * 3;
  return Math.min(100, score);
}

export function classifyChangeRisk(
  diff: Omit<ContentDiffResult, "riskLevel" | "humanReadable">,
): "low" | "medium" | "high" {
  if (diff.canonical.changed) return "high";
  if (diff.headings.removed.some((h) => h.level === 1)) return "high";
  if (diff.internalLinks.removed.length > 2) return "high";
  if (diff.magnitude >= 40) return "high";
  if (diff.magnitude >= 15) return "medium";
  return "low";
}

export function buildHumanReadableDiff(diff: ContentDiffResult): string[] {
  const lines: string[] = [];
  if (diff.text.added.length) lines.push(`Added: ${diff.text.added.join(", ")}`);
  if (diff.text.removed.length) lines.push(`Removed: ${diff.text.removed.join(", ")}`);
  if (diff.headings.removed.length) {
    lines.push(`Headings removed: ${diff.headings.removed.map((h) => `H${h.level} ${h.text}`).join(", ")}`);
  }
  if (diff.metadata.changed.length) {
    lines.push(`Metadata changed: ${diff.metadata.changed.length} field(s)`);
  }
  if (diff.canonical.changed) lines.push("Canonical URL changed");
  if (diff.internalLinks.removed.length) {
    lines.push(`Internal links removed: ${diff.internalLinks.removed.length}`);
  }
  if (diff.protectedElementsAffected.length) {
    lines.push(`Protected elements affected: ${diff.protectedElementsAffected.join(", ")}`);
  }
  return lines;
}

export function buildContentDiff(before: ContentLike, after: ContentLike): ContentDiffResult {
  const text = compareTextContent(before.body ?? "", after.body ?? "");
  const headings = compareHeadings(before, after);
  const metadata = compareMetadata(before, after);
  const internalLinks = compareInternalLinks(before, after);
  const externalLinks = compareExternalLinks(before, after);
  const cta = compareCTA(before, after);
  const images = compareImages(before, after);
  const structuredData = compareStructuredData(before, after);
  const canonical = compareCanonical(before, after);

  const seoCriticalChanges: string[] = [];
  const businessCriticalChanges: string[] = [];
  const protectedElementsAffected: string[] = [];

  if (canonical.changed) {
    seoCriticalChanges.push("canonical");
    protectedElementsAffected.push("canonical");
  }
  if (headings.removed.some((h) => h.level === 1)) {
    seoCriticalChanges.push("h1-removed");
    protectedElementsAffected.push("H1");
  }
  if (metadata.changed.length) seoCriticalChanges.push("metadata");
  if (cta.removed.length) businessCriticalChanges.push("cta-removed");
  if (internalLinks.removed.length) businessCriticalChanges.push("internal-links-removed");

  const partial = {
    text,
    headings,
    metadata,
    internalLinks,
    externalLinks,
    cta,
    images,
    structuredData,
    canonical,
    magnitude: 0,
    seoCriticalChanges,
    businessCriticalChanges,
    protectedElementsAffected,
  };

  partial.magnitude = calculateChangeMagnitude(partial);
  const riskLevel = classifyChangeRisk(partial);

  const result: ContentDiffResult = {
    ...partial,
    riskLevel,
    humanReadable: [],
  };
  result.humanReadable = buildHumanReadableDiff(result);
  return result;
}

export const contentDiffService = {
  compareTextContent,
  compareHeadings,
  compareMetadata,
  compareInternalLinks,
  compareExternalLinks,
  compareCTA,
  compareImages,
  compareStructuredData,
  compareCanonical,
  calculateChangeMagnitude,
  classifyChangeRisk,
  buildHumanReadableDiff,
  buildContentDiff,
};
