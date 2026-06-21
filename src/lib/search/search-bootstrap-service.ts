import { searchIndexLifecycleService } from "@/lib/search/search-index-lifecycle-service";
import { searchStore } from "@/lib/search/search-store";

let bootstrapPromise: Promise<void> | null = null;

/** Ensures an active search index exists — idempotent, safe for concurrent requests. */
export async function ensureSearchIndexReady(): Promise<void> {
  if (searchStore.getActiveIndexVersion() && searchStore.listDocuments().length > 0) {
    return;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const version = await searchIndexLifecycleService.buildSearchIndex();
      const validation = await searchIndexLifecycleService.validateSearchIndex(version.id);
      if (validation.valid) {
        await searchIndexLifecycleService.activateSearchIndex(version.id);
      }
    })().finally(() => {
      bootstrapPromise = null;
    });
  }

  await bootstrapPromise;
}

export const searchBootstrapService = {
  ensureSearchIndexReady,
};
