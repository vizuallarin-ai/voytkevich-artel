import type { KeywordDemandItem, KeywordCSVRow } from "@/types/keyword-demand";
import type { KeywordDemandSource, KeywordIntent, KeywordDemandRegion } from "@/types/keyword-demand";

export function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseKeywordCSV(text: string): KeywordCSVRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0]!.split(/[,;\t]/).map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.findIndex((h) => h === name || h.includes(name));

  const idx = {
    keyword: col("keyword") >= 0 ? col("keyword") : 0,
    searchVolume: col("searchvolume") >= 0 ? col("searchvolume") : col("volume"),
    impressions: col("impressions"),
    clicks: col("clicks"),
    ctr: col("ctr"),
    avgPosition: col("avgposition") >= 0 ? col("avgposition") : col("position"),
    difficulty: col("difficulty"),
    competition: col("competition"),
    region: col("region"),
    source: col("source"),
    cluster: col("cluster"),
    intent: col("intent"),
  };

  return lines.slice(1).map((line) => {
    const cells = line.split(/[,;\t]/).map((c) => c.trim());
    const get = (i: number) => (i >= 0 && cells[i] ? cells[i] : undefined);
    return {
      keyword: get(idx.keyword) ?? "",
      searchVolume: get(idx.searchVolume),
      impressions: get(idx.impressions),
      clicks: get(idx.clicks),
      ctr: get(idx.ctr),
      avgPosition: get(idx.avgPosition),
      difficulty: get(idx.difficulty),
      competition: get(idx.competition),
      region: get(idx.region),
      source: get(idx.source),
      cluster: get(idx.cluster),
      intent: get(idx.intent),
    };
  });
}

export function validateKeywordCSV(rows: KeywordCSVRow[]): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rows.length) errors.push("CSV пуст или неверный формат");

  rows.forEach((row, i) => {
    if (!row.keyword?.trim()) errors.push(`Строка ${i + 2}: пустой keyword`);
    if (row.searchVolume && Number.isNaN(Number(row.searchVolume))) {
      warnings.push(`Строка ${i + 2}: searchVolume не число — будет null`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

function parseNum(val?: string): number | null {
  if (!val?.trim()) return null;
  const n = Number(val.replace(/\s/g, ""));
  return Number.isFinite(n) ? n : null;
}

function mapRegion(val?: string): KeywordDemandRegion {
  if (!val) return "unknown";
  const v = val.toLowerCase();
  if (v.includes("irkutsk") && v.includes("region")) return "irkutsk-region";
  if (v.includes("irkutsk") || v.includes("иркутск")) return "irkutsk";
  if (v.includes("russia") || v.includes("россия")) return "russia";
  return "unknown";
}

function mapIntent(val?: string): KeywordIntent {
  if (!val) return "unknown";
  const v = val.toLowerCase() as KeywordIntent;
  const allowed: KeywordIntent[] = [
    "commercial",
    "informational",
    "transactional",
    "comparison",
    "local",
    "editorial",
    "unknown",
  ];
  return allowed.includes(v) ? v : "unknown";
}

export function mapCSVRowsToKeywordDemandItems(rows: KeywordCSVRow[]): KeywordDemandItem[] {
  const now = new Date().toISOString();
  return rows
    .filter((r) => r.keyword?.trim())
    .map((row, i) => ({
      id: `kw-import-${Date.now()}-${i}`,
      keyword: row.keyword.trim(),
      normalizedKeyword: normalizeKeyword(row.keyword),
      region: mapRegion(row.region),
      source: (row.source as KeywordDemandSource) ?? "csv-import",
      metrics: {
        searchVolume: parseNum(row.searchVolume),
        impressions: parseNum(row.impressions),
        clicks: parseNum(row.clicks),
        ctr: parseNum(row.ctr),
        avgPosition: parseNum(row.avgPosition),
        keywordDifficulty: parseNum(row.difficulty),
        competition:
          row.competition === "high" || row.competition === "medium" || row.competition === "low"
            ? row.competition
            : "unknown",
      },
      intent: mapIntent(row.intent),
      mappedTo: { clusterId: row.cluster },
      status: row.cluster ? "mapped" : "needs-mapping",
      importedAt: now,
      updatedAt: now,
    }));
}

export function deduplicateKeywords(items: KeywordDemandItem[]): {
  unique: KeywordDemandItem[];
  duplicates: KeywordDemandItem[];
} {
  const seen = new Map<string, KeywordDemandItem>();
  const duplicates: KeywordDemandItem[] = [];

  for (const item of items) {
    const key = `${item.normalizedKeyword}:${item.region}`;
    if (seen.has(key)) {
      duplicates.push(item);
      item.status = "duplicate";
    } else {
      seen.set(key, item);
    }
  }

  return { unique: [...seen.values()], duplicates };
}
