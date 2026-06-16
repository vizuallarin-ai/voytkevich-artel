"use client";

import type { LeadMagnet, LeadMagnetSubmitContext } from "@/types/lead-magnet";
import { getLeadMagnetTypeLabel } from "@/lib/lead-magnets";
import { LeadMagnetModal } from "./lead-magnet-modal";

type Props = {
  magnet: LeadMagnet;
  context: LeadMagnetSubmitContext;
  prefilledArea?: string;
  compact?: boolean;
};

export function LeadMagnetCard({ magnet, context, prefilledArea, compact }: Props) {
  return (
    <article className="flex h-full flex-col rounded-sm border border-graphite/10 bg-background p-5 md:p-6">
      <span className="label-caps text-wood">{getLeadMagnetTypeLabel(magnet.type)}</span>
      <h3 className="mt-2 font-display text-lg leading-snug">{magnet.shortTitle}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{magnet.description}</p>
      {magnet.highlights.length ? (
        <ul className="mt-4 space-y-1.5 text-sm text-muted">
          {magnet.highlights.slice(0, compact ? 3 : 5).map((h) => (
            <li key={h} className="flex gap-2">
              <span className="text-wood">→</span>
              {h}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5">
        <LeadMagnetModal
          magnet={magnet}
          context={context}
          prefilledArea={prefilledArea}
          label={magnet.cta.primaryLabel}
          size={compact ? "sm" : "default"}
          className="w-full sm:w-auto"
        />
      </div>
      {magnet.legalNote ? (
        <p className="mt-3 text-xs text-muted">{magnet.legalNote}</p>
      ) : null}
    </article>
  );
}
