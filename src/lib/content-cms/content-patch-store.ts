import type { CMSContentItem } from "@/types/content-cms";

const patches = new Map<string, Partial<CMSContentItem>>();

export function getContentPatches(): Map<string, Partial<CMSContentItem>> {
  return patches;
}

export function saveContentPatch(id: string, patch: Partial<CMSContentItem>) {
  const prev = patches.get(id) ?? {};
  patches.set(id, { ...prev, ...patch, id });
}

export function deleteContentPatch(id: string) {
  patches.delete(id);
}

export function applyContentPatches(
  item: CMSContentItem,
  patch?: Partial<CMSContentItem>,
): CMSContentItem {
  if (!patch) return item;
  return {
    ...item,
    ...patch,
    indexing: { ...item.indexing, ...patch.indexing },
    quality: { ...item.quality, ...patch.quality },
    workflow: { ...item.workflow, ...patch.workflow },
    seo: { ...item.seo, ...patch.seo },
    distribution: { ...item.distribution, ...patch.distribution },
    related: { ...item.related, ...patch.related },
    ethics: { ...item.ethics, ...patch.ethics },
    factCheck: patch.factCheck
      ? { ...item.factCheck, ...patch.factCheck, status: patch.factCheck.status ?? item.factCheck?.status ?? "not-required" }
      : item.factCheck,
  };
}
