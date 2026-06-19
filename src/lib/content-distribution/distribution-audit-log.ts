import type { DistributionAuditEntry } from "@/types/content-distribution";
import { publicationRepository } from "@/lib/content-distribution/publication-repository";

export function logDistributionEvent(
  publicationId: string,
  event: string,
  message?: string,
): DistributionAuditEntry {
  publicationRepository.appendAudit({ publicationId, event, message });
  const entries = publicationRepository.getAuditForPublication(publicationId);
  return entries[0]!;
}

export function getDistributionAuditLog(publicationId: string): DistributionAuditEntry[] {
  return publicationRepository.getAuditForPublication(publicationId);
}
