export const AI_CONTENT_SAFETY_RULES = [
  {
    id: "no-auto-publish",
    rule: "AI не публикует контент",
    reason: "Риск фейковых данных и thin content в индексе",
    blocks: ["publish", "approve", "indexable-true", "sitemap-true"],
  },
  {
    id: "no-ai-approve",
    rule: "AI не approve",
    reason: "Финальное решение — за редактором",
    blocks: ["status-approved", "canApprove-true"],
  },
  {
    id: "no-fake-cases",
    rule: "AI не выдумывает реальные кейсы",
    reason: "Юридические и репутационные риски",
    blocks: ["fake-case-claims", "мы-построили-without-source"],
  },
  {
    id: "no-fake-reviews",
    rule: "AI не выдумывает отзывы",
    reason: "Нарушение доверия и рекламного законодательства",
    blocks: ["client-said", "fake-review"],
  },
  {
    id: "no-fake-sources",
    rule: "AI не выдумывает источники",
    reason: "Fact-check и E-E-A-T",
    blocks: ["news-without-source", "regulation-without-source"],
  },
  {
    id: "no-fake-documents",
    rule: "AI не выдумывает документы",
    reason: "Нормативные и договорные риски",
    blocks: ["fake-gost", "fake-permit"],
  },
  {
    id: "no-exact-prices",
    rule: "AI не выдумывает цены",
    reason: "Цены зависят от сметы и объекта",
    blocks: ["exact-price", "от-X-руб-guarantee"],
  },
  {
    id: "no-exact-estimate",
    rule: "AI не обещает точную смету",
    reason: "Смета требует замера и проекта",
    blocks: ["online-exact-estimate"],
  },
  {
    id: "no-dangerous-instructions",
    rule: "AI не даёт опасные технические инструкции",
    reason: "Безопасность стройки и ответственность",
    blocks: ["diy-electrical", "load-bearing-removal"],
  },
  {
    id: "fiction-notice",
    rule: "AI не выдаёт fiction за real story",
    reason: "Прозрачность редакционного контента",
    blocks: ["editorial-without-fiction-notice"],
  },
  {
    id: "news-needs-source",
    rule: "AI не создаёт news без source",
    reason: "Дезинформация и юридические риски",
    blocks: ["news-draft-without-source"],
  },
  {
    id: "regulation-fact-check",
    rule: "AI не создаёт regulation update без fact-check",
    reason: "Нормативы меняются, нужен эксперт",
    blocks: ["snip-change-without-source"],
  },
  {
    id: "no-unsupported-legal",
    rule: "AI не делает exact legal/engineering claims без проверки",
    reason: "Ответственность за неверные нормы",
    blocks: ["unsupported-legal-claim"],
  },
  {
    id: "status-ai-generated",
    rule: "AI always sets status ai-generated",
    reason: "Прозрачность происхождения контента",
    blocks: ["status-published", "status-approved"],
  },
  {
    id: "always-review",
    rule: "AI output always requires review",
    reason: "Quality gate перед индексацией",
    blocks: ["skip-review", "canPublish-true"],
  },
] as const;

export const AI_FORBIDDEN_PHRASES = [
  "клиент сказал",
  "мы построили этот дом",
  "точная смета онлайн",
  "гарантируем цену",
  "от \\d+ руб",
  "по закону обязаны",
  "согласно новому закону",
  "реальный отзыв",
  "наш клиент иван",
];

export const AI_REQUIRED_DISCLAIMER_MARKERS = [
  "информационный характер",
  "не является инженерным расчётом",
  "требует консультации специалиста",
  "ориентировочно",
];
