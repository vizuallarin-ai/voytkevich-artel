import { NextResponse } from "next/server";
import { getRefreshBriefsData } from "@/lib/content-refresh/refresh-dashboard-service";

export async function GET() {
  return NextResponse.json(getRefreshBriefsData());
}
