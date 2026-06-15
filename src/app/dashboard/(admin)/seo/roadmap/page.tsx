import type { Metadata } from "next";
import { SeoRoadmapTable } from "@/components/dashboard/seo/seo-roadmap-table";

export const metadata: Metadata = {
  title: "CRM — SEO-очередь",
  robots: { index: false, follow: false },
};

export default function DashboardSeoRoadmapPage() {
  return <SeoRoadmapTable />;
}
