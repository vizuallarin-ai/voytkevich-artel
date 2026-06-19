export const contentScheduleRules = {
  rules: [
    "Полная статья на сайте должна публиковаться раньше teaser-публикаций",
    "Teaser нельзя планировать раньше full article",
    "Draft/review/ai-generated нельзя планировать",
    "News без source нельзя планировать",
    "Technical article без expert review нельзя планировать, если review required",
    "Fictionalized story без notice нельзя планировать",
    "Noindex content можно планировать только как осознанное решение",
    "External teaser требует UTM",
    "External teaser требует fullArticlePublished или scheduledBeforeTeaser",
    "Manual export не считается published, пока не указан publishedUrl",
  ],
  blockedStatuses: ["draft", "review", "ai-generated", "needs-source", "needs-fact-check", "needs-expert-review", "rejected"],
  schedulableStatuses: ["approved", "scheduled"],
  publishableStatuses: ["approved", "scheduled"],
} as const;

export type ContentScheduleRuleId = (typeof contentScheduleRules.rules)[number];
