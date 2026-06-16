import { trackEvent } from "@/lib/analytics/events";

export function trackCtaClicked(label: string, payload?: Record<string, unknown>) {
  trackEvent("cta_clicked", { ctaLabel: label, label, ...payload });
}

export function trackPhoneClicked(sourceSection: string, payload?: Record<string, unknown>) {
  trackEvent("phone_clicked", { sourceSection, ...payload });
}

export function trackWhatsappClicked(sourceSection: string, payload?: Record<string, unknown>) {
  trackEvent("whatsapp_clicked", { sourceSection, ...payload });
}

export function trackTelegramClicked(sourceSection: string, payload?: Record<string, unknown>) {
  trackEvent("telegram_clicked", { sourceSection, ...payload });
}

export function trackStickyCtaClicked(action: string, payload?: Record<string, unknown>) {
  trackEvent("sticky_cta_clicked", { action, ctaLabel: action, ...payload });
}
