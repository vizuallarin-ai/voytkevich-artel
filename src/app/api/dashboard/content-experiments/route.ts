import { NextResponse } from "next/server";
import { getExperimentsDashboardData } from "@/lib/content-refresh/refresh-dashboard-service";

export async function GET() {
  return NextResponse.json(getExperimentsDashboardData());
}
