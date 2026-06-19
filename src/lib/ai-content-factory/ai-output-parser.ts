export function parseAIResponseText(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const raw = jsonMatch ? jsonMatch[0] : trimmed;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { rawText: trimmed };
  }
}

export function parseAIResponse(parsed: unknown, text: string): Record<string, unknown> {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return parseAIResponseText(text);
}
