export const DISTRIBUTION_RULES = [
  {
    id: "teaser-only",
    rule: "На внешних площадках только teaser, не полная статья",
    blocks: ["full-article-duplicate", "publish-without-teaser"],
  },
  {
    id: "utm-required",
    rule: "Teaser без UTM нельзя approve/publish",
    blocks: ["missing-utm"],
  },
  {
    id: "full-article-first",
    rule: "Полная статья должна быть published на сайте",
    blocks: ["full-article-not-published"],
  },
  {
    id: "no-auto-without-adapter",
    rule: "Auto-publish только при adapter active",
    blocks: ["auto-publish-needs-api"],
  },
  {
    id: "manual-export-honest",
    rule: "Manual export не считается автопостингом",
    blocks: ["fake-auto-success"],
  },
  {
    id: "ai-teaser-review",
    rule: "AI-generated teaser требует review",
    blocks: ["ai-teaser-skip-review"],
  },
  {
    id: "canonical-clean",
    rule: "Canonical URL без UTM; UTM только для переходов",
    blocks: ["utm-in-canonical"],
  },
  {
    id: "no-deceptive-clickbait",
    rule: "Запрет обманного кликбейта",
    blocks: ["deceptive-clickbait"],
  },
  {
    id: "no-fake-claims",
    rule: "Запрет фейковых кейсов и обещаний",
    blocks: ["fake-claim"],
  },
] as const;

export const FULL_DUPLICATE_THRESHOLD = 0.85;

export const CLICKBAIT_PATTERNS = [
  /100% гарант/i,
  /точная цена/i,
  /бесплатно навсегда/i,
  /секретная схема/i,
  /шокирующ/i,
];

export const SITE_HOST = "stroistroy.ru";
