"use client";

import type { LeadMagnetPageType, LeadMagnetSubmitContext } from "@/types/lead-magnet";
import {
  getLeadMagnetById,
  getLeadMagnetsForCluster,
  getLeadMagnetsForServicePage,
} from "@/lib/lead-magnets";
import { LeadMagnetCard } from "./lead-magnet-card";
import { LeadMagnetInlineCTA } from "./lead-magnet-inline-cta";
import { LeadMagnetSection } from "./lead-magnet-section";

type Props = {
  pageType: LeadMagnetPageType;
  pageSlug?: string;
  clusterId?: string;
  magnetIds?: string[];
  mode?: "section" | "inline" | "cards";
  title?: string;
  context?: LeadMagnetSubmitContext["context"];
  prefilledArea?: string;
  maxItems?: number;
};

export function LeadMagnetsBlock({
  pageType,
  pageSlug,
  clusterId,
  magnetIds,
  mode = "section",
  title,
  context: contextPayload,
  prefilledArea,
  maxItems = 2,
}: Props) {
  const context: LeadMagnetSubmitContext = {
    pageType,
    pageSlug,
    clusterId,
    context: contextPayload,
  };

  let magnets = magnetIds?.length
    ? (magnetIds.map((id) => getLeadMagnetById(id)).filter(Boolean) as NonNullable<
        ReturnType<typeof getLeadMagnetById>
      >[])
    : pageType === "service-page" && pageSlug
      ? getLeadMagnetsForServicePage(pageSlug)
      : clusterId
        ? getLeadMagnetsForCluster(clusterId)
        : [];

  magnets = magnets.slice(0, maxItems);

  if (!magnets.length) return null;

  if (mode === "inline" && magnets[0]) {
    return <LeadMagnetInlineCTA magnet={magnets[0]} context={context} title={title} />;
  }

  if (mode === "cards") {
    return (
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {magnets.map((m) => (
          <LeadMagnetCard key={m.id} magnet={m} context={context} prefilledArea={prefilledArea} />
        ))}
      </div>
    );
  }

  return (
    <LeadMagnetSection
      title={title}
      magnets={magnets}
      context={context}
      prefilledArea={prefilledArea}
      columns={magnets.length >= 3 ? 3 : 2}
    />
  );
}
