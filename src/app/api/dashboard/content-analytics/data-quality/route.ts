import { NextResponse } from "next/server";
import { dataQualityService } from "@/lib/content-analytics/data-quality-service";

export async function GET() {
  const audit = await dataQualityService.runDataQualityAudit();
  return NextResponse.json(audit);
}
