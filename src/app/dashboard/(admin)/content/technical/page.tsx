import type { Metadata } from "next";
import { TechnicalContentDashboard } from "@/components/dashboard/content/technical-content-dashboard";

export const metadata: Metadata = {
  title: "CRM — Техническая база знаний",
  robots: { index: false, follow: false },
};

export default function DashboardTechnicalContentPage() {
  return <TechnicalContentDashboard />;
}
