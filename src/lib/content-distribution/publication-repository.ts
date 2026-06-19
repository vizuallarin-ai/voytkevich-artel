import type {
  DistributionAuditEntry,
  DistributionMetrics,
  ExternalPublication,
  PublicationQueueItem,
} from "@/types/content-distribution";
import { validatePublication } from "@/lib/content-distribution/publication-validator";
import { publicationToQueueItem } from "@/lib/content-distribution/publication-queue";
import { contentRepository } from "@/lib/content-cms/content-repository";

const publications = new Map<string, ExternalPublication>();
const auditLog: DistributionAuditEntry[] = [];

export const publicationRepository = {
  async list(): Promise<ExternalPublication[]> {
    return [...publications.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getById(id: string): Promise<ExternalPublication | null> {
    return publications.get(id) ?? null;
  },

  async save(publication: ExternalPublication): Promise<ExternalPublication> {
    publications.set(publication.id, publication);
    return publication;
  },

  async delete(id: string): Promise<void> {
    publications.delete(id);
  },

  async getMetrics(): Promise<DistributionMetrics> {
    const all = await this.list();
    const { externalContentPlatforms } = await import("@/data/external-content-platforms");
    return {
      totalDrafts: all.filter((p) => p.status === "draft" || p.status === "review").length,
      approved: all.filter((p) => p.status === "approved").length,
      scheduled: all.filter((p) => p.status === "scheduled").length,
      published: all.filter((p) => p.status === "published").length,
      failed: all.filter((p) => p.status === "failed").length,
      manualExport: all.filter((p) => p.status === "manual-export").length,
      needsApi: all.filter((p) => p.status === "needs-api").length,
      platformsActive: externalContentPlatforms.filter((p) => p.adapterStatus === "active").length,
      platformsManual: externalContentPlatforms.filter((p) => p.adapterStatus === "manual").length,
      platformsNeedsApi: externalContentPlatforms.filter((p) => p.adapterStatus === "needs-api")
        .length,
    };
  },

  async getQueue(): Promise<PublicationQueueItem[]> {
    const all = await this.list();
    const items: PublicationQueueItem[] = [];
    for (const pub of all) {
      const content = await contentRepository.getContentById(pub.contentItemId);
      items.push(publicationToQueueItem(pub, content));
    }
    return items;
  },

  appendAudit(entry: Omit<DistributionAuditEntry, "id" | "at">): void {
    auditLog.unshift({
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
    });
  },

  getAuditForPublication(publicationId: string): DistributionAuditEntry[] {
    return auditLog.filter((e) => e.publicationId === publicationId);
  },
};
