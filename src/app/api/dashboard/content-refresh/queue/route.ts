import { NextResponse } from "next/server";
import { getRefreshQueueData } from "@/lib/content-refresh/refresh-dashboard-service";
import type { DateRangeKey } from "@/types/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") ?? "30d") as DateRangeKey;
  return NextResponse.json(await getRefreshQueueData(range));
}
