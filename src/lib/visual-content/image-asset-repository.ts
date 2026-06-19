import type { VisualAsset, VisualAssetMetrics } from "@/types/visual-content";
import type { ImageGenerationRecord } from "@/types/image-generation";
import { validateVisualAsset } from "@/lib/visual-content/image-validation";

const assets = new Map<string, VisualAsset>();
const generationHistory: ImageGenerationRecord[] = [];
const contentImageLinks = new Map<string, string[]>();
const publicationImageLinks = new Map<string, string[]>();

export type VisualAssetAuditEntry = {
  id: string;
  assetId: string;
  action: string;
  at: string;
  details?: string;
};

const auditLog: VisualAssetAuditEntry[] = [];

export const imageAssetRepository = {
  async list(): Promise<VisualAsset[]> {
    return [...assets.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getById(id: string): Promise<VisualAsset | null> {
    return assets.get(id) ?? null;
  },

  async save(asset: VisualAsset): Promise<VisualAsset> {
    assets.set(asset.id, { ...asset, updatedAt: new Date().toISOString() });
    return assets.get(asset.id)!;
  },

  async delete(id: string): Promise<void> {
    assets.delete(id);
  },

  async getMetrics(): Promise<VisualAssetMetrics> {
    const all = await this.list();
    return {
      total: all.length,
      approved: all.filter((a) => a.status === "approved" || a.status === "published").length,
      review: all.filter((a) => a.status === "review").length,
      generated: all.filter((a) => a.status === "generated").length,
      uploaded: all.filter((a) => a.status === "uploaded").length,
      missingAlt: all.filter((a) => !a.seo.alt?.trim()).length,
      missingRights: all.filter((a) => !a.rights.sourceConfirmed || !a.rights.usageAllowed).length,
      requiresIllustrationNotice: all.filter((a) => a.safety.requiresIllustrationNotice).length,
      attachedToContent: all.filter((a) => a.related.contentItemId).length,
      attachedToPublications: all.filter((a) => a.related.publicationId).length,
    };
  },

  linkToContent(contentItemId: string, imageId: string): void {
    const existing = contentImageLinks.get(contentItemId) ?? [];
    if (!existing.includes(imageId)) {
      contentImageLinks.set(contentItemId, [...existing, imageId]);
    }
  },

  linkToPublication(publicationId: string, imageId: string): void {
    const existing = publicationImageLinks.get(publicationId) ?? [];
    if (!existing.includes(imageId)) {
      publicationImageLinks.set(publicationId, [...existing, imageId]);
    }
  },

  getImagesForContent(contentItemId: string): string[] {
    return contentImageLinks.get(contentItemId) ?? [];
  },

  getImagesForPublication(publicationId: string): string[] {
    return publicationImageLinks.get(publicationId) ?? [];
  },

  appendGeneration(record: ImageGenerationRecord): void {
    generationHistory.unshift(record);
  },

  getGenerationHistory(): ImageGenerationRecord[] {
    return generationHistory;
  },

  appendAudit(entry: Omit<VisualAssetAuditEntry, "id" | "at">): void {
    auditLog.unshift({
      ...entry,
      id: `v-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
    });
  },

  getAuditForAsset(assetId: string): VisualAssetAuditEntry[] {
    return auditLog.filter((e) => e.assetId === assetId);
  },
};

export function seedDemoVisualAssets(): void {
  if (assets.size > 0) return;
  const demo: VisualAsset = {
    id: "visual-demo-001",
    kind: "ai-illustration",
    status: "review",
    title: "Обложка: выбор фундамента",
    description: "Редакционная иллюстрация для технической статьи",
    source: "ai-generated",
    related: { clusterId: "foundation" },
    format: { aspectRatio: "16:9", width: 1920, height: 1080 },
    usage: {
      siteCover: true,
      openGraph: true,
      socialTeaser: false,
      blogInline: false,
      catalog: false,
      casePage: false,
      dashboardOnly: false,
    },
    rights: { usageAllowed: true, sourceConfirmed: true },
    safety: {
      canLookLikeRealObject: true,
      requiresIllustrationNotice: true,
      isRealObjectPhoto: false,
      isRealClientPhoto: false,
      fakeCaseRisk: "low",
      misleadingRisk: "low",
    },
    seo: {
      alt: "Редакционная иллюстрация к статье о выборе фундамента: дом, участок и слои грунта в упрощённой схеме.",
      caption: "Иллюстрация, не фотография построенного объекта.",
    },
    prompts: {
      visualBrief: "Тема: выбор фундамента для частного дома в Иркутской области",
    },
    createdAt: new Date().toISOString(),
  };
  assets.set(demo.id, demo);
  void validateVisualAsset(demo);
}
