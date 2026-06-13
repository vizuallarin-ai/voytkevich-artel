import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadDetailClient } from "@/components/dashboard/leads/lead-detail-client";
import { fetchLead } from "@/lib/leads/lead-service";

export const metadata: Metadata = {
  title: "CRM — карточка лида",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ leadId: string }> };

export default async function LeadDetailPage({ params }: Props) {
  const { leadId } = await params;
  const lead = await fetchLead(leadId);
  if (!lead) notFound();

  return <LeadDetailClient initial={lead} />;
}
