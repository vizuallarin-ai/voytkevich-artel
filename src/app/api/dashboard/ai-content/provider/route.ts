import { NextResponse } from "next/server";
import { getActiveAIProvider } from "@/lib/ai-content-factory/ai-provider";

export async function GET() {
  const { provider, isProduction } = await getActiveAIProvider();
  return NextResponse.json({
    providerId: provider.id,
    label: provider.label,
    isConfigured: provider.isConfigured,
    isProduction,
    message: isProduction
      ? "OpenAI подключён"
      : "Mock provider (dev) — задайте OPENAI_API_KEY для production",
  });
}
