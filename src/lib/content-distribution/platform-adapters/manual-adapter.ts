import type { PublishResult } from "@/types/content-distribution";
import { createBaseAdapter } from "./base-adapter";

export const manualAdapter = {
  ...createBaseAdapter("manual-export", {
    canPublish: false,
    canSchedule: false,
    requiresManualExport: true,
  }),
  async publish(): Promise<PublishResult> {
    return {
      success: false,
      error: {
        code: "manual_required",
        message: "Используйте manual export — автопубликация недоступна",
      },
    };
  },
};

export function manualAdapterForPlatform(platformId: string) {
  return {
    ...createBaseAdapter(platformId, {
      canPublish: false,
      canSchedule: false,
      requiresManualExport: true,
    }),
    async publish(): Promise<PublishResult> {
      return manualAdapter.publish();
    },
  };
}
