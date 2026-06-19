import { NextResponse } from "next/server";
import { getGenerationOutput } from "@/lib/ai-content-factory/ai-generation-audit-log";
import { discardAIOutput } from "@/lib/ai-content-factory/ai-content-service";
import { trackAIContentDiscarded } from "@/lib/ai-content-factory/ai-content-analytics";

type Params = { params: Promise<{ generationId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { generationId } = await params;
  const output = getGenerationOutput(generationId);
  if (!output) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  discardAIOutput(generationId);
  trackAIContentDiscarded({ generationId, mode: output.result.contentKind });
  return NextResponse.json({ ok: true });
}
