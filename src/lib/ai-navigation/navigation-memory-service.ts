import type { NavigationMemory } from "@/types/ai-navigation";

export type NavigationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const navigationSessionMemory = new Map<string, NavigationMemory>();

const PHONE_PATTERN = /\+?\d[\d\s\-()]{8,}\d/g;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_TEST_PATTERN = /\+?\d[\d\s\-()]{8,}\d/;
const EMAIL_TEST_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

function createEmptyMemory(sessionId: string): NavigationMemory {
  return {
    sessionId,
    viewedContentIds: [],
    updatedAt: new Date().toISOString(),
  };
}

function lastUserText(messages: NavigationMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return messages[i].content;
  }
  return "";
}

function extractByRegex(pattern: RegExp, text: string): string | undefined {
  const match = pattern.exec(text);
  return match?.[1]?.trim();
}

function inferIntent(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/консультац|перезвон|связаться/.test(lower)) return "consultation";
  if (/смет|стоим|цена/.test(lower)) return "cost";
  if (/проект|каталог|вариант/.test(lower)) return "project-selection";
  if (/фундамент|инженер|нагруз/.test(lower)) return "engineering";
  return undefined;
}

export function extractNavigationFacts(messages: NavigationMessage[]): Partial<NavigationMemory> {
  const text = lastUserText(messages);
  if (!text) return {};

  const area = extractByRegex(/(\d{2,4})\s*(м2|м²|кв\.?\s*м)/i, text);
  const floors = extractByRegex(/(\d)\s*(этаж|этажа|этажа?)/i, text);
  const location = extractByRegex(/(?:в|по)\s+([а-яёa-z\-\s]{3,40})/i, text);
  const material = extractByRegex(/(газобетон|кирпич|каркас|брус|монолит)/i, text);
  const technology = extractByRegex(/(каркасн(ая|ый)|монолитн(ая|ый)|модульн(ая|ый))/i, text);
  const buildingType = extractByRegex(/(дом|коттедж|баня|таунхаус)/i, text);
  const stage = extractByRegex(/(фундамент|коробка|теплый контур|инженерия|отделка)/i, text);

  const contentMatches = text.match(/\b(?:content|item|page)[:\s-]*([a-z0-9:_-]{4,})/gi) ?? [];
  const viewedContentIds = contentMatches
    .map((entry) => entry.split(/[:\s-]+/).pop() ?? "")
    .filter(Boolean);

  return {
    area,
    floors,
    location,
    material,
    technology,
    buildingType,
    stage,
    intent: inferIntent(text),
    viewedContentIds,
  };
}

export function sanitizeNavigationMemory(memory: NavigationMemory): NavigationMemory {
  const sanitize = (value: string | undefined): string | undefined => {
    if (!value) return value;
    const redacted = value.replace(PHONE_PATTERN, "").replace(EMAIL_PATTERN, "").trim();
    return redacted || undefined;
  };

  return {
    ...memory,
    buildingType: sanitize(memory.buildingType),
    technology: sanitize(memory.technology),
    material: sanitize(memory.material),
    area: sanitize(memory.area),
    floors: sanitize(memory.floors),
    location: sanitize(memory.location),
    stage: sanitize(memory.stage),
    intent: sanitize(memory.intent),
    viewedContentIds: memory.viewedContentIds.filter(
      (id) => !PHONE_TEST_PATTERN.test(id) && !EMAIL_TEST_PATTERN.test(id),
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updateNavigationMemory(
  sessionId: string,
  messages: NavigationMessage[] = [],
): NavigationMemory {
  const current = navigationSessionMemory.get(sessionId) ?? createEmptyMemory(sessionId);
  const facts = extractNavigationFacts(messages);
  const merged: NavigationMemory = {
    ...current,
    ...facts,
    viewedContentIds: [...new Set([...(current.viewedContentIds ?? []), ...(facts.viewedContentIds ?? [])])],
    updatedAt: new Date().toISOString(),
  };

  const sanitized = sanitizeNavigationMemory(merged);
  navigationSessionMemory.set(sessionId, sanitized);
  return sanitized;
}

export function getNavigationMemory(sessionId: string): NavigationMemory {
  return navigationSessionMemory.get(sessionId) ?? createEmptyMemory(sessionId);
}

export function clearNavigationMemory(sessionId?: string): void {
  if (sessionId) {
    navigationSessionMemory.delete(sessionId);
    return;
  }
  navigationSessionMemory.clear();
}

export const navigationMemoryService = {
  extractNavigationFacts,
  updateNavigationMemory,
  sanitizeNavigationMemory,
  clearNavigationMemory,
  get: getNavigationMemory,
};
