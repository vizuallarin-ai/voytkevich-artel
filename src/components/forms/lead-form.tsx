"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { useFormAutosave } from "@/hooks/use-form-autosave";
import { useLeadForm } from "@/hooks/use-lead-form";
import type { LeadFormConfig } from "@/lib/leads/lead-source";
import { inferLeadConfigFromLegacy } from "@/lib/leads/lead-source";
import { cta, privacyConsent, privacyLinkText } from "@/data/copy";
import { pageCopy } from "@/data/positioning";
import {
  leadBudgetOptions,
  leadLandOptions,
  leadMessengerOptions,
} from "@/data/lead-form-options";
import { trackLeadEvent } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const selectClassName =
  "mt-1 flex h-11 w-full rounded-sm border border-graphite/15 bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite";

export function LeadForm({
  id = "lead",
  title = cta.preliminaryEstimate,
  subtitle = pageCopy.forms.defaultSubtitle,
  prefilledArea,
  prefilledComment,
  managerNote,
  commentPlaceholder = "Например: участок, сроки, материал, что важно в доме",
  source,
  submitLabel,
  footnote,
  leadConfig,
  successMessage,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  prefilledArea?: string;
  /** @deprecated Технические данные — используйте managerNote */
  prefilledComment?: string;
  /** Служебная заметка для менеджера (не показывается клиенту) */
  managerNote?: string;
  commentPlaceholder?: string;
  /** @deprecated Use leadConfig */
  source?: string;
  submitLabel?: string;
  footnote?: string;
  leadConfig?: LeadFormConfig;
  successMessage?: string;
}) {
  const internalNote = managerNote ?? prefilledComment;
  const config = useMemo(
    () =>
      leadConfig ??
      inferLeadConfigFromLegacy({ id, source, title, submitLabel }),
    [leadConfig, id, source, title, submitLabel],
  );

  const form = useLeadForm({
    config,
    defaultValues: {
      area: prefilledArea ?? "",
      comment: "",
      messenger: "call",
      hasLand: "",
      budget: "",
    },
    successMessage,
  });

  const [step, setStep] = useState(0);
  const [formStarted, setFormStarted] = useState(false);

  useEffect(() => {
    trackLeadEvent("viewed", {
      formId: config.formId ?? id,
      pageType: config.sourceType,
      ctaLabel: config.selectedCTA,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  useEffect(() => {
    form.setValue("area", prefilledArea ?? form.values.area);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync prefilled props only
  }, [prefilledArea]);

  useFormAutosave(`lead-${id}`, form.values, (saved) => {
    Object.entries(saved).forEach(([key, value]) => {
      if (typeof value === "string") {
        form.setValue(key as keyof typeof form.values, value);
      }
    });
  });

  const progress = step === 0 ? 50 : 100;
  const showLandLocation = form.values.hasLand === "yes";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 0) {
      if (!form.validateContact()) return;
      if (!formStarted) {
        setFormStarted(true);
        trackLeadEvent("started", {
          formId: config.formId ?? id,
          pageType: config.sourceType,
          ctaLabel: config.selectedCTA,
        });
      }
      setStep(1);
      return;
    }

    const userComment = form.values.comment?.trim();
    const mergedComment = [internalNote, userComment].filter(Boolean).join("\n\n---\n\n");
    await form.submit(mergedComment || undefined);
    if (form.isSuccess) {
      localStorage.removeItem(`lead-${id}`);
    }
  };

  if (form.isSuccess) {
    return (
      <div className="glass rounded-sm p-8 text-center" id={id}>
        <p className="heading-section text-2xl">{pageCopy.forms.successTitle}</p>
        <p className="mt-2 text-muted">
          {form.successMessage ?? pageCopy.forms.successMessage}
        </p>
        <p className="mt-4 text-sm text-muted">
          Ответим в течение рабочего дня — в выбранном способе связи.
        </p>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="relative glass rounded-sm p-6 md:p-8"
      aria-labelledby={`${id}-title`}
    >
      <HoneypotField id={`${id}-website`} value={form.honeypot} onChange={form.setHoneypot} />

      <div className="mb-6 h-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full bg-graphite transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-muted">
        Шаг {step + 1} из 2 · {step === 0 ? "контакты" : "параметры дома"}
      </p>
      <p id={`${id}-title`} className="heading-section mt-2 text-2xl md:text-3xl">
        {title}
      </p>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>

      <div className="mt-6 space-y-4">
        {step === 0 && (
          <>
            <div>
              <Label htmlFor={`${id}-name`}>Имя</Label>
              <Input
                id={`${id}-name`}
                required
                autoComplete="name"
                value={form.values.name}
                onChange={(e) => form.setValue("name", e.target.value)}
                placeholder="Как к вам обращаться"
                className="mt-1"
              />
              {form.errors.name ? (
                <p className="mt-1 text-xs text-destructive">{form.errors.name}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor={`${id}-phone`}>Телефон</Label>
              <Input
                id={`${id}-phone`}
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                value={form.values.phone}
                onChange={(e) => form.setValue("phone", e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="mt-1"
              />
              {form.errors.phone ? (
                <p className="mt-1 text-xs text-destructive">{form.errors.phone}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor={`${id}-messenger`}>Как удобнее связаться</Label>
              <select
                id={`${id}-messenger`}
                value={form.values.messenger ?? "call"}
                onChange={(e) => form.setValue("messenger", e.target.value)}
                className={selectClassName}
              >
                {leadMessengerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div>
              <Label htmlFor={`${id}-area`}>Желаемая площадь, м²</Label>
              <Input
                id={`${id}-area`}
                type="number"
                inputMode="numeric"
                value={form.values.area ?? ""}
                onChange={(e) => form.setValue("area", e.target.value)}
                placeholder="Например, 120"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`${id}-budget`}>Ориентир по бюджету</Label>
              <select
                id={`${id}-budget`}
                value={form.values.budget ?? ""}
                onChange={(e) => form.setValue("budget", e.target.value)}
                className={selectClassName}
              >
                {leadBudgetOptions.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Участок</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {leadLandOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => form.setValue("hasLand", opt.value)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm transition",
                      form.values.hasLand === opt.value
                        ? "border-graphite bg-graphite text-background"
                        : "border-graphite/15 hover:border-graphite/40",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
            {showLandLocation ? (
              <div>
                <Label htmlFor={`${id}-land`}>Где участок</Label>
                <Input
                  id={`${id}-land`}
                  value={form.values.landLocation ?? ""}
                  onChange={(e) => form.setValue("landLocation", e.target.value)}
                  placeholder="Район, посёлок, КП"
                  className="mt-1"
                />
              </div>
            ) : null}
            <div>
              <Label htmlFor={`${id}-comment`}>
                Комментарий <span className="font-normal text-muted">(необязательно)</span>
              </Label>
              <textarea
                id={`${id}-comment`}
                value={form.values.comment ?? ""}
                onChange={(e) => form.setValue("comment", e.target.value)}
                placeholder={commentPlaceholder}
                className="mt-1 flex min-h-[88px] w-full rounded-sm border border-graphite/15 bg-background px-4 py-3 text-sm"
              />
            </div>
            <button
              type="button"
              className="text-sm text-muted underline-offset-4 hover:underline"
              onClick={() => setStep(0)}
            >
              ← Изменить контакты
            </button>
          </>
        )}
      </div>

      {form.errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {form.errorMessage}
        </p>
      )}

      <Button type="submit" className="mt-6 w-full" size="lg" disabled={form.isSubmitting}>
        {form.isSubmitting
          ? "Отправляем…"
          : step === 0
            ? "Далее: параметры дома"
            : (submitLabel ?? cta.preliminaryEstimate)}
      </Button>
      {footnote && <p className="mt-3 text-center text-xs text-muted">{footnote}</p>}
      <p className="mt-3 text-center text-xs text-muted">
        {privacyConsent}{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          {privacyLinkText}
        </Link>
      </p>
    </form>
  );
}
