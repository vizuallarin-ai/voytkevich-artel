"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LeadFormContact, LeadFormInput, LeadSubmitResult } from "@/types/lead";
import type { LeadFormConfig } from "@/lib/leads/lead-source";
import { buildLeadFormInput } from "@/lib/leads/lead-source";
import { submitLead } from "@/lib/leads/submit-lead";
import { brand } from "@/data/brand";

export type UseLeadFormOptions = {
  config: LeadFormConfig;
  defaultValues?: Partial<LeadFormContact>;
  onSuccess?: (result: LeadSubmitResult) => void;
  onError?: (message: string) => void;
  successMessage?: string;
};

export function useLeadForm(options: UseLeadFormOptions) {
  const { config, defaultValues, onSuccess, onError, successMessage } = options;
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const [values, setValues] = useState<LeadFormContact>({
    name: defaultValues?.name ?? "",
    phone: defaultValues?.phone ?? "",
    area: defaultValues?.area ?? "",
    comment: defaultValues?.comment ?? "",
    messenger: defaultValues?.messenger,
    budget: defaultValues?.budget,
    material: defaultValues?.material,
    hasLand: defaultValues?.hasLand,
    landLocation: defaultValues?.landLocation,
  });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormContact, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const setValue = useCallback(<K extends keyof LeadFormContact>(key: K, value: LeadFormContact[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const reset = useCallback(() => {
    setValues({
      name: "",
      phone: "",
      area: defaultValues?.area ?? "",
      comment: defaultValues?.comment ?? "",
    });
    setHoneypot("");
    setIsSuccess(false);
    setErrorMessage(null);
    setResultMessage(null);
    openedAt.current = Date.now();
  }, [defaultValues?.area, defaultValues?.comment]);

  const buildInput = useCallback(
    (comment?: string): LeadFormInput =>
      buildLeadFormInput({
        contact: { ...values, comment: comment ?? values.comment },
        config,
        comment,
        honeypot,
        meta: { formOpenedAt: openedAt.current },
      }),
    [values, config, honeypot],
  );

  const submit = useCallback(async (commentOverride?: string) => {
    if (isSubmitting) return;

    if (!values.name.trim()) {
      setErrors({ name: "Укажите имя" });
      return;
    }
    if (!values.phone.trim()) {
      setErrors({ phone: "Укажите телефон" });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await submitLead(buildInput(commentOverride));

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setResultMessage(successMessage ?? result.message);
      onSuccess?.(result);
    } else {
      const msg =
        result.message ||
        `Не удалось отправить заявку. Позвоните ${brand.phoneDisplay} или попробуйте снова.`;
      setErrorMessage(msg);
      onError?.(msg);
    }
  }, [isSubmitting, values, buildInput, successMessage, onSuccess, onError]);

  return useMemo(
    () => ({
      values,
      errors,
      isSubmitting,
      isSuccess,
      errorMessage,
      successMessage: resultMessage,
      honeypot,
      setHoneypot,
      setValue,
      submit,
      reset,
      buildInput,
    }),
    [
      values,
      errors,
      isSubmitting,
      isSuccess,
      errorMessage,
      resultMessage,
      honeypot,
      setValue,
      submit,
      reset,
      buildInput,
    ],
  );
}
