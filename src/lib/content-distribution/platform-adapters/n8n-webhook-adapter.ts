import type {
  ExternalPublication,
  N8NPublicationPayload,
  PublishResult,
} from "@/types/content-distribution";
import { createBaseAdapter } from "./base-adapter";

function getWebhookUrl(): string | null {
  const url = process.env.N8N_PUBLICATION_WEBHOOK_URL?.trim();
  return url || null;
}

export const n8nWebhookAdapter = {
  ...createBaseAdapter("n8n", {
    canPublish: Boolean(getWebhookUrl()),
    canSchedule: Boolean(getWebhookUrl()),
    requiresManualExport: !getWebhookUrl(),
  }),
  async publish(publication: ExternalPublication): Promise<PublishResult> {
    const webhook = getWebhookUrl();
    if (!webhook) {
      return {
        success: false,
        error: {
          code: "needs-api",
          message: "N8N_PUBLICATION_WEBHOOK_URL не настроен",
        },
      };
    }

    const payload: N8NPublicationPayload = {
      publicationId: publication.id,
      platformId: publication.platformId,
      contentItemId: publication.contentItemId,
      title: publication.payload.title,
      text: publication.payload.text,
      fullArticleUrl: publication.payload.fullArticleUrl,
      utmUrl: publication.payload.utmUrl,
      hashtags: publication.payload.hashtags,
      scheduledAt: publication.scheduledAt,
    };

    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          success: false,
          error: { code: "n8n_error", message: `Webhook ${res.status}: ${text.slice(0, 200)}` },
        };
      }
      return { success: true, publishedUrl: webhook };
    } catch (err) {
      return {
        success: false,
        error: {
          code: "n8n_fetch_failed",
          message: err instanceof Error ? err.message : "Network error",
        },
      };
    }
  },
};
