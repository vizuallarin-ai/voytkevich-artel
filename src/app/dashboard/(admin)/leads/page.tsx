import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadsListClient } from "@/components/dashboard/leads/leads-list-client";
import { filterByStatusGroup } from "@/lib/leads/lead-filters";
import { fetchLeads } from "@/lib/leads/lead-service";
import type { LeadListParams } from "@/types/lead";

export const metadata: Metadata = {
  title: "CRM — лиды",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function LeadsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params: LeadListParams = {
    page: Number(sp.page ?? 1),
    limit: Number(sp.limit ?? 20),
    sort: (sp.sort as LeadListParams["sort"]) ?? "newest",
    search: sp.search,
    status: sp.status as LeadListParams["status"],
    readiness: sp.readiness as LeadListParams["readiness"],
    priority: sp.priority as LeadListParams["priority"],
    overdue: sp.overdue === "true" ? true : undefined,
    sourceType: sp.sourceType as LeadListParams["sourceType"],
  };

  let result = await fetchLeads(params);

  if (sp.group) {
    const grouped = filterByStatusGroup(result.leads, sp.group);
    result = { ...result, leads: grouped, total: grouped.length, totalPages: 1 };
  }

  return (
    <Suspense fallback={<p className="text-muted">Загрузка…</p>}>
      <LeadsListClient initial={result} />
    </Suspense>
  );
}
