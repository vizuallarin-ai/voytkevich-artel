import type { SearchIntent } from "@/types/search-query";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";

export type QueryIntentDetection = {
  intent: SearchIntent;
  confidence: "low" | "medium" | "high";
  signals: string[];
};

const INTENT_PATTERNS: Array<{ intent: SearchIntent; confidence: QueryIntentDetection["confidence"]; pattern: RegExp; signal: string }> = [
  { intent: "commercial", confidence: "high", pattern: /цена|стоим|стоит|под ключ|рассчитать|заказать|смета/i, signal: "commercial-keywords" },
  { intent: "comparison", confidence: "high", pattern: /\bvs\b|сравн|или что лучше|\s+или\s+/i, signal: "comparison-keywords" },
  { intent: "project-selection", confidence: "high", pattern: /проект|планировка|типовой|каталог/i, signal: "project-selection-keywords" },
  { intent: "local", confidence: "high", pattern: /иркутск|ангарск|шелехов|маркова|хомутово|область/i, signal: "local-keywords" },
  { intent: "navigational", confidence: "medium", pattern: /контакты|адрес|о компании|доставка|гарантии/i, signal: "navigational-keywords" },
  { intent: "informational", confidence: "medium", pattern: /как|что|почему|ошибк|инструкция|гайд/i, signal: "informational-keywords" },
];

function rankConfidence(matches: QueryIntentDetection["confidence"][]): QueryIntentDetection["confidence"] {
  if (matches.includes("high")) return "high";
  if (matches.includes("medium")) return "medium";
  return "low";
}

export function detectQueryIntent(rawQuery: string): QueryIntentDetection {
  const query = queryNormalizationService.normalizeSearchQuery(rawQuery);
  const matches = INTENT_PATTERNS.filter((entry) => entry.pattern.test(query));

  if (matches.length === 0) {
    return { intent: "unknown", confidence: "low", signals: [] };
  }

  const top = matches[0];
  return {
    intent: top.intent,
    confidence: rankConfidence(matches.map((item) => item.confidence)),
    signals: matches.map((entry) => entry.signal),
  };
}

export const queryIntentService = {
  detectQueryIntent,
};
