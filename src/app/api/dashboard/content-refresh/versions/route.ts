import { NextResponse } from "next/server";
import { getRefreshVersionsData } from "@/lib/content-refresh/refresh-dashboard-service";

export async function GET() {
  return NextResponse.json(getRefreshVersionsData());
}
