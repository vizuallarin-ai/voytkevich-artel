import { NextResponse } from "next/server";
import { getRefreshReviewsData } from "@/lib/content-refresh/refresh-dashboard-service";

export async function GET() {
  return NextResponse.json(getRefreshReviewsData());
}
