import type { ExternalPublication, PublishResult } from "@/types/content-distribution";
import { createBaseAdapter } from "./base-adapter";

export type EmailExportPayload = {
  subject: string;
  preheader: string;
  bodyHtml: string;
  bodyText: string;
  ctaUrl: string;
};

export function buildEmailExportPayload(publication: ExternalPublication): EmailExportPayload {
  return {
    subject: publication.payload.title,
    preheader: publication.payload.text.slice(0, 120),
    bodyHtml: `<p>${publication.payload.text.replace(/\n/g, "<br/>")}</p><p><a href="${publication.payload.utmUrl}">Читать на сайте</a></p>`,
    bodyText: `${publication.payload.text}\n\n${publication.payload.utmUrl}`,
    ctaUrl: publication.payload.utmUrl,
  };
}

export const emailExportAdapter = {
  ...createBaseAdapter("email", {
    canPublish: false,
    canSchedule: false,
    requiresManualExport: true,
  }),
  async publish(publication: ExternalPublication): Promise<PublishResult> {
    return {
      success: false,
      error: {
        code: "manual_export",
        message: "Email — используйте export payload для ручной рассылки",
        raw: buildEmailExportPayload(publication),
      },
    };
  },
};
