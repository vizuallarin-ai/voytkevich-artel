import { NextResponse } from "next/server";
import { getStorageStatus } from "@/lib/leads/lead-service";
import { getAnalyticsStorageStatus } from "@/lib/analytics/analytics-storage";
import { isDashboardAuthConfigured } from "@/lib/dashboard/auth";

export async function GET() {
  const leads = getStorageStatus();
  const analytics = getAnalyticsStorageStatus();

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    storage: {
      leads: leads.backend,
      analytics: analytics.backend,
    },
    auth: {
      dashboard: isDashboardAuthConfigured(),
    },
  });
}
