/**
 * Backward-compatible adapter for blog (Stage 10).
 * Prefer @/data/lead-magnets and @/lib/lead-magnets for new code.
 */
import {
  getLeadMagnetById as getMagnet,
  getLeadMagnetsForCluster as getForCluster,
} from "@/lib/lead-magnets";
import type { LeadMagnet } from "@/types/lead-magnet";

export type BlogLeadMagnet = {
  id: string;
  title: string;
  description: string;
  cta: string;
  clusterIds: string[];
  formTitle: string;
  submitLabel: string;
  deliveryNote: string;
};

function toBlogMagnet(m: LeadMagnet): BlogLeadMagnet {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    cta: m.cta.primaryLabel,
    clusterIds: m.clusterIds,
    formTitle: m.cta.formTitle,
    submitLabel: m.cta.primaryLabel,
    deliveryNote:
      m.file?.generationStatus === "future"
        ? "TODO: PDF или отправка материала после интеграции CRM."
        : "Материал или разбор отправляется специалистом после заявки.",
  };
}

export function getLeadMagnetById(id: string): BlogLeadMagnet | undefined {
  const m = getMagnet(id);
  return m ? toBlogMagnet(m) : undefined;
}

export function getLeadMagnetsForCluster(clusterId: string): BlogLeadMagnet[] {
  return getForCluster(clusterId).map(toBlogMagnet);
}
