import type { GroundedCitation, NavigationAssistantAnswer, RAGContextFragment } from "@/types/ai-navigation";
import { getActiveAIProvider } from "@/lib/ai-content-factory/ai-provider";
import { buildNavigationSystemPrompt, buildRAGUserPrompt } from "@/lib/ai-navigation/navigation-prompts";

type GenerateGroundedAnswerParams = {
  query: string;
  fragments: RAGContextFragment[];
};

const PRICE_PATTERN = /\b\d[\d\s.,]*\s?(₽|руб\.?|рублей|р)\b/gi;
const STOPWORDS = new Set([
  "это",
  "для",
  "как",
  "что",
  "или",
  "если",
  "без",
  "при",
  "под",
  "дом",
  "дома",
  "строительство",
]);

function buildCitation(fragment: RAGContextFragment): GroundedCitation {
  return {
    sourceId: fragment.sourceId,
    contentItemId: fragment.contentItemId,
    title: fragment.title,
    canonicalUrl: fragment.canonicalUrl,
    heading: fragment.headingPath.join(" > ") || undefined,
  };
}

function splitToSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20);
}

function extractiveFallback(query: string, fragments: RAGContextFragment[]): NavigationAssistantAnswer {
  if (fragments.length === 0) {
    return buildCannotAnswerResponse("Недостаточно релевантных источников.");
  }

  const top = fragments.slice(0, 3);
  const lines = top.flatMap((fragment) => splitToSentences(fragment.text).slice(0, 1));
  const answer =
    lines.length > 0
      ? lines.join(" ")
      : "По доступным источникам найдено недостаточно подробностей для точного ответа. Могу помочь уточнить вопрос.";

  return {
    answer,
    citations: top.map(buildCitation),
    confidence: top.length >= 2 ? "medium" : "low",
    answerability: top.length >= 2 ? "answered" : "partially-answered",
    suggestedActions: top.map((fragment) => ({
      type: "open-page",
      title: `Открыть: ${fragment.title}`,
      url: fragment.canonicalUrl,
    })),
    limitations: [
      "Использован extractive fallback без генеративного обобщения.",
      `Вопрос: ${query.slice(0, 120)}`,
    ],
  };
}

function parseModelJson(payload: unknown): Record<string, unknown> | null {
  if (payload && typeof payload === "object") return payload as Record<string, unknown>;
  if (typeof payload !== "string") return null;
  try {
    const parsed = JSON.parse(payload);
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

function mapCitations(
  raw: unknown,
  fragments: RAGContextFragment[],
): GroundedCitation[] {
  if (!Array.isArray(raw)) return [];
  const byKey = new Map<string, RAGContextFragment>();
  for (const fragment of fragments) {
    byKey.set(`${fragment.sourceId}::${fragment.contentItemId}`, fragment);
  }

  const citations: GroundedCitation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const sourceId = typeof record.sourceId === "string" ? record.sourceId : "";
    const contentItemId = typeof record.contentItemId === "string" ? record.contentItemId : "";
    const matched = byKey.get(`${sourceId}::${contentItemId}`);
    if (!matched) continue;
    citations.push(buildCitation(matched));
  }

  return citations;
}

function collectClaimKeywords(answer: string): string[] {
  const unique = new Set(
    answer
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !STOPWORDS.has(token)),
  );
  return [...unique];
}

export function detectUnsupportedAnswerClaims(
  answer: string,
  fragments: RAGContextFragment[],
): string[] {
  const sourceCorpus = fragments
    .map((fragment) => `${fragment.title} ${fragment.headingPath.join(" ")} ${fragment.text}`)
    .join(" ")
    .toLowerCase();

  const unsupportedKeywords = collectClaimKeywords(answer).filter(
    (keyword) => !sourceCorpus.includes(keyword),
  );

  const answerHasPrices = (answer.match(PRICE_PATTERN) ?? []).length > 0;
  const sourcesHavePrices = (sourceCorpus.match(PRICE_PATTERN) ?? []).length > 0;
  if (answerHasPrices && !sourcesHavePrices) {
    unsupportedKeywords.push("price-claim-without-source");
  }

  return unsupportedKeywords.slice(0, 10);
}

export function validateAnswerAgainstSources(
  answer: NavigationAssistantAnswer,
  fragments: RAGContextFragment[],
): boolean {
  if (answer.citations.length === 0) return false;
  const unsupportedClaims = detectUnsupportedAnswerClaims(answer.answer, fragments);
  if (unsupportedClaims.length > 0) return false;

  const keys = new Set(fragments.map((fragment) => `${fragment.sourceId}::${fragment.contentItemId}`));
  return answer.citations.every((citation) => keys.has(`${citation.sourceId}::${citation.contentItemId}`));
}

export function buildCannotAnswerResponse(reason?: string): NavigationAssistantAnswer {
  return {
    answer:
      "Сейчас у меня недостаточно подтверждённых данных, чтобы ответить точно и безопасно. Могу предложить консультацию менеджера или помочь уточнить вопрос.",
    citations: [],
    confidence: "low",
    answerability: "not-answered",
    suggestedActions: [
      { type: "request-consultation", title: "Запросить консультацию менеджера" },
      { type: "refine-question", title: "Уточнить параметры вопроса" },
    ],
    limitations: [reason ?? "Недостаточно фактов в RAG-контексте."],
  };
}

export function buildManagerHandoffResponse(reason?: string): NavigationAssistantAnswer {
  return {
    answer:
      "Для этого вопроса нужен менеджер/специалист: так мы избежим неточностей по смете, гарантиям и условиям проекта. Могу оформить передачу контакта.",
    citations: [],
    confidence: "high",
    answerability: "requires-manager",
    suggestedActions: [{ type: "request-consultation", title: "Передать запрос менеджеру" }],
    limitations: [reason ?? "Вопрос требует персональной консультации."],
  };
}

async function generateWithProvider(
  query: string,
  fragments: RAGContextFragment[],
): Promise<NavigationAssistantAnswer | null> {
  const { provider } = await getActiveAIProvider();
  const response = await provider.generate({
    systemPrompt: buildNavigationSystemPrompt(),
    userPrompt: buildRAGUserPrompt(query, fragments),
    temperature: 0.1,
    maxTokens: 1200,
    outputSchema: {
      type: "object",
      properties: {
        answer: { type: "string" },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        citations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sourceId: { type: "string" },
              contentItemId: { type: "string" },
            },
            required: ["sourceId", "contentItemId"],
          },
        },
        limitations: { type: "array", items: { type: "string" } },
      },
      required: ["answer", "confidence", "citations", "limitations"],
    },
  });

  const parsed = parseModelJson(response.parsed ?? response.text);
  if (!parsed) return null;

  const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
  if (!answer) return null;

  const confidenceRaw = typeof parsed.confidence === "string" ? parsed.confidence : "low";
  const confidence: NavigationAssistantAnswer["confidence"] =
    confidenceRaw === "high" || confidenceRaw === "medium" ? confidenceRaw : "low";
  const citations = mapCitations(parsed.citations, fragments);
  const limitations = Array.isArray(parsed.limitations)
    ? parsed.limitations.filter((item): item is string => typeof item === "string")
    : [];

  return {
    answer,
    citations,
    confidence,
    answerability: citations.length > 0 ? "answered" : "partially-answered",
    suggestedActions: citations.slice(0, 3).map((citation) => ({
      type: "open-page",
      title: `Открыть: ${citation.title}`,
      url: citation.canonicalUrl,
    })),
    limitations,
  };
}

export async function generateGroundedAnswer(
  params: GenerateGroundedAnswerParams,
): Promise<NavigationAssistantAnswer> {
  const { query, fragments } = params;
  if (fragments.length === 0) return buildCannotAnswerResponse();

  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const generated = hasOpenAIKey ? await generateWithProvider(query, fragments) : null;
  const answer = generated ?? extractiveFallback(query, fragments);

  const unsupportedClaims = detectUnsupportedAnswerClaims(answer.answer, fragments);
  if (unsupportedClaims.length > 0) {
    return buildCannotAnswerResponse(
      "Ответ содержал неподтверждённые утверждения и был отклонён.",
    );
  }

  if (!validateAnswerAgainstSources(answer, fragments)) {
    return generated ? extractiveFallback(query, fragments) : answer;
  }

  return answer;
}

export const groundedAnswerService = {
  generateGroundedAnswer,
  validateAnswerAgainstSources,
  detectUnsupportedAnswerClaims,
  buildCannotAnswerResponse,
  buildManagerHandoffResponse,
};
