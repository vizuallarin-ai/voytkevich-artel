import type { AIContentGenerationRequest } from "@/types/ai-content-factory";
import { AI_CONTENT_PROMPT_TEMPLATES } from "@/data/ai-content-prompt-templates";
import { AI_CONTENT_OUTPUT_SCHEMAS } from "@/data/ai-content-output-schemas";
import type { AIProviderRequest } from "@/types/ai-generation";

export function buildAIProviderRequest(
  request: AIContentGenerationRequest,
): AIProviderRequest {
  const template = AI_CONTENT_PROMPT_TEMPLATES[request.mode];
  const schemaKey = schemaKeyForMode(request.mode);

  return {
    systemPrompt: template.systemPrompt,
    userPrompt: template.buildUserPrompt(request),
    outputSchema: AI_CONTENT_OUTPUT_SCHEMAS[schemaKey],
    temperature: 0.4,
    maxTokens: 4096,
  };
}

function schemaKeyForMode(mode: AIContentGenerationRequest["mode"]): string {
  switch (mode) {
    case "content-brief":
      return "brief";
    case "faq-only":
      return "faq";
    case "metadata-only":
      return "metadata";
    case "cta-only":
      return "cta";
    case "related-links-only":
      return "relatedLinks";
    case "teaser-package":
      return "teasers";
    default:
      return "fullDraft";
  }
}
