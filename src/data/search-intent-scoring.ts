export type IntentPattern = {
  pattern: RegExp;
  intent: "commercial" | "informational" | "transactional" | "comparison" | "local" | "editorial";
  score: number;
};

export const searchIntentPatterns: IntentPattern[] = [
  { pattern: /под ключ|цена|стоимость|рассчитать|заказать|смет/i, intent: "commercial", score: 90 },
  { pattern: /строительство домов|дом под ключ|баня под ключ/i, intent: "commercial", score: 85 },
  { pattern: /иркутск|иркутской области|хомутово|мамон/i, intent: "local", score: 80 },
  { pattern: /проект дома|проекты домов|типоразмер/i, intent: "commercial", score: 70 },
  { pattern: /как выбрать|как читать|ошибки|как проверить/i, intent: "informational", score: 75 },
  { pattern: /как утеплить|как выбрать материал|что входит/i, intent: "informational", score: 60 },
  { pattern: /vs|или|сравнение|что лучше/i, intent: "comparison", score: 65 },
  { pattern: /история|дайджест|мнение|вопрос недели/i, intent: "editorial", score: 40 },
];

export function scoreSearchIntent(text: string): { intent: string; score: number } {
  let best = { intent: "unknown", score: 40 };
  for (const p of searchIntentPatterns) {
    if (p.pattern.test(text) && p.score > best.score) {
      best = { intent: p.intent, score: p.score };
    }
  }
  return best;
}
