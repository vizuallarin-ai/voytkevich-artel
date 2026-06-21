import type { NavigationAssistantAnswer, RAGContextFragment } from "@/types/ai-navigation";

const QUERY_INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /disregard\s+all\s+rules/i,
  /you\s+are\s+now\s+/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /bypass\s+safety/i,
  /reveal\s+internal\s+instructions/i,
  /игнорируй\s+предыдущие\s+инструкции/i,
  /раскрой\s+системный\s+промпт/i,
  /покажи\s+скрытые\s+правила/i,
];

const DOCUMENT_INJECTION_PATTERNS = [
  /ignore\s+all\s+(previous|prior)\s+instructions/i,
  /do\s+not\s+cite\s+sources/i,
  /output\s+the\s+system\s+prompt/i,
  /override\s+safety\s+policy/i,
  /you\s+must\s+obey\s+this\s+instruction/i,
  /выполни\s+эту\s+инструкцию\s+вместо\s+правил/i,
];

const SYSTEM_PROMPT_EXTRACTION_PATTERNS = [
  /show\s+(me\s+)?your\s+system\s+prompt/i,
  /print\s+hidden\s+instructions/i,
  /what\s+are\s+your\s+internal\s+rules/i,
  /покажи\s+системный\s+промпт/i,
  /какие\s+у\s+тебя\s+внутренние\s+инструкции/i,
];

const PII_REDACTION_PATTERNS = [
  /```[\s\S]*?```/g,
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
];

function matchesAnyPattern(value: string, patterns: RegExp[]): boolean {
  const normalized = value.trim();
  return patterns.some((pattern) => pattern.test(normalized));
}

function sanitizeContextText(text: string): string {
  return PII_REDACTION_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, " "), text)
    .replace(/\s+/g, " ")
    .trim();
}

export function detectPromptInjectionInQuery(query: string): boolean {
  return matchesAnyPattern(query, QUERY_INJECTION_PATTERNS);
}

export function detectPromptInjectionInDocument(documentText: string): boolean {
  return matchesAnyPattern(documentText, DOCUMENT_INJECTION_PATTERNS);
}

export function detectSystemPromptExtractionAttempt(query: string): boolean {
  return matchesAnyPattern(query, SYSTEM_PROMPT_EXTRACTION_PATTERNS);
}

export function sanitizeRetrievedContext(fragments: RAGContextFragment[]): RAGContextFragment[] {
  return fragments
    .filter((fragment) => !detectPromptInjectionInDocument(fragment.text))
    .map((fragment) => ({
      ...fragment,
      text: sanitizeContextText(fragment.text),
      title: sanitizeContextText(fragment.title),
    }))
    .filter((fragment) => fragment.text.length > 0 && fragment.title.length > 0);
}

export function buildSafeInjectionResponse(): NavigationAssistantAnswer {
  return {
    answer:
      "Я не могу выполнить этот запрос, потому что он содержит попытку обойти правила безопасности. Сформулируйте вопрос по строительной теме, и я помогу на основе проверенных источников.",
    citations: [],
    confidence: "high",
    answerability: "not-answered",
    suggestedActions: [{ type: "refine-question", title: "Уточнить вопрос без служебных инструкций" }],
    limitations: ["Запрос отклонён политикой защиты от prompt injection."],
  };
}

export const promptInjectionGuard = {
  detectPromptInjectionInQuery,
  detectPromptInjectionInDocument,
  sanitizeRetrievedContext,
  detectSystemPromptExtractionAttempt,
  buildSafeInjectionResponse,
};
