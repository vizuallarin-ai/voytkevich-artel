import { NextResponse } from "next/server";
import { indexationDashboardService } from "@/lib/seo-indexation/indexation-dashboard-service";
import { trackIndexabilityRecalculated } from "@/lib/seo-indexation/indexation-analytics";

export async function POST() {
  const count = await indexationDashboardService.recalculateAll();
  trackIndexabilityRecalculated({ count });
  return NextResponse.json({ recalculated: count });
}
