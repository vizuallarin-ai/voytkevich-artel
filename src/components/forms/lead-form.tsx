"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormAutosave } from "@/hooks/use-form-autosave";

type FormData = { name: string; phone: string; area: string; comment: string };

const empty: FormData = { name: "", phone: "", area: "", comment: "" };

export function LeadForm({
  id = "lead",
  title = "Получить расчёт",
  subtitle = "Перезвоним в течение 15 минут с ориентировочной сметой",
}: {
  id?: string;
  title?: string;
  subtitle?: string;
}) {
  const [data, setData] = useState<FormData>(empty);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(0);

  useFormAutosave(`lead-${id}`, data, setData);

  const progress = step === 0 ? 33 : step === 1 ? 66 : 100;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setSent(true);
    localStorage.removeItem(`lead-${id}`);
  };

  if (sent) {
    return (
      <div className="glass rounded-sm p-8 text-center" id={id}>
        <p className="heading-section text-2xl">Заявка отправлена</p>
        <p className="mt-2 text-muted">Менеджер свяжется с вами в ближайшее время.</p>
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

      <Button type="submit" className="mt-6 w-full" size="lg">
        {step < 2 ? "Далее" : "Отправить заявку"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
      </p>
    </form>
  );
}
