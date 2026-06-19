import type { PlatformAdapter } from "@/types/content-distribution";
import { getExternalPlatform } from "@/data/external-content-platforms";
import { telegramAdapter } from "./telegram-adapter";
import { vkAdapter } from "./vk-adapter";
import { n8nWebhookAdapter } from "./n8n-webhook-adapter";
import { manualAdapter, manualAdapterForPlatform } from "./manual-adapter";
import { emailExportAdapter } from "./email-export-adapter";
import { rssAdapter } from "./rss-adapter";
import { createBaseAdapter } from "./base-adapter";

const ADAPTERS: Record<string, PlatformAdapter> = {
  telegram: telegramAdapter,
  vk: vkAdapter,
  n8n: n8nWebhookAdapter,
  "manual-export": manualAdapter,
  email: emailExportAdapter,
  rss: rssAdapter,
};

const MANUAL_PLATFORMS = ["dzen", "vc", "tenchat", "ok"];

export function getAdapterForPlatform(platformId: string): PlatformAdapter {
  if (ADAPTERS[platformId]) return ADAPTERS[platformId];
  if (MANUAL_PLATFORMS.includes(platformId)) return manualAdapterForPlatform(platformId);

  const platform = getExternalPlatform(platformId);
  return createBaseAdapter(platformId, {
    canPublish: platform?.adapterStatus === "active",
    canSchedule: platform?.supportsScheduling ?? false,
    requiresManualExport:
      platform?.adapterStatus === "manual" || platform?.adapterStatus === "needs-api",
  });
}

export function isAdapterActive(platformId: string): boolean {
  return getAdapterForPlatform(platformId).canPublish;
}
