import type { SearchIndexAdapter } from "@/lib/search/search-index-adapter";
import { lexicalIndexAdapter } from "@/lib/search/lexical-index-service";
import { vectorIndexAdapter } from "@/lib/search/vector-index-service";

export type SearchIndexAdapterName = "lexical" | "vector";

const adapters = new Map<SearchIndexAdapterName, SearchIndexAdapter>([
  ["lexical", lexicalIndexAdapter],
  ["vector", vectorIndexAdapter],
]);

export const searchIndexRegistry = {
  getAdapter(name: SearchIndexAdapterName): SearchIndexAdapter {
    const adapter = adapters.get(name);
    if (!adapter) {
      throw new Error(`Search index adapter not found: ${name}`);
    }
    return adapter;
  },

  listAdapters(): Array<{ name: SearchIndexAdapterName; adapter: SearchIndexAdapter }> {
    return [...adapters.entries()].map(([name, adapter]) => ({ name, adapter }));
  },

  registerAdapter(name: SearchIndexAdapterName, adapter: SearchIndexAdapter): void {
    adapters.set(name, adapter);
  },
};
