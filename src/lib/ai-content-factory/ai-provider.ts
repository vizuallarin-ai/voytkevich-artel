import type { AIProvider, AIProviderRequest, AIProviderResponse } from "@/types/ai-generation";
import type { AIContentGenerationMode, AIContentGenerationRequest } from "@/types/ai-content-factory";
import { getGenerationModeMeta } from "@/data/ai-content-generation-modes";

const MOCK_MODEL = "mock-dev-v1";

function buildMockJson(
  mode: AIContentGenerationMode,
  request: AIContentGenerationRequest,
): Record<string, unknown> {
  const topic = request.input.topic;
  const slug = topic
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

  if (mode === "news-draft" || mode === "digest-draft") {
    const hasSource =
      (request.input.sourceUrls?.length ?? 0) > 0 || Boolean(request.input.sourceNotes?.trim());
    if (!hasSource) return { blocker: "needs-source" };
  }

  const baseCta = {
    primary: "Получить консультацию по проекту",
    secondary: "Рассчитать ориентировочный бюджет",
    sourceCTA: "Оставить заявку — перезвоним и уточним детали",
  };

  const baseFaq = [
    {
      question: `С чего начать ${topic.toLowerCase()} в Иркутской области?`,
      answer:
        "Начните с выбора участка и формата дома. Мы поможем сориентироваться по технологии и этапам — без обещания точной сметы до замера.",
    },
    {
      question: "От чего зависит итоговая стоимость?",
      answer:
        "От фундамента, материала стен, инженерии, отделки и логистики. Ориентиры обсуждаем на консультации после уточнения ТЗ.",
    },
  ];

  const relatedLinks = [
    {
      title: "Калькулятор стоимости",
      url: "/calculator",
      relation: "lead-magnet",
      type: "calculator",
    },
    {
      title: "Каталог проектов",
      url: "/catalog",
      relation: "catalog",
      type: "category",
    },
  ];

  const metadata = {
    title: `${topic} | СтройСтрой Иркутск`,
    description: `Черновик: ${topic}. Информация носит ознакомительный характер — требуется проверка редактора.`,
    robots: { index: false, follow: true },
  };

  switch (mode) {
    case "content-brief":
      return {
        topic,
        targetKeyword: request.input.targetKeyword ?? topic,
        contentGoal: "lead-generation",
        audience: "Семьи, планирующие строительство в Иркутске и области",
        searchIntent: "commercial",
        recommendedStructure: [
          { blockType: "intro", title: "Введение", purpose: "Захват интента" },
          { blockType: "benefits", title: "Преимущества", purpose: "Доверие" },
          { blockType: "faq", title: "FAQ", purpose: "Закрытие возражений" },
        ],
        requiredBlocks: ["intro", "faq", "cta"],
        requiredCTA: baseCta.primary,
        requiredDisclaimers: ["Информация носит ознакомительный характер"],
        relatedPages: ["/catalog", "/calculator"],
        relatedArticles: [],
        relatedProjects: [],
        qualityRequirements: ["CTA", "FAQ", "related links"],
        risksToAvoid: ["Точные цены", "Фейковые кейсы"],
      };
    case "faq-only":
      return { faq: baseFaq };
    case "metadata-only":
      return { metadata, seoTitle: metadata.title, seoDescription: metadata.description };
    case "cta-only":
      return { cta: baseCta };
    case "related-links-only":
      return { relatedLinks };
    case "teaser-package": {
      const platforms = [
        "telegram",
        "vk",
        "dzen",
        "vc",
        "tenchat",
        "ok",
        "email",
        "rss",
        "manual-export",
      ] as const;
      return {
        teasers: platforms.map((platformId) => ({
          platformId,
          title: topic,
          hook: `Планируете ${topic.toLowerCase()}? Вот что важно учесть в Иркутске.`,
          body: "Короткий тизер — полный разбор в статье на сайте.",
          openLoop: "В материале — чек-лист и типичные ошибки.",
          readMoreCTA: "Читать на сайте",
          fullArticleUrl: `/blog/${slug}`,
          utmUrl: `https://stroistroy.ru/blog/${slug}?utm_source=${platformId}&utm_medium=teaser&utm_campaign=ai-draft`,
          teaserStyle: "local-hook",
        })),
      };
    }
    default:
      return {
        title: topic,
        h1: topic,
        slug,
        intro: `Черновик AI по теме «${topic}». Материал требует проверки редактором.`,
        body: request.constraints.requiresDisclaimer
          ? "Информация носит ознакомительный характер и не является инженерным расчётом."
          : "",
        blocks: [
          {
            id: "b1",
            type: "audience",
            title: "Кому подходит",
            content: "Семьям и владельцам участков в Иркутской области.",
          },
          {
            id: "b2",
            type: "cost-factors",
            title: "От чего зависит стоимость",
            content: "Фундамент, материал, инженерия, отделка — без фиксированной цены в тексте.",
          },
        ],
        conclusion: "Обсудите проект с нашим специалистом — подготовим ориентиры после уточнения ТЗ.",
        faq: baseFaq,
        cta: baseCta,
        relatedLinks,
        metadata,
        notes: request.constraints.allowFictionalizedStory
          ? ["Вымышленная история для иллюстрации — не реальный кейс."]
          : [],
      };
  }
}

const mockProvider: AIProvider = {
  id: "mock",
  label: "Mock (dev mode)",
  isConfigured: true,
  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    const text = request.userPrompt;
    const modeMatch = /Тема:\s*(.+)/.exec(text);
    const topic = modeMatch?.[1]?.trim() ?? "Черновик";
    const mode = inferModeFromPrompt(request.systemPrompt);
    const mockRequest: AIContentGenerationRequest = {
      id: "mock",
      mode,
      source: "manual",
      input: { topic },
      constraints: {
        language: "ru",
        region: "irkutsk",
        toneOfVoice: "экспертный, дружелюбный",
        requiresDisclaimer: true,
        requiresFactCheck: false,
        requiresExpertReview: false,
        allowFictionalizedStory: false,
        allowExternalTeasers: true,
        autoPublish: false,
      },
      createdAt: new Date().toISOString(),
    };
    const parsed = buildMockJson(mode, mockRequest);
    return {
      text: JSON.stringify(parsed),
      parsed,
      usage: { inputTokens: 120, outputTokens: 800, totalTokens: 920 },
    };
  },
};

function inferModeFromPrompt(system: string): AIContentGenerationMode {
  if (system.includes("content brief")) return "content-brief";
  if (system.includes("программируемой")) return "programmatic-page-draft";
  if (system.includes("Техническая")) return "technical-article-draft";
  if (system.includes("Редакционная")) return "editorial-content-draft";
  if (system.includes("Новость")) return "news-draft";
  if (system.includes("Дайджест")) return "digest-draft";
  if (system.includes("FAQ")) return "faq-only";
  if (system.includes("SEO metadata")) return "metadata-only";
  if (system.includes("CTA")) return "cta-only";
  if (system.includes("Related links")) return "related-links-only";
  if (system.includes("Teaser")) return "teaser-package";
  return "programmatic-page-draft";
}

let openAIProvider: AIProvider | null = null;

async function getOpenAIProvider(): Promise<AIProvider | null> {
  if (!process.env.OPENAI_API_KEY?.trim()) return null;
  if (openAIProvider) return openAIProvider;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  openAIProvider = {
    id: "openai",
    label: "OpenAI",
    isConfigured: true,
    async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: request.temperature ?? 0.4,
          max_tokens: request.maxTokens ?? 4096,
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
          response_format: request.outputSchema ? { type: "json_object" } : undefined,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API error: ${res.status} ${errText.slice(0, 200)}`);
      }

      const completion = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      };

      const text = completion.choices?.[0]?.message?.content ?? "{}";
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = undefined;
      }

      return {
        text,
        parsed,
        usage: {
          inputTokens: completion.usage?.prompt_tokens,
          outputTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    },
  };

  return openAIProvider;
}

export async function getActiveAIProvider(): Promise<{
  provider: AIProvider;
  isProduction: boolean;
}> {
  const openai = await getOpenAIProvider();
  if (openai) return { provider: openai, isProduction: true };
  return { provider: mockProvider, isProduction: false };
}

export function getProviderModelLabel(provider: AIProvider): string {
  if (provider.id === "openai") return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  return MOCK_MODEL;
}

export function modeRequiresSource(mode: AIContentGenerationMode): boolean {
  return Boolean(getGenerationModeMeta(mode)?.requiresSource);
}
