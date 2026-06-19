import type { ExternalPublication, PublishResult } from "@/types/content-distribution";
import { createBaseAdapter } from "./base-adapter";
import { stripUtmFromUrl } from "@/lib/content-distribution/utm-builder";

export type RssFeedItem = {
  title: string;
  link: string;
  guid: string;
  description: string;
  pubDate: string;
};

export function buildRssFeedItem(publication: ExternalPublication): RssFeedItem {
  return {
    title: publication.payload.title,
    link: publication.payload.utmUrl,
    guid: publication.id,
    description: publication.payload.text.slice(0, 500),
    pubDate: publication.publishedAt ?? new Date().toISOString(),
  };
}

export function buildRssXml(items: RssFeedItem[]): string {
  const entries = items
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="false">${item.guid}</guid>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
    </item>`,
    )
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>СтройСтрой — Teaser feed</title>
    <link>https://stroistroy.ru</link>
    <description>Teaser-only RSS — полные статьи на сайте</description>${entries}
  </channel>
</rss>`;
}

export const rssAdapter = {
  ...createBaseAdapter("rss", {
    canPublish: true,
    canSchedule: true,
    requiresManualExport: false,
  }),
  async publish(publication: ExternalPublication): Promise<PublishResult> {
    const item = buildRssFeedItem(publication);
    return {
      success: true,
      publishedUrl: stripUtmFromUrl(item.link),
      externalId: item.guid,
    };
  },
};
