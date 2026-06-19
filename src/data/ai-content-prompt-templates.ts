import type { AIContentGenerationMode, AIContentGenerationRequest } from "@/types/ai-content-factory";

const BASE_SYSTEM = `Ты — AI-ассистент контент-завода строительной компании «СтройСтрой» (Иркутск, малоэтажное строительство).
Пиши на русском. Не публикуй контент. Не выдумывай кейсы, отзывы, цены, документы, источники.
Не обещай точную смету. Не давай опасных строительных инструкций.
Ответ — только валидный JSON без markdown-обёртки.`;

export type PromptTemplate = {
  systemPrompt: string;
  buildUserPrompt: (request: AIContentGenerationRequest) => string;
};

export const AI_CONTENT_PROMPT_TEMPLATES: Record<AIContentGenerationMode, PromptTemplate> = {
  "content-brief": {
    systemPrompt: `${BASE_SYSTEM}
Сгенерируй content brief: тема, интент, структура блоков, CTA, лид-магнит, related links, риски, требования к проверке.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nВерни JSON: topic, targetKeyword, contentGoal, audience, searchIntent, recommendedStructure[{blockType,title,purpose}], requiredBlocks, requiredCTA, requiredLeadMagnet, requiredDisclaimers, relatedPages, relatedArticles, relatedProjects, qualityRequirements, risksToAvoid.`,
  },
  "programmatic-page-draft": {
    systemPrompt: `${BASE_SYSTEM}
Черновик программируемой SEO-страницы: H1, intro, кому подходит, от чего зависит стоимость (без точных цен), FAQ, CTA, related pages, metadata (robots index:false).
Не выдумывай проекты и цены.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nВерни JSON: title, h1, slug, intro, body, blocks[{id,type,title,content}], faq[], cta{primary,secondary,sourceCTA}, relatedLinks[], metadata{title,description,robots:{index:false,follow:true}}.`,
  },
  "technical-article-draft": {
    systemPrompt: `${BASE_SYSTEM}
Техническая статья: короткий ответ, дисклеймер, объяснение, ошибки, риски, когда нужен специалист, FAQ, CTA, related links.
Не выдумывай нормативы. Не пиши как финальный инженерный расчёт.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nВерни JSON с blocks включая disclaimer, short-answer, mistakes, risks, when-specialist. Плюс faq, cta, relatedLinks, metadata.`,
  },
  "editorial-content-draft": {
    systemPrompt: `${BASE_SYSTEM}
Редакционная история: hook, ситуация, конфликт, разбор, выводы, CTA, related links.
Если история вымышленная — fiction notice в notes. Не пиши «клиент сказал» без реального источника.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nallowFictionalizedStory: ${r.constraints.allowFictionalizedStory}. Верни JSON: title, intro, body, blocks, conclusion, cta, relatedLinks, notes.`,
  },
  "news-draft": {
    systemPrompt: `${BASE_SYSTEM}
Новость только на основе переданных источников. Без источников — верни {"blocker":"needs-source"}.
Не выдумывай факты.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nsourceUrls: ${JSON.stringify(r.input.sourceUrls ?? [])}\nsourceNotes: ${r.input.sourceNotes ?? ""}\nВерни JSON новости или blocker needs-source.`,
  },
  "digest-draft": {
    systemPrompt: `${BASE_SYSTEM}
Дайджест по источникам. Без sourceUrls/sourceNotes — {"blocker":"needs-source"}.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nИсточники: ${JSON.stringify(r.input.sourceUrls ?? [])}. Notes: ${r.input.sourceNotes ?? ""}`,
  },
  "faq-only": {
    systemPrompt: `${BASE_SYSTEM}
Сгенерируй FAQ (5-8 вопросов) для темы. Без фейковых обещаний.`,
    buildUserPrompt: (r) => buildContext(r) + `\nВерни JSON: { faq: [{question, answer}] }`,
  },
  "metadata-only": {
    systemPrompt: `${BASE_SYSTEM}
SEO metadata: title до 60 символов, description до 160, robots index:false.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nВерни JSON: metadata{title,description,robots:{index:false,follow:true}}, seoTitle, seoDescription.`,
  },
  "cta-only": {
    systemPrompt: `${BASE_SYSTEM}
CTA для строительной компании: primary, secondary, sourceCTA. Без точных цен.`,
    buildUserPrompt: (r) => buildContext(r) + `\nВерни JSON: cta{primary,secondary,sourceCTA}`,
  },
  "related-links-only": {
    systemPrompt: `${BASE_SYSTEM}
Related links: проекты, категории, технические статьи, калькулятор. Используй относительные URL вида /catalog/..., /blog/..., /calculator.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nВерни JSON: relatedLinks[{title,url,relation,type}]`,
  },
  "teaser-package": {
    systemPrompt: `${BASE_SYSTEM}
Teaser-пакет для платформ: telegram, vk, dzen, vc, tenchat, ok, email, rss, manual-export.
Каждый teaser: title, hook, body, openLoop, readMoreCTA, utmUrl с utm_source, не дублирует полную статью, без обманного кликбейта.`,
    buildUserPrompt: (r) =>
      buildContext(r) +
      `\nfullArticleUrl: /blog/${slugify(r.input.topic)}\nВерни JSON: teasers[{platformId,title,hook,body,openLoop,readMoreCTA,fullArticleUrl,utmUrl,teaserStyle,hashtags}]`,
  },
};

function buildContext(r: AIContentGenerationRequest): string {
  const lines = [
    `Тема: ${r.input.topic}`,
    r.input.targetKeyword ? `Ключ: ${r.input.targetKeyword}` : "",
    r.input.secondaryKeywords?.length
      ? `Доп. ключи: ${r.input.secondaryKeywords.join(", ")}`
      : "",
    r.input.regionId ? `Регион: ${r.input.regionId}` : "",
    r.input.objectTypeId ? `Тип объекта: ${r.input.objectTypeId}` : "",
    r.input.materialId ? `Материал: ${r.input.materialId}` : "",
    r.input.sizeId ? `Размер: ${r.input.sizeId}` : "",
    r.input.clusterId ? `Кластер: ${r.input.clusterId}` : "",
    r.input.rubricId ? `Рубрика: ${r.input.rubricId}` : "",
    r.input.additionalContext ? `Контекст: ${r.input.additionalContext}` : "",
    `Регион контента: ${r.constraints.region}`,
    `Тон: ${r.constraints.toneOfVoice}`,
    `Дисклеймер обязателен: ${r.constraints.requiresDisclaimer}`,
    `Fact-check: ${r.constraints.requiresFactCheck}`,
    `Expert review: ${r.constraints.requiresExpertReview}`,
  ];
  return lines.filter(Boolean).join("\n");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}
