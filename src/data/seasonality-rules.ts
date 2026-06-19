export type SeasonalityRule = {
  id: string;
  title: string;
  months: number[];
  relatedClusters: string[];
  scoreBoost: number;
  notes: string;
};

export const seasonalityRules: SeasonalityRule[] = [
  {
    id: "spring-start",
    title: "Весна — участок, фундамент, старт стройки",
    months: [3, 4, 5],
    relatedClusters: ["foundation", "land", "planning", "estimate", "projects"],
    scoreBoost: 12,
    notes: "Рост спроса на подготовку к сезону",
  },
  {
    id: "summer-build",
    title: "Лето — стройка, бани, материалы",
    months: [6, 7, 8],
    relatedClusters: ["turnkey", "materials", "projects", "engineering"],
    scoreBoost: 10,
    notes: "Активная фаза строительства",
  },
  {
    id: "autumn-envelope",
    title: "Осень — утепление, кровля, тёплый контур",
    months: [9, 10, 11],
    relatedClusters: ["engineering", "materials", "mistakes"],
    scoreBoost: 10,
    notes: "Подготовка к зиме",
  },
  {
    id: "winter-planning",
    title: "Зима — проектирование, смета, планирование",
    months: [12, 1, 2],
    relatedClusters: ["planning", "estimate", "cost", "design", "mortgage"],
    scoreBoost: 8,
    notes: "Планирование на следующий сезон",
  },
];

export function getSeasonalityBoost(clusterId: string | undefined, date = new Date()): number {
  const month = date.getMonth() + 1;
  let boost = 0;
  for (const rule of seasonalityRules) {
    if (rule.months.includes(month) && clusterId && rule.relatedClusters.includes(clusterId)) {
      boost = Math.max(boost, rule.scoreBoost);
    }
  }
  return boost;
}
