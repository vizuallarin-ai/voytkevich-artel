import { randomUUID } from "crypto";
import { z } from "zod";
import type { NavigationMemory } from "@/types/ai-navigation";
import { buildLeadFromInput } from "@/lib/leads/lead-payload";
import { persistLead } from "@/lib/leads/lead-storage";
import { searchStore } from "@/lib/search/search-store";

export type NavigationLeadContactInput = {
  name: string;
  phone: string;
};

export type NavigationLeadCreateInput = {
  sessionId: string;
  query: string;
  contact: NavigationLeadContactInput;
  memory?: NavigationMemory;
  consent: boolean;
};

export type NavigationLeadCreateResult = {
  ok: boolean;
  leadId?: string;
  channel: "crm" | "search-store" | "memory";
  error?: string;
};

const contactSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]{10,20}$/, "Проверьте номер телефона"),
});

const localHandoffStore = new Map<string, Record<string, unknown>>();

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").trim();
}

export function detectConsultationIntent(query: string): boolean {
  return /консультац|перезвон|связаться|остав(ить|лю)\s+контакт|менеджер/i.test(query);
}

export function requestContactConsent(): string {
  return "Могу передать ваш запрос менеджеру. Подтвердите согласие на обработку контакта и отправьте имя + телефон.";
}

export function validateLeadContactInput(input: NavigationLeadContactInput): {
  valid: boolean;
  data?: NavigationLeadContactInput;
  errors?: string[];
} {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false, errors: parsed.error.issues.map((issue) => issue.message) };
  }
  return { valid: true, data: { ...parsed.data, phone: normalizePhone(parsed.data.phone) } };
}

export function buildLeadHandoffSummary(input: {
  sessionId: string;
  query: string;
  memory?: NavigationMemory;
}): string {
  const memory = input.memory;
  const parts = [
    `Session: ${input.sessionId}`,
    `Запрос: ${input.query}`,
    memory?.buildingType ? `Тип объекта: ${memory.buildingType}` : "",
    memory?.material ? `Материал: ${memory.material}` : "",
    memory?.area ? `Площадь: ${memory.area}` : "",
    memory?.floors ? `Этажность: ${memory.floors}` : "",
    memory?.location ? `Локация: ${memory.location}` : "",
    memory?.stage ? `Этап: ${memory.stage}` : "",
    memory?.intent ? `Интент: ${memory.intent}` : "",
  ].filter(Boolean);

  return parts.join("\n");
}

async function storeHandoffInSearchStore(payload: Record<string, unknown>): Promise<boolean> {
  try {
    searchStore.saveAnalyticsEvent({
      eventName: "navigation_lead_handoff",
      payload,
    });
    return true;
  } catch {
    return false;
  }
}

export async function createNavigationLead(
  input: NavigationLeadCreateInput,
): Promise<NavigationLeadCreateResult> {
  if (!input.consent) {
    return { ok: false, channel: "memory", error: "consent_required" };
  }

  const validation = validateLeadContactInput(input.contact);
  if (!validation.valid || !validation.data) {
    return { ok: false, channel: "memory", error: validation.errors?.[0] ?? "invalid_contact" };
  }

  const summary = buildLeadHandoffSummary({
    sessionId: input.sessionId,
    query: input.query,
    memory: input.memory,
  });

  const lead = buildLeadFromInput(
    {
      contact: {
        name: validation.data.name,
        phone: validation.data.phone,
        comment: summary,
      },
      request: {
        type: "consultation",
        title: "Консультация из AI-навигации",
        comment: summary,
      },
      source: {
        sourceType: "service-page",
        sourceName: "AI Navigation",
        pageType: "ai-navigation",
        pageSlug: "stage-33",
        formId: "ai-navigation",
        entryPoint: "ai-navigation",
      },
      privacy: {
        consent: true,
        consentText: "Согласие получено в AI-навигации",
      },
    },
    { currentUrl: "/ai-navigation" },
  );

  const persisted = await persistLead(lead);
  if (persisted.ok && persisted.leadId) {
    return { ok: true, leadId: persisted.leadId, channel: "crm" };
  }

  const fallbackPayload: Record<string, unknown> = {
    id: `nav_handoff_${randomUUID()}`,
    sessionId: input.sessionId,
    query: input.query,
    summary,
    contactName: validation.data.name,
    contactPhone: validation.data.phone,
    createdAt: new Date().toISOString(),
  };

  const stored = await storeHandoffInSearchStore(fallbackPayload);
  if (stored) {
    return { ok: true, leadId: String(fallbackPayload.id), channel: "search-store" };
  }

  localHandoffStore.set(String(fallbackPayload.id), fallbackPayload);
  return { ok: true, leadId: String(fallbackPayload.id), channel: "memory" };
}

export const navigationLeadHandoffService = {
  detectConsultationIntent,
  buildLeadHandoffSummary,
  validateLeadContactInput,
  createNavigationLead,
  requestContactConsent,
};
