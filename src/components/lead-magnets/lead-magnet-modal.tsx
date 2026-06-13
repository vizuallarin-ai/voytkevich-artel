"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { LeadMagnet, LeadMagnetSubmitContext } from "@/types/lead-magnet";
import { LeadMagnetForm } from "./lead-magnet-form";
import { trackLeadMagnetEvent } from "@/lib/lead-magnets";

type Props = {
  magnet: LeadMagnet;
  context: LeadMagnetSubmitContext;
  prefilledArea?: string;
  trigger: React.ReactNode;
};

export function LeadMagnetModal({ magnet, context, prefilledArea, trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          trackLeadMagnetEvent("lead_magnet_modal_opened", {
            leadMagnetId: magnet.id,
            leadMagnetType: magnet.type,
            pageType: context.pageType,
            pageSlug: context.pageSlug,
            clusterId: context.clusterId,
          });
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-graphite/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-graphite/10 bg-background p-6 shadow-lg focus:outline-none md:p-8">
          <Dialog.Close
            className="absolute right-4 top-4 rounded-sm p-1 text-muted transition hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
          <LeadMagnetForm
            magnet={magnet}
            context={{ ...context, selectedCTA: magnet.cta.primaryLabel }}
            prefilledArea={prefilledArea}
            onSuccess={() => {}}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
