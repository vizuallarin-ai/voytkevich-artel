import { NextResponse } from "next/server";
import { listGenerationRecords } from "@/lib/ai-content-factory/ai-generation-audit-log";

export async function GET() {
  return NextResponse.json({ records: listGenerationRecords() });
}
