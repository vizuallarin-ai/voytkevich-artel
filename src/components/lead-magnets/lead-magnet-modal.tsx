"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { LeadMagnet, LeadMagnetSubmitContext } from "@/types/lead-magnet";
import { LeadMagnetForm } from "./lead-magnet-form";
import { trackLeadMagnetEvent } from "@/lib/lead-magnets";
import { Button } from "@/components/ui/button";

type Props = {
  magnet: LeadMagnet;
  context: LeadMagnetSubmitContext;
  prefilledArea?: string;
  /** @deprecated — используйте label + variant */
  trigger?: React.ReactNode;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function LeadMagnetModal({
  magnet,
  context,
  prefilledArea,
  trigger,
  label,
  variant = "default",
  className,
  size = "default",
}: Props) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    trackLeadMagnetEvent("lead_magnet_clicked", {
      leadMagnetId: magnet.id,
      leadMagnetType: magnet.type,
      pageType: context.pageType,
      pageSlug: context.pageSlug,
      clusterId: context.clusterId,
    });
    trackLeadMagnetEvent("lead_magnet_modal_opened", {
      leadMagnetId: magnet.id,
      leadMagnetType: magnet.type,
      pageType: context.pageType,
      pageSlug: context.pageSlug,
      clusterId: context.clusterId,
    });
    setOpen(true);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {trigger ? (
        <span className="inline-flex" onClick={handleOpen} onKeyDown={(e) => e.key === "Enter" && handleOpen()} role="presentation">
          {trigger}
        </span>
      ) : (
        <Button type="button" variant={variant} size={size} className={className} onClick={handleOpen}>
          {label ?? magnet.cta.primaryLabel}
        </Button>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-graphite/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm border border-graphite/10 bg-background p-6 shadow-lg focus:outline-none md:p-8">
          <Dialog.Title className="sr-only">{magnet.cta.formTitle ?? magnet.title}</Dialog.Title>
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
            onSuccess={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
