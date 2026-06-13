"use client";

import { useState } from "react";
import Link from "next/link";
import type { LeadMagnet, LeadMagnetSubmitContext, LeadMagnetUserInput } from "@/types/lead-magnet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { brand } from "@/data/brand";
import { privacyConsent, privacyLinkText } from "@/data/copy";
import type { LeadContext } from "@/types/lead";
import { buildLeadFormInput, type LeadFormConfig } from "@/lib/leads/lead-source";
import { submitLead } from "@/lib/leads/submit-lead";
import { trackLeadMagnetEvent } from "@/lib/analytics/events";

type Props = {
  magnet: LeadMagnet;
  context: LeadMagnetSubmitContext;
  prefilledArea?: string;
  onSuccess?: () => void;
  compact?: boolean;
};

export function LeadMagnetForm({ magnet, context, prefilledArea, onSuccess, compact }: Props) {
  const [data, setData] = useState<LeadMagnetUserInput>({
    name: "",
    phone: "",
    area: prefilledArea ?? "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [successText, setSuccessText] = useState<string | null>(null);

  const handleStart = () => {
    if (!started) {
      setStarted(true);
      trackLeadMagnetEvent("lead_magnet_form_started", {
        leadMagnetId: magnet.id,
        leadMagnetType: magnet.type,
        pageType: context.pageType,
        pageSlug: context.pageSlug,
        clusterId: context.clusterId,
      });
    }
  };

  const buildConfig = (): LeadFormConfig => {
    const ctxPayload = context.context ?? {};
    const leadContext: LeadContext = {
      leadMagnet: {
        id: magnet.id,
        title: magnet.title,
        type: magnet.type,
        clusterIds: magnet.clusterIds,
        fileStatus: magnet.file?.generationStatus ?? "none",
      },
    };

    if (ctxPayload.projectSlug) {
      leadContext.project = {
        slug: ctxPayload.projectSlug,
        title: ctxPayload.projectTitle,
      };
    }
    if (ctxPayload.blogPostSlug) {
      leadContext.blog = { slug: ctxPayload.blogPostSlug, clusterId: context.clusterId };
    }
    if (ctxPayload.caseSlug) {
      leadContext.case = { slug: ctxPayload.caseSlug, title: ctxPayload.caseTitle };
    }
    if (ctxPayload.calculatorResult) {
      leadContext.calculator = ctxPayload.calculatorResult as LeadContext["calculator"];
    }
    if (ctxPayload.plannerSummary) {
      leadContext.planner = ctxPayload.plannerSummary as LeadContext["planner"];
    }

    return {
      sourceType: "lead-magnet",
      formId: `lead-magnet-${magnet.id}`,
      formName: magnet.title,
      pageSlug: context.pageSlug,
      requestType: "lead-magnet",
      requestTitle: magnet.cta.formTitle,
      selectedCTA: context.selectedCTA ?? magnet.cta.primaryLabel,
      conversionGoal: "lead_magnet_submit",
      context: leadContext,
    };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const input = buildLeadFormInput({
      contact: {
        name: data.name,
        phone: data.phone,
        area: data.area,
        comment: data.comment,
        budget: data.budget,
        material: data.material,
        hasLand: data.hasLand,
        landLocation: data.landLocation,
        messenger: data.messenger,
      },
      config: buildConfig(),
      comment: data.comment,
      honeypot,
      meta: { formOpenedAt: Date.now() },
    });

    const result = await submitLead(input);

    setLoading(false);

    if (result.success) {
      setSent(true);
      setSuccessText(result.message);
      trackLeadMagnetEvent("lead_magnet_submitted", {
        leadMagnetId: magnet.id,
        leadMagnetType: magnet.type,
        pageType: context.pageType,
        pageSlug: context.pageSlug,
        clusterId: context.clusterId,
      });
      trackLeadMagnetEvent("lead_magnet_success_viewed", { leadMagnetId: magnet.id });
      onSuccess?.();
    } else {
      trackLeadMagnetEvent("lead_magnet_error", { leadMagnetId: magnet.id });
      setError(
        result.message ||
          `Не удалось отправить заявку. Позвоните ${brand.phoneDisplay} или попробуйте снова.`,
      );
    }
  };

  if (sent) {
    return (
      <div className="rounded-sm border border-wood/30 bg-wood/5 p-6 text-center">
        <p className="font-display text-xl">{magnet.cta.successTitle}</p>
        <p className="mt-2 text-sm text-muted">{successText ?? magnet.cta.successMessage}</p>
      </div>
    );
  }

  const ff = magnet.formFields;

  return (
    <form onSubmit={submit} className="space-y-4" onFocus={handleStart}>
      <HoneypotField id={`${magnet.id}-website`} value={honeypot} onChange={setHoneypot} />

      {!compact ? (
        <>
          <p className="font-display text-xl">{magnet.cta.formTitle}</p>
          <p className="text-sm text-muted">{magnet.cta.formDescription}</p>
        </>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {ff.name ? (
          <div className={!ff.phone ? "sm:col-span-2" : ""}>
            <Label htmlFor={`${magnet.id}-name`}>Имя</Label>
            <Input
              id={`${magnet.id}-name`}
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="mt-1"
              placeholder="Как к вам обращаться"
            />
          </div>
        ) : null}
        {ff.phone ? (
          <div className={!ff.name ? "sm:col-span-2" : ""}>
            <Label htmlFor={`${magnet.id}-phone`}>Телефон</Label>
            <Input
              id={`${magnet.id}-phone`}
              type="tel"
              required
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="mt-1"
              placeholder="+7 (___) ___-__-__"
            />
          </div>
        ) : null}
      </div>

      {ff.area ? (
        <div>
          <Label htmlFor={`${magnet.id}-area`}>Площадь, м²</Label>
          <Input
            id={`${magnet.id}-area`}
            value={data.area ?? ""}
            onChange={(e) => setData({ ...data, area: e.target.value })}
            className="mt-1"
            placeholder="120"
          />
        </div>
      ) : null}

      {ff.budget ? (
        <div>
          <Label htmlFor={`${magnet.id}-budget`}>Ориентир бюджета</Label>
          <Input
            id={`${magnet.id}-budget`}
            value={data.budget ?? ""}
            onChange={(e) => setData({ ...data, budget: e.target.value })}
            className="mt-1"
            placeholder="Например, до 8 млн"
          />
        </div>
      ) : null}

      {ff.material ? (
        <div>
          <Label htmlFor={`${magnet.id}-material`}>Материал</Label>
          <Input
            id={`${magnet.id}-material`}
            value={data.material ?? ""}
            onChange={(e) => setData({ ...data, material: e.target.value })}
            className="mt-1"
            placeholder="каркас, брус, газобетон"
          />
        </div>
      ) : null}

      {ff.landLocation ? (
        <div>
          <Label htmlFor={`${magnet.id}-land`}>Район / локация участка</Label>
          <Input
            id={`${magnet.id}-land`}
            value={data.landLocation ?? ""}
            onChange={(e) => setData({ ...data, landLocation: e.target.value })}
            className="mt-1"
            placeholder="Иркутск, область, посёлок"
          />
        </div>
      ) : null}

      {ff.hasLand ? (
        <div>
          <Label htmlFor={`${magnet.id}-hasland`}>Есть ли участок?</Label>
          <select
            id={`${magnet.id}-hasland`}
            value={data.hasLand ?? ""}
            onChange={(e) => setData({ ...data, hasLand: e.target.value })}
            className="mt-1 w-full rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
          >
            <option value="">Выберите</option>
            <option value="yes">Да, участок есть</option>
            <option value="searching">Ищу участок</option>
            <option value="no">Пока нет</option>
          </select>
        </div>
      ) : null}

      {ff.planningScenario ? (
        <div>
          <Label htmlFor={`${magnet.id}-scenario`}>Сценарий / состав семьи</Label>
          <Input
            id={`${magnet.id}-scenario`}
            value={data.planningScenario ?? ""}
            onChange={(e) => setData({ ...data, planningScenario: e.target.value })}
            className="mt-1"
            placeholder="Семья с детьми, постоянное проживание"
          />
        </div>
      ) : null}

      {ff.messenger ? (
        <div>
          <Label htmlFor={`${magnet.id}-messenger`}>Мессенджер</Label>
          <Input
            id={`${magnet.id}-messenger`}
            value={data.messenger ?? ""}
            onChange={(e) => setData({ ...data, messenger: e.target.value })}
            className="mt-1"
            placeholder="Telegram, WhatsApp"
          />
        </div>
      ) : null}

      {ff.comment ? (
        <div>
          <Label htmlFor={`${magnet.id}-comment`}>Комментарий</Label>
          <textarea
            id={`${magnet.id}-comment`}
            value={data.comment ?? ""}
            onChange={(e) => setData({ ...data, comment: e.target.value })}
            className="mt-1 flex min-h-[80px] w-full rounded-sm border border-graphite/15 bg-background px-4 py-3 text-sm"
            placeholder="Участок, сроки, пожелания"
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Отправляем…" : magnet.cta.primaryLabel}
      </Button>

      {magnet.legalNote ? <p className="text-xs text-muted">{magnet.legalNote}</p> : null}

      <p className="text-center text-xs text-muted">
        {privacyConsent}{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          {privacyLinkText}
        </Link>
      </p>
    </form>
  );
}
