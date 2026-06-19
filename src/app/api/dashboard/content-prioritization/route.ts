import { NextResponse } from "next/server";
import { priorityService } from "@/lib/content-prioritization/priority-service";

export async function GET() {
  const data = await priorityService.getDashboardData();
  return NextResponse.json(data);
}
