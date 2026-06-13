import { NextResponse } from "next/server";
import type { LeadFormInput, LeadListParams } from "@/types/lead";
import { buildLeadFromInput, normalizeLegacyPayload } from "@/lib/leads/lead-payload";
import { isSuspiciousSubmit, parseLeadRequestBody } from "@/lib/leads/lead-validation";
import { persistLead } from "@/lib/leads/lead-storage";
import { handleNewLeadAutomation } from "@/lib/leads/lead-automation";
import { logger } from "@/lib/logger";
import { recordLeadCreatedEvent } from "@/lib/analytics/server-events";
import { fetchLeads } from "@/lib/leads/lead-service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: LeadListParams = {
    search: searchParams.get("search") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 20),
    sort: (searchParams.get("sort") as LeadListParams["sort"]) ?? "newest",
  };

  const status = searchParams.get("status");
  if (status) params.status = status as LeadListParams["status"];

  const readiness = searchParams.get("readiness");
  if (readiness) params.readiness = readiness as LeadListParams["readiness"];

  const sourceType = searchParams.get("sourceType");
  if (sourceType) params.sourceType = sourceType as LeadListParams["sourceType"];

  const result = await fetchLeads(params);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const rate = checkRateLimit(`leads:${getClientIp(request)}`, {
    limit: Number(process.env.LEADS_RATE_LIMIT ?? 8),
    windowMs: 60_000,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Слишком много запросов. Попробуйте через минуту." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "Некорректный запрос" },
      { status: 400 },
    );
  }

  const parsed = parseLeadRequestBody(body);

  if (parsed.kind === "error") {
    return NextResponse.json(
      { ok: false, error: "validation_failed", message: "Укажите имя и телефон" },
      { status: 422 },
    );
  }

  let input: LeadFormInput =
    parsed.kind === "structured" ? parsed.input : normalizeLegacyPayload(parsed.legacy);

  if (isSuspiciousSubmit(input)) {
    input = { ...input, honeypot: input.honeypot ?? "filled" };
  }

  const serverMeta = {
    userAgent: request.headers.get("user-agent") ?? undefined,
    referrer: request.headers.get("referer") ?? undefined,
  };

  const lead = buildLeadFromInput(input, serverMeta);

  if (lead.status === "spam") {
    return NextResponse.json({ ok: true, leadId: `spam_${Date.now()}` });
  }

  const result = await persistLead(lead);

  if (!result.ok || !result.lead) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "delivery_failed",
        message:
          "Заявка не доставлена. Позвоните нам напрямую — мы на связи в рабочее время.",
      },
      { status: 503 },
    );
  }

  try {
    await handleNewLeadAutomation(result.lead);
    await recordLeadCreatedEvent(result.lead);
  } catch (err) {
    logger.warn("lead.automation.error", {
      leadId: result.lead.id,
      error: err instanceof Error ? err.message : "automation_failed",
    });
  }

  return NextResponse.json({
    ok: true,
    leadId: result.leadId,
    message: successMessageForLead(input),
  });
}

function successMessageForLead(input: LeadFormInput): string {
  switch (input.request.type) {
    case "calculator-result":
      return "Расчёт отправлен. Мы получили параметры дома и сможем обсудить смету предметнее.";
    case "planner-review":
      return "Планировка отправлена. Мы получили сценарий, комнаты и площадь.";
    case "project-estimate":
      return "Заявка по проекту отправлена. Мы получили название проекта и ваши вводные.";
    case "lead-magnet":
      return "Запрос отправлен. Мы получили тему и контакты — специалист свяжется с вами.";
    case "case-like":
      return "Заявка отправлена. Обсудим похожий дом и ваши вводные.";
    case "object-map":
      return "Заявка отправлена. Уточним участок, район и параметры дома.";
    default:
      return "Заявка отправлена. Мы свяжемся с вами, чтобы уточнить вводные.";
  }
}
