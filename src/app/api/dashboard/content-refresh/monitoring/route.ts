import { NextResponse } from "next/server";
import { getRefreshMonitoringData } from "@/lib/content-refresh/refresh-dashboard-service";

export async function GET() {
  return NextResponse.json(getRefreshMonitoringData());
}
