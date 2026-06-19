import { NextResponse } from "next/server";
import { getGenerationOutput } from "@/lib/ai-content-factory/ai-generation-audit-log";
import { sendAIOutputToReview } from "@/lib/ai-content-factory/ai-content-service";

type Params = { params: Promise<{ generationId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { generationId } = await params;
  const output = getGenerationOutput(generationId);
  if (!output) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const item = await sendAIOutputToReview(output);
    return NextResponse.json({ itemId: item.id, item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
