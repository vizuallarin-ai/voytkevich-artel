import type {
  AIContentGenerationOutput,
  AIContentGenerationRequest,
  AIContentTeaser,
} from "@/types/ai-content-factory";
import type { AIGenerationRecord } from "@/types/ai-generation";

const store = new Map<string, AIContentGenerationOutput>();
const records: AIGenerationRecord[] = [];

export function saveGenerationOutput(output: AIContentGenerationOutput): void {
  store.set(output.id, output);
  const existing = records.findIndex((r) => r.id === output.id);
  const record = outputToRecord(output);
  if (existing >= 0) records[existing] = record;
  else records.unshift(record);
}

export function getGenerationOutput(id: string): AIContentGenerationOutput | undefined {
  return store.get(id);
}

export function updateGenerationOutput(
  id: string,
  patch: Partial<AIContentGenerationOutput>,
): AIContentGenerationOutput | undefined {
  const current = store.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  store.set(id, next);
  const idx = records.findIndex((r) => r.id === id);
  if (idx >= 0) records[idx] = outputToRecord(next);
  return next;
}

export function listGenerationRecords(): AIGenerationRecord[] {
  return [...records];
}

export function createAuditLogForAIGeneration(
  output: AIContentGenerationOutput,
  request: AIContentGenerationRequest,
  event: string,
): void {
  void { generationId: output.id, requestId: request.id, event, mode: request.mode, at: new Date().toISOString() };
}

function outputToRecord(output: AIContentGenerationOutput): AIGenerationRecord {
  return {
    id: output.id,
    requestId: output.requestId,
    mode: inferModeFromOutput(output),
    topic: output.result.title,
    status: output.status,
    validationLevel: output.validation.qualityLevel,
    blockersCount: output.validation.blockers.length,
    warningsCount: output.validation.warnings.length,
    savedContentId: output.cms.savedContentId,
    provider: output.usage?.provider,
    model: output.usage?.model,
    createdAt: output.createdAt,
    updatedAt: output.updatedAt,
  };
}

function inferModeFromOutput(output: AIContentGenerationOutput): AIGenerationRecord["mode"] {
  const kind = output.result.contentKind;
  if (kind === "programmatic-page") return "programmatic-page-draft";
  if (kind === "technical-article") return "technical-article-draft";
  if (kind === "editorial-content") return "editorial-content-draft";
  if (kind === "news") return "news-draft";
  if (kind === "digest") return "digest-draft";
  if (output.result.teasers?.length) return "teaser-package";
  if (output.result.brief) return "content-brief";
  return "content-brief";
}

export type { AIContentTeaser };
