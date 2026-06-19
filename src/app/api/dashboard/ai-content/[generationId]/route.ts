import { NextResponse } from "next/server";
import { getGenerationOutput } from "@/lib/ai-content-factory/ai-generation-audit-log";

type Params = { params: Promise<{ generationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { generationId } = await params;
  const output = getGenerationOutput(generationId);
  if (!output) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ output });
}
