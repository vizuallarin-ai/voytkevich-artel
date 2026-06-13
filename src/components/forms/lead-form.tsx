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

export function LeadForm({
  id = "lead",
  title = cta.preliminaryEstimate,
  subtitle = pageCopy.forms.defaultSubtitle,
  prefilledArea,
  prefilledComment,
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
  prefilledComment?: string;
  /** @deprecated Use leadConfig — kept for backward compatibility */
  source?: string;
  submitLabel?: string;
  footnote?: string;
  leadConfig?: LeadFormConfig;
  successMessage?: string;
}) {
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
      comment: prefilledComment ?? "",
    },
    successMessage,
  });

  const [step, setStep] = useState(0);

  useEffect(() => {
    form.setValue("area", prefilledArea ?? form.values.area);
    if (prefilledComment !== undefined) {
      form.setValue("comment", prefilledComment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync prefilled props only
  }, [prefilledArea, prefilledComment]);

  useFormAutosave(`lead-${id}`, form.values, (saved) => {
    Object.entries(saved).forEach(([key, value]) => {
      if (typeof value === "string") {
        form.setValue(key as keyof typeof form.values, value);
      }
    });
  });

  const progress = step === 0 ? 33 : step === 1 ? 66 : 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    await form.submit(prefilledComment ?? form.values.comment);
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
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="glass rounded-sm p-6 md:p-8"
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
      <p id={`${id}-title`} className="heading-section text-2xl md:text-3xl">
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
                value={form.values.phone}
                onChange={(e) => form.setValue("phone", e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="mt-1"
              />
              {form.errors.phone ? (
                <p className="mt-1 text-xs text-destructive">{form.errors.phone}</p>
              ) : null}
            </div>
          </>
        )}
        {step === 1 && (
          <div>
            <Label htmlFor={`${id}-area`}>Желаемая площадь, м²</Label>
            <Input
              id={`${id}-area`}
              type="number"
              value={form.values.area ?? ""}
              onChange={(e) => form.setValue("area", e.target.value)}
              placeholder="120–240"
              className="mt-1"
            />
          </div>
        )}
        {step === 2 && (
          <div>
            <Label htmlFor={`${id}-comment`}>Комментарий</Label>
            <textarea
              id={`${id}-comment`}
              value={form.values.comment ?? ""}
              onChange={(e) => form.setValue("comment", e.target.value)}
              placeholder="Участок, сроки, пожелания"
              className="mt-1 flex min-h-[100px] w-full rounded-sm border border-graphite/15 bg-background px-4 py-3 text-sm"
            />
          </div>
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
        {form.isSubmitting ? "Отправляем…" : step < 2 ? "Далее" : submitLabel ?? cta.preliminaryEstimate}
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
