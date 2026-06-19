export type LocalDemandTier = "P1" | "P2" | "P3";

export type LocalDemandRule = {
  pattern: RegExp;
  tier: LocalDemandTier;
  score: number;
  label: string;
};

export const localDemandRules: LocalDemandRule[] = [
  { pattern: /иркутск(?!ская)/i, tier: "P1", score: 95, label: "Иркутск" },
  { pattern: /иркутск(ая|ой) област/i, tier: "P1", score: 90, label: "Иркутская область" },
  { pattern: /иркутск(ий|ом) район/i, tier: "P1", score: 88, label: "Иркутский район" },
  { pattern: /ангarsk|ангарск/i, tier: "P2", score: 75, label: "Ангарск" },
  { pattern: /шелехов/i, tier: "P2", score: 72, label: "Шелехов" },
  { pattern: /хомутово/i, tier: "P2", score: 78, label: "Хомутово" },
  { pattern: /мамон/i, tier: "P2", score: 76, label: "Мамоны" },
  { pattern: /маркова/i, tier: "P2", score: 70, label: "Маркова" },
  { pattern: /молодёжн|молодежн/i, tier: "P2", score: 68, label: "Молодёжный" },
  { pattern: /пивоварих/i, tier: "P2", score: 68, label: "Пивовариха" },
  { pattern: /байкальск(ий|ого) тракт/i, tier: "P2", score: 74, label: "Байкальский тракт" },
  { pattern: /усолье/i, tier: "P3", score: 55, label: "Усолье-Сибирское" },
  { pattern: /братск/i, tier: "P3", score: 52, label: "Братск" },
  { pattern: /александровск(ий|ого) тракт/i, tier: "P3", score: 58, label: "Александровский тракт" },
  { pattern: /мельничн(ый|ого) тракт/i, tier: "P3", score: 56, label: "Мельничный тракт" },
];

export function scoreLocalDemand(text: string): { score: number; tier?: LocalDemandTier; label?: string } {
  for (const rule of localDemandRules) {
    if (rule.pattern.test(text)) {
      return { score: rule.score, tier: rule.tier, label: rule.label };
    }
  }
  return { score: 40 };
}
