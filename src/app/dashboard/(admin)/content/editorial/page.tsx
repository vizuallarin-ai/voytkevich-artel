import type { Metadata } from "next";
import { EditorialContentDashboard } from "@/components/dashboard/content/editorial-content-dashboard";

export const metadata: Metadata = {
  title: "CRM — Редакционный блог",
  robots: { index: false, follow: false },
};

export default function DashboardEditorialContentPage() {
  return <EditorialContentDashboard />;
}
