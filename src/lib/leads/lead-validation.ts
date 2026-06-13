import { z } from "zod";
import type { Lead, LeadFormInput, LegacyLeadPayload } from "@/types/lead";

const LeadSourceSchema = z.object({
  sourceType: z.string().min(1),
  sourceName: z.string().optional(),
  pageSlug: z.string().optional(),
  pageType: z.string().optional(),
  currentUrl: z.string().optional(),
  referrer: z.string().optional(),
  formId: z.string().optional(),
  formName: z.string().optional(),
  ctaId: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaPosition: z.string().optional(),
  entryPoint: z.string().optional(),
});

export const LeadFormInputSchema = z.object({
  contact: z.object({
    name: z.string().min(1, "Укажите имя"),
    phone: z.string().min(7, "Укажите телефон"),
    messenger: z.string().optional(),
    email: z.string().optional(),
    area: z.string().optional(),
    comment: z.string().optional(),
    budget: z.string().optional(),
    material: z.string().optional(),
    hasLand: z.string().optional(),
    landLocation: z.string().optional(),
  }),
  request: z.object({
    type: z.string().min(1),
    title: z.string().min(1),
    comment: z.string().optional(),
    selectedCTA: z.string().optional(),
  }),
  source: LeadSourceSchema,
  context: z.record(z.string(), z.unknown()).optional(),
  qualification: z.record(z.string(), z.unknown()).optional(),
  analytics: z.record(z.string(), z.unknown()).optional(),
  privacy: z.record(z.string(), z.unknown()).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  honeypot: z.string().optional(),
  conversionGoal: z.string().optional(),
});

export const LegacyLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  area: z.string().optional(),
  comment: z.string().optional(),
  source: z.string().optional(),
  website: z.string().optional(),
  messenger: z.string().optional(),
});

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").trim();
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function validateLeadFormInput(input: LeadFormInput): {
  ok: true;
  data: LeadFormInput;
} | {
  ok: false;
  message: string;
} {
  const parsed = LeadFormInputSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, message: first ?? "Проверьте данные формы" };
  }

  if (!isValidPhone(parsed.data.contact.phone)) {
    return { ok: false, message: "Проверьте номер телефона" };
  }

  return { ok: true, data: parsed.data as LeadFormInput };
}

export function parseLeadRequestBody(body: unknown): {
  kind: "structured";
  input: LeadFormInput;
} | {
  kind: "legacy";
  legacy: LegacyLeadPayload;
} | {
  kind: "error";
  message: string;
} {
  if (!body || typeof body !== "object") {
    return { kind: "error", message: "Invalid JSON" };
  }

  const record = body as Record<string, unknown>;

  if (record.contact && record.request && record.source) {
    const parsed = LeadFormInputSchema.safeParse(body);
    if (!parsed.success) {
      return { kind: "error", message: "Validation failed" };
    }
    return { kind: "structured", input: parsed.data as LeadFormInput };
  }

  const legacyParsed = LegacyLeadSchema.safeParse(body);
  if (legacyParsed.success) {
    return { kind: "legacy", legacy: legacyParsed.data };
  }

  return { kind: "error", message: "Validation failed" };
}

export function isSuspiciousSubmit(input: LeadFormInput): boolean {
  if (input.honeypot?.trim()) return true;
  if (input.meta?.formOpenedAt) {
    const elapsed = Date.now() - input.meta.formOpenedAt;
    if (elapsed < 1500) return true;
  }
  return false;
}

export function validateLead(lead: Lead): boolean {
  return Boolean(lead.contact.name && lead.contact.phone && lead.source.sourceType && lead.request.type);
}
