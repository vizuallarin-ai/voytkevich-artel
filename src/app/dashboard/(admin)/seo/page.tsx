import type { Metadata } from "next";
import { SeoPlatformOverview } from "@/components/dashboard/seo/seo-platform-overview";

export const metadata: Metadata = {
  title: "CRM — SEO-платформа",
  robots: { index: false, follow: false },
};

export default function DashboardSeoPage() {
  return <SeoPlatformOverview />;
}
