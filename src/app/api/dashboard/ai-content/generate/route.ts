import { NextResponse } from "next/server";
import {
  createGenerationRequest,
  generateByMode,
} from "@/lib/ai-content-factory/ai-content-service";
import type { AIContentGenerationMode } from "@/types/ai-content-factory";
import { trackAIContentGenerationStarted } from "@/lib/ai-content-factory/ai-content-analytics";

type GenerateBody = {
  mode: AIContentGenerationMode;
  input: {
    topic: string;
    targetKeyword?: string;
    secondaryKeywords?: string[];
    clusterId?: string;
    rubricId?: string;
    authorId?: string;
    regionId?: string;
    objectTypeId?: string;
    materialId?: string;
    sizeId?: string;
    sourceUrls?: string[];
    sourceNotes?: string;
    additionalContext?: string;
  };
  constraints?: Partial<{
    region: "irkutsk" | "irkutsk-region" | "general";
    requiresDisclaimer: boolean;
    requiresFactCheck: boolean;
    requiresExpertReview: boolean;
    allowFictionalizedStory: boolean;
    allowExternalTeasers: boolean;
  }>;
};

export async function POST(request: Request) {
  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.mode || !body.input?.topic?.trim()) {
    return NextResponse.json({ error: "mode and topic required" }, { status: 400 });
  }

  const req = createGenerationRequest({
    mode: body.mode,
    source: "manual",
    input: {
      ...body.input,
      secondaryKeywords: body.input.secondaryKeywords ?? [],
      sourceUrls: body.input.sourceUrls ?? [],
    },
    constraints: body.constraints,
  });

  trackAIContentGenerationStarted({
    generationId: req.id,
    mode: req.mode,
    topic: req.input.topic,
  });

  const output = await generateByMode(req);
  return NextResponse.json({ output, request: req });
}
