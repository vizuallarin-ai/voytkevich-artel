import { NextResponse } from "next/server";
import { getStorageStatus } from "@/lib/leads/lead-service";
import { getAnalyticsStorageStatus } from "@/lib/analytics/analytics-storage";
import { isDashboardAuthConfigured } from "@/lib/dashboard/auth";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID?.trim();
const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

function notificationsConfigured(): { smtp: boolean; telegram: boolean; email: boolean } {
  const smtp = Boolean(
    process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim(),
  );
  const telegram = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim());
  const email = Boolean(process.env.LEADS_NOTIFICATION_EMAIL?.trim() || process.env.RESEND_API_KEY?.trim());
  return { smtp, telegram, email: email || smtp };
}

export async function GET() {
  const leads = getStorageStatus();
  const analytics = getAnalyticsStorageStatus();
  const notifications = notificationsConfigured();

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
    analytics: {
      yandexMetrika: Boolean(YM_ID),
      googleAnalytics: Boolean(GA_ID),
    },
    notifications: {
      configured: notifications.email || notifications.telegram,
      smtp: notifications.smtp,
      telegram: notifications.telegram,
    },
  });
}
