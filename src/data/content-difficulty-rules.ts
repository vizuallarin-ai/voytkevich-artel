import type { CMSContentKind } from "@/types/content-cms";

export type ContentDifficultyRule = {
  kinds: CMSContentKind[];
  keywords: RegExp[];
  difficulty: "high" | "medium" | "low";
  requiresExpert: boolean;
  scorePenalty: number;
};

export const contentDifficultyRules: ContentDifficultyRule[] = [
  {
    kinds: ["technical-article"],
    keywords: [/фундамент|конструктив|норматив|юрид|инженер|смет.*точн/i],
    difficulty: "high",
    requiresExpert: true,
    scorePenalty: 15,
  },
  {
    kinds: ["technical-article"],
    keywords: [/утепл|материал|сравнен|участок|ошибк/i],
    difficulty: "medium",
    requiresExpert: false,
    scorePenalty: 8,
  },
  {
    kinds: ["editorial-content", "news", "digest"],
    keywords: [/.*/],
    difficulty: "low",
    requiresExpert: false,
    scorePenalty: 0,
  },
  {
    kinds: ["programmatic-page", "landing-page"],
    keywords: [/.*/],
    difficulty: "low",
    requiresExpert: false,
    scorePenalty: 5,
  },
];

export function getContentDifficulty(
  kind: CMSContentKind,
  text: string,
): { difficulty: "high" | "medium" | "low"; penalty: number; requiresExpert: boolean } {
  for (const rule of contentDifficultyRules) {
    if (!rule.kinds.includes(kind)) continue;
    if (rule.keywords.some((pattern) => pattern.test(text))) {
      return {
        difficulty: rule.difficulty,
        penalty: rule.scorePenalty,
        requiresExpert: rule.requiresExpert,
      };
    }
  }
  return { difficulty: "medium", penalty: 8, requiresExpert: false };
}
