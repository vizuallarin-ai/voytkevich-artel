import type { AIContentGenerationMode } from "@/types/ai-content-factory";

export type AIProviderRequest = {
  systemPrompt: string;
  userPrompt: string;
  outputSchema?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
};

export type AIProviderResponse = {
  text: string;
  parsed?: unknown;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export type AIProvider = {
  id: string;
  label: string;
  isConfigured: boolean;
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
};

export type AIGenerationUsage = {
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
};

export type AIGenerationRecord = {
  id: string;
  requestId: string;
  mode: AIContentGenerationMode;
  topic: string;
  status: string;
  validationLevel?: string;
  blockersCount: number;
  warningsCount: number;
  savedContentId?: string;
  provider?: string;
  model?: string;
  createdAt: string;
  updatedAt?: string;
};
