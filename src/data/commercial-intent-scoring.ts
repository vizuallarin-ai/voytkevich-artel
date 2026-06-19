export type CommercialPattern = { pattern: RegExp; score: number; label: string };

export const commercialIntentPatterns: CommercialPattern[] = [
  { pattern: /под ключ/i, score: 95, label: "под ключ" },
  { pattern: /цена|стоимость|сколько стоит/i, score: 90, label: "цена/стоимость" },
  { pattern: /рассчитать|калькулятор|смет/i, score: 88, label: "расчёт/смета" },
  { pattern: /заказать|построить|строительство/i, score: 85, label: "строительство" },
  { pattern: /иркутск|иркутской области/i, score: 80, label: "регион" },
  { pattern: /проект/i, score: 65, label: "проект" },
  { pattern: /материал|брус|газобетон|каркас/i, score: 60, label: "материал" },
  { pattern: /площад|этаж/i, score: 55, label: "типоразмер" },
];

export function scoreCommercialIntent(text: string): number {
  let score = 30;
  for (const p of commercialIntentPatterns) {
    if (p.pattern.test(text)) score = Math.max(score, p.score);
  }
  return score;
}

export function commercialIntentLevel(score: number): "high" | "medium" | "low" {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}
