"use client";

import type { LeadFormInput, LeadSubmitResult } from "@/types/lead";
import { buildLeadAnalyticsFromClient } from "@/lib/analytics/utm";
import { buildSessionAnalytics } from "@/lib/analytics/session";
import { trackConversionGoal, trackLeadEvent } from "@/lib/analytics/events";
import { inferConversionGoal } from "@/lib/analytics/conversion-goals";
import { validateLeadFormInput } from "./lead-validation";

const DEFAULT_ERROR =
  "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами другим способом.";

export async function submitLead(input: LeadFormInput): Promise<LeadSubmitResult> {
  const validation = validateLeadFormInput(input);
  if (!validation.ok) {
    return { success: false, message: validation.message, errorCode: "validation" };
  }

  const clientAnalytics = buildLeadAnalyticsFromClient();
  const session = buildSessionAnalytics();

  const payload: LeadFormInput = {
    ...validation.data,
    analytics: {
      ...clientAnalytics,
      ...validation.data.analytics,
      session: {
        ...session,
        ...validation.data.analytics?.session,
      },
      attribution: {
        ...clientAnalytics.traffic,
        conversionPage: validation.data.meta?.currentUrl ?? validation.data.source.currentUrl,
        ...validation.data.analytics?.attribution,
      },
    },
  };

  trackLeadEvent("started", {
    sourceType: payload.source.sourceType,
    requestType: payload.request.type,
  });

  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      leadId?: string;
      message?: string;
      error?: string;
    };

    if (!res.ok || !data.ok) {
      trackLeadEvent("error", { sourceType: payload.source.sourceType, error: data.error });
      return {
        success: false,
        message: data.message ?? DEFAULT_ERROR,
        errorCode: data.error ?? "server",
      };
    }

    const goal =
      (payload.conversionGoal as import("@/lib/analytics/conversion-goals").ConversionGoalId | undefined) ??
      inferConversionGoal(payload.source.sourceType, payload.request.type);

    trackConversionGoal(goal, {
      sourceType: payload.source.sourceType,
      pageSlug: payload.source.pageSlug,
      leadId: data.leadId,
    });
    trackLeadEvent("submitted", { sourceType: payload.source.sourceType, leadId: data.leadId });
    trackLeadEvent("success", { sourceType: payload.source.sourceType });

    return {
      success: true,
      leadId: data.leadId,
      message: data.message ?? "Заявка отправлена. Мы свяжемся с вами, чтобы уточнить вводные.",
    };
  } catch {
    trackLeadEvent("error", { sourceType: payload.source.sourceType });
    return { success: false, message: DEFAULT_ERROR, errorCode: "network" };
  }
}
