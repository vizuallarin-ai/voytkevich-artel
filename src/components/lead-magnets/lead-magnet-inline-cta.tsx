"use client";

import type { LeadMagnet, LeadMagnetSubmitContext } from "@/types/lead-magnet";
import { LeadMagnetModal } from "./lead-magnet-modal";

type Props = {
  magnet: LeadMagnet;
  context: LeadMagnetSubmitContext;
  title?: string;
  description?: string;
};

export function LeadMagnetInlineCTA({ magnet, context, title, description }: Props) {
  return (
    <aside className="my-10 rounded-sm border-l-4 border-wood bg-wood/5 px-5 py-5 md:px-6">
      <p className="font-display text-lg">{title ?? magnet.title}</p>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        {description ?? magnet.valuePromise}
      </p>
      <div className="mt-4">
        <LeadMagnetModal magnet={magnet} context={context} label={magnet.cta.primaryLabel} />
      </div>
      {magnet.legalNote ? (
        <p className="mt-3 text-xs text-muted">{magnet.legalNote}</p>
      ) : null}
    </aside>
  );
}
