import type { Metadata } from "next";
import { LeadMetricsCards, QuickLinks, SourceBreakdown } from "@/components/dashboard/leads/lead-metrics-cards";
import { LeadsTable } from "@/components/dashboard/leads/leads-table";
import { fetchDashboardMetrics, fetchLeads } from "@/lib/leads/lead-service";

export const metadata: Metadata = {
  title: "CRM — обзор",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const [metrics, recent] = await Promise.all([
    fetchDashboardMetrics(),
    fetchLeads({ limit: 8, sort: "newest" }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-section text-3xl">Панель управления заявками</h1>
        <p className="mt-2 text-sm text-muted">
          Операционный обзор лидов с сайта — без полноценной CRM, но с полным контекстом заявок.
        </p>
      </div>

      <LeadMetricsCards metrics={metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SourceBreakdown metrics={metrics} />
        <QuickLinks />
      </div>

      <section>
        <h2 className="font-display text-xl">Последние лиды</h2>
        <div className="mt-4">
          <LeadsTable leads={recent.leads} />
        </div>
      </section>
    </div>
  );
}
