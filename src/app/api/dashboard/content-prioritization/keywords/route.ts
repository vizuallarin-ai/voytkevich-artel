import { NextResponse } from "next/server";
import { keywordDemandService } from "@/lib/content-prioritization/priority-service";

export async function GET() {
  const [keywords, metrics, history] = await Promise.all([
    keywordDemandService.list(),
    keywordDemandService.getMetrics(),
    Promise.resolve(keywordDemandService.getImportHistory()),
  ]);
  return NextResponse.json({ keywords, metrics, history });
}
