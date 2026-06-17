import type { Metadata } from "next";
import { ProgrammaticTemplatesOverview } from "@/components/dashboard/seo/programmatic-templates-overview";

export const metadata: Metadata = {
  title: "CRM — Шаблоны SEO",
  robots: { index: false, follow: false },
};

export default function DashboardSeoTemplatesPage() {
  return <ProgrammaticTemplatesOverview />;
}
