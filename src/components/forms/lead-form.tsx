"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormAutosave } from "@/hooks/use-form-autosave";
import { trackEvent } from "@/lib/analytics";
import { brand } from "@/data/brand";
import { cta, privacyConsent, privacyLinkText } from "@/data/copy";
import { pageCopy } from "@/data/positioning";

type FormData = { name: string; phone: string; area: string; comment: string };

const empty: FormData = { name: "", phone: "", area: "", comment: "" };

export function LeadForm({
  id = "lead",
  title = cta.preliminaryEstimate,
  subtitle = pageCopy.forms.defaultSubtitle,
  prefilledArea,
  prefilledComment,
  source,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  prefilledArea?: string;
  prefilledComment?: string;
  /** Analytics source label, e.g. "calc", "planner", "quiz" */
  source?: string;
}) {
  const [data, setData] = useState<FormData>({
    ...empty,
    area: prefilledArea ?? "",
    comment: prefilledComment ?? "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      ...(prefilledArea !== undefined ? { area: prefilledArea } : {}),
      ...(prefilledComment !== undefined ? { comment: prefilledComment } : {}),
    }));
  }, [prefilledArea, prefilledComment]);

  useFormAutosave(`lead-${id}`, data, setData);

  const progress = step === 0 ? 33 : step === 1 ? 66 : 100;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: source ?? id }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };

      if (!res.ok) {
        throw new Error(payload.message ?? "server");
      }

      setSent(true);
      localStorage.removeItem(`lead-${id}`);
      trackEvent("lead_submit", { source: source ?? id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg && msg !== "server"
          ? msg
          : `Не удалось отправить заявку. Позвоните ${brand.phoneDisplay} или попробуйте снова.`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="glass rounded-sm p-8 text-center" id={id}>
        <p className="heading-section text-2xl">{pageCopy.forms.successTitle}</p>
        <p className="mt-2 text-muted">{pageCopy.forms.successMessage}</p>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={submit}
      className="glass rounded-sm p-6 md:p-8"
      aria-labelledby={`${id}-title`}
    >
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
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Как к вам обращаться"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`${id}-phone`}>Телефон</Label>
              <Input
                id={`${id}-phone`}
                type="tel"
                required
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+7 (___) ___-__-__"
                className="mt-1"
              />
            </div>
          </>
        )}
        {step === 1 && (
          <div>
            <Label htmlFor={`${id}-area`}>Желаемая площадь, м²</Label>
            <Input
              id={`${id}-area`}
              type="number"
              value={data.area}
              onChange={(e) => setData({ ...data, area: e.target.value })}
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
              value={data.comment}
              onChange={(e) => setData({ ...data, comment: e.target.value })}
              placeholder="Участок, сроки, пожелания"
              className="mt-1 flex min-h-[100px] w-full rounded-sm border border-graphite/15 bg-background px-4 py-3 text-sm"
            />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-6 w-full" size="lg" disabled={loading}>
        {loading ? "Отправляем…" : step < 2 ? "Далее" : cta.preliminaryEstimate}
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        {privacyConsent}{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          {privacyLinkText}
        </Link>
      </p>
    </form>
  );
}
