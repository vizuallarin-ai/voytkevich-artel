import type { ExternalPublication, PublishResult } from "@/types/content-distribution";
import { createBaseAdapter } from "./base-adapter";

function isVkConfigured(): boolean {
  return Boolean(process.env.VK_ACCESS_TOKEN?.trim() && process.env.VK_GROUP_ID?.trim());
}

export const vkAdapter = {
  ...createBaseAdapter("vk", {
    canPublish: isVkConfigured(),
    canSchedule: false,
    requiresManualExport: !isVkConfigured(),
  }),
  async publish(publication: ExternalPublication): Promise<PublishResult> {
    if (!isVkConfigured()) {
      return {
        success: false,
        error: {
          code: "needs-api",
          message: "VK_ACCESS_TOKEN и VK_GROUP_ID не настроены",
        },
      };
    }

    const token = process.env.VK_ACCESS_TOKEN!.trim();
    const groupId = process.env.VK_GROUP_ID!.trim();
    const ownerId = groupId.startsWith("-") ? groupId : `-${groupId.replace(/\D/g, "")}`;

    const message = `${publication.payload.title}\n\n${publication.payload.text}\n\n${publication.payload.utmUrl}`;

    try {
      const params = new URLSearchParams({
        access_token: token,
        v: "5.199",
        owner_id: ownerId,
        from_group: "1",
        message: message.slice(0, 4000),
      });
      const res = await fetch(`https://api.vk.com/method/wall.post?${params.toString()}`);
      const data = (await res.json()) as {
        response?: { post_id?: number };
        error?: { error_msg?: string };
      };
      if (data.error) {
        return {
          success: false,
          error: { code: "vk_error", message: data.error.error_msg ?? "VK API error" },
        };
      }
      const postId = data.response?.post_id;
      return {
        success: true,
        externalId: String(postId ?? ""),
        publishedUrl: postId ? `https://vk.com/wall${ownerId}_${postId}` : undefined,
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: "vk_fetch_failed",
          message: err instanceof Error ? err.message : "Network error",
        },
      };
    }
  },
};
