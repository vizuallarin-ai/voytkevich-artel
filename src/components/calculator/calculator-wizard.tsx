"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalculatorResult } from "@/components/calculator/calculator-result";
import { CalculatorBreakdown } from "@/components/calculator/calculator-breakdown";
import { CalculatorPriceFactors } from "@/components/calculator/calculator-price-factors";
import { CalculatorLeadSection } from "@/components/calculator/calculator-lead-section";
import { CalculatorRelatedProjects } from "@/components/calculator/calculator-related-projects";
import { CalculatorStickyCta } from "@/components/calculator/calculator-sticky-cta";
import {
  CALCULATOR_AREA_MAX,
  CALCULATOR_AREA_MIN,
  CALCULATOR_AREA_STEP,
  CALCULATOR_MATERIALS,
  DEFAULT_CALCULATOR_INPUT,
  calculateEstimate,
  parseCalculatorSearchParams,
  type AdditionalOptionId,
  type CalculatorEstimateInput,
  type FoundationType,
  type HousePurpose,
  type LandStatus,
  type PackageTypeId,
} from "@/lib/calculator";
import { trackCalculatorEvent } from "@/lib/calculator-analytics";
import { findProjectsForEstimate } from "@/lib/calculator-projects";
import {
  calculatorAdditionalOptions,
  calculatorPackages,
  calculatorSteps,
} from "@/data/calculator-copy";
import { projects, getProjectBySlug } from "@/data/projects";
import type { Material } from "@/types";
import { cn } from "@/lib/utils";

const PURPOSES: { value: HousePurpose; label: string }[] = [
  { value: "постоянное", label: "Постоянное проживание" },
  { value: "дачный", label: "Дачный дом" },
  { value: "загородный", label: "Загородный дом" },
  { value: "семья", label: "Дом для семьи" },
  { value: "ипотека", label: "Дом в ипотеку" },
];

const LAND_OPTIONS: { value: LandStatus; label: string }[] = [
  { value: "да", label: "Да, участок есть" },
  { value: "нет", label: "Нет, пока нет" },
  { value: "подбираю", label: "Подбираю участок" },
  { value: "есть_не_проверен", label: "Есть, но ещё не проверял" },
];

const FOUNDATIONS: { value: FoundationType; label: string }[] = [
  { value: "не_знаю", label: "Не знаю" },
  { value: "ленточный", label: "Ленточный" },
  { value: "плита", label: "Плита" },
  { value: "свайный", label: "Сваи" },
  { value: "базовый", label: "Базовый (ориентир)" },
];

const COMM_OPTIONS = [
  "электричество",
  "вода",
  "канализация",
  "газ",
  "ничего не подведено",
  "не знаю",
] as const;

function SelectButtons<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-sm border px-3 py-2 text-sm transition",
            value === opt.value
              ? "border-graphite bg-graphite text-background"
              : "border-graphite/15 hover:border-graphite/40",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function buildInitialInput(searchParams: URLSearchParams): CalculatorEstimateInput {
  const partial = parseCalculatorSearchParams(searchParams);
  const slug = partial.projectSlug;
  let projectTitle: string | undefined;

  if (slug) {
    const project = getProjectBySlug(slug);
    if (project) {
      projectTitle = project.name;
      partial.projectTitle = project.name;
      partial.projectSlug = project.slug;
      if (!partial.area) partial.area = project.specs.area;
      if (!searchParams.get("material")) partial.material = project.specs.material;
      if (!searchParams.get("floors")) {
        partial.floors =
          project.specs.floors <= 2 ? (project.specs.floors as 1 | 2) : 2;
      }
      if (!partial.bedrooms) {
        partial.bedrooms = Math.min(4, project.specs.bedrooms) as 1 | 2 | 3 | 4;
      }
      if (!partial.bathrooms) {
        partial.bathrooms = Math.min(3, project.specs.bathrooms) as 1 | 2 | 3;
      }
    } else {
      partial.projectSlug = undefined;
    }
  }

  return { ...DEFAULT_CALCULATOR_INPUT, ...partial, projectTitle };
}

export function CalculatorWizard() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(() => buildInitialInput(searchParams));
  const [step, setStep] = useState(1);
  const [resultViewed, setResultViewed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackCalculatorEvent("calculator_started", {
      source: input.source,
      projectSlug: input.projectSlug,
      area: input.area,
    });
  }, [input.source, input.projectSlug, input.area]);

  const result = useMemo(() => calculateEstimate(input), [input]);
  const related = useMemo(
    () => findProjectsForEstimate(input, result, projects, 6),
    [input, result],
  );

  const patch = useCallback((partial: Partial<CalculatorEstimateInput>) => {
    setInput((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleComm = (item: string) => {
    setInput((prev) => {
      const set = new Set(prev.communications);
      if (set.has(item)) set.delete(item);
      else set.add(item);
      return { ...prev, communications: [...set] };
    });
  };

  const toggleExtra = (id: AdditionalOptionId) => {
    setInput((prev) => {
      const has = prev.additionalOptions.includes(id);
      return {
        ...prev,
        additionalOptions: has
          ? prev.additionalOptions.filter((x) => x !== id)
          : [...prev.additionalOptions, id],
      };
    });
  };

  const goNext = () => {
    const next = Math.min(step + 1, 5);
    trackCalculatorEvent("calculator_step_completed", { step: next });
    setStep(next);
    if (next === 5) {
      setResultViewed(true);
      trackCalculatorEvent("calculator_result_viewed", {
        area: input.area,
        material: input.material,
        floors: input.floors,
        packageType: input.packageType,
        totalMin: result.totalMin,
        totalMax: result.totalMax,
        projectSlug: input.projectSlug,
      });
    }
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const reset = () => {
    setInput(DEFAULT_CALCULATOR_INPUT);
    setStep(1);
    setResultViewed(false);
    trackCalculatorEvent("calculator_reset");
  };

  const progress = (step / calculatorSteps.length) * 100;

  return (
    <div id="calculator-form" className="scroll-mt-28 pb-28 lg:pb-20">
      {input.projectTitle && (
        <div className="mb-8 rounded-sm border border-graphite/10 bg-sand/40 p-4">
          <p className="text-sm font-medium">Расчёт по проекту {input.projectTitle}</p>
          <p className="mt-1 text-sm text-muted">
            Параметры подставлены из карточки проекта. Вы можете изменить их перед расчётом.
          </p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {calculatorSteps.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => s.id <= step && setStep(s.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs uppercase tracking-wide transition",
                step === s.id
                  ? "bg-graphite text-background"
                  : s.id < step
                    ? "bg-sand text-foreground"
                    : "bg-sand/50 text-muted",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-sand">
          <div
            className="h-full bg-graphite transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {step === 1 && (
            <section aria-labelledby="step-house">
              <h2 id="step-house" className="font-display text-xl">
                Параметры дома
              </h2>

              <div className="mt-6">
                <Label htmlFor="calc-area">
                  Площадь дома: {input.area} м²
                </Label>
                <Slider
                  id="calc-area"
                  className="mt-3"
                  min={CALCULATOR_AREA_MIN}
                  max={CALCULATOR_AREA_MAX}
                  step={CALCULATOR_AREA_STEP}
                  value={[input.area]}
                  onValueChange={([v]) => patch({ area: v })}
                />
                <Input
                  type="number"
                  className="mt-2 w-32"
                  min={CALCULATOR_AREA_MIN}
                  max={CALCULATOR_AREA_MAX}
                  value={input.area}
                  onChange={(e) => patch({ area: Number(e.target.value) || input.area })}
                />
                <p className="mt-2 text-xs text-muted">
                  Ориентируйтесь на полезную площадь дома. Чем больше площадь, тем выше
                  стоимость коробки, кровли, инженерии и отделки.
                </p>
              </div>

              <div className="mt-8">
                <Label>Этажность</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([1, 2] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => patch({ floors: f })}
                      className={cn(
                        "rounded-sm border px-3 py-2 text-sm",
                        input.floors === f
                          ? "border-graphite bg-graphite text-background"
                          : "border-graphite/15",
                      )}
                    >
                      {f} этаж
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Этажность влияет на фундамент, перекрытия, кровлю, лестницу и планировку.
                </p>
              </div>

              <div className="mt-8">
                <Label htmlFor="calc-material">Материал стен</Label>
                <select
                  id="calc-material"
                  className="mt-2 w-full rounded-sm border border-graphite/15 bg-background px-3 py-2"
                  value={input.material}
                  onChange={(e) => patch({ material: e.target.value as Material })}
                >
                  {CALCULATOR_MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-muted">
                  Материал влияет на цену стен, фундамент, утепление, сроки и эксплуатацию.
                </p>
              </div>

              <div className="mt-8">
                <Label>Назначение дома</Label>
                <SelectButtons
                  value={input.purpose}
                  options={PURPOSES}
                  onChange={(v) => patch({ purpose: v })}
                />
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label>Спальни</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {([1, 2, 3, 4] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => patch({ bedrooms: n })}
                        className={cn(
                          "rounded-sm border px-3 py-2 text-sm",
                          input.bedrooms === n
                            ? "border-graphite bg-graphite text-background"
                            : "border-graphite/15",
                        )}
                      >
                        {n === 4 ? "4+" : n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Санузлы</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {([1, 2, 3] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => patch({ bathrooms: n })}
                        className={cn(
                          "rounded-sm border px-3 py-2 text-sm",
                          input.bathrooms === n
                            ? "border-graphite bg-graphite text-background"
                            : "border-graphite/15",
                        )}
                      >
                        {n === 3 ? "3+" : n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Label>Фундамент</Label>
                <SelectButtons
                  value={input.foundation}
                  options={FOUNDATIONS}
                  onChange={(v) => patch({ foundation: v })}
                />
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="step-land">
              <h2 id="step-land" className="font-display text-xl">
                Участок и условия строительства
              </h2>
              <p className="mt-2 text-sm text-muted">
                Эти параметры не всегда меняют предварительную сумму автоматически, но важны
                для точной сметы.
              </p>

              <div className="mt-6">
                <Label>Есть ли участок?</Label>
                <SelectButtons
                  value={input.hasLand}
                  options={LAND_OPTIONS}
                  onChange={(v) => patch({ hasLand: v })}
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="land-loc">Где находится участок?</Label>
                <Input
                  id="land-loc"
                  className="mt-2"
                  placeholder="Город, район, посёлок"
                  value={input.landLocation}
                  onChange={(e) => patch({ landLocation: e.target.value })}
                />
              </div>

              <div className="mt-6">
                <Label>Нужна ли геология?</Label>
                <SelectButtons
                  value={input.geology}
                  options={[
                    { value: "не_знаю", label: "Не знаю" },
                    { value: "есть", label: "Уже есть" },
                    { value: "нужна_консультация", label: "Нужна консультация" },
                  ]}
                  onChange={(v) => patch({ geology: v })}
                />
              </div>

              <div className="mt-6">
                <Label>Подъезд техники</Label>
                <SelectButtons
                  value={input.access}
                  options={[
                    { value: "хороший", label: "Хороший" },
                    { value: "ограниченный", label: "Ограниченный" },
                    { value: "не_знаю", label: "Не знаю" },
                  ]}
                  onChange={(v) => patch({ access: v })}
                />
              </div>

              <div className="mt-6">
                <Label>Уклон участка</Label>
                <SelectButtons
                  value={input.slope}
                  options={[
                    { value: "ровный", label: "Ровный" },
                    { value: "есть_уклон", label: "Есть уклон" },
                    { value: "не_знаю", label: "Не знаю" },
                  ]}
                  onChange={(v) => patch({ slope: v })}
                />
              </div>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium">Коммуникации</legend>
                <div className="mt-2 space-y-2">
                  {COMM_OPTIONS.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={input.communications.includes(c)}
                        onChange={() => toggleComm(c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="step-package">
              <h2 id="step-package" className="font-display text-xl">
                Комплектация
              </h2>
              <p className="mt-2 text-sm text-muted">
                Состав комплектации уточняется перед сметой и договором.
              </p>
              <div className="mt-6 grid gap-4">
                {calculatorPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => patch({ packageType: pkg.id as PackageTypeId })}
                    className={cn(
                      "rounded-sm border p-5 text-left transition",
                      input.packageType === pkg.id
                        ? "border-graphite bg-sand/60"
                        : "border-graphite/10 hover:border-graphite/30",
                    )}
                  >
                    <p className="font-medium">{pkg.title}</p>
                    <p className="mt-2 text-sm text-muted">{pkg.description}</p>
                    <p className="mt-2 text-xs text-muted">{pkg.audience}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section aria-labelledby="step-extras">
              <h2 id="step-extras" className="font-display text-xl">
                Дополнительные решения
              </h2>
              <p className="mt-2 text-sm text-muted">
                Дополнительные решения могут увеличить стоимость, но делают дом удобнее под
                конкретный сценарий жизни.
              </p>
              <div className="mt-6 space-y-3">
                {calculatorAdditionalOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-start gap-3 rounded-sm border border-graphite/10 p-4"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={input.additionalOptions.includes(opt.id)}
                      onChange={() => toggleExtra(opt.id)}
                    />
                    <span>
                      <span className="font-medium">{opt.label}</span>
                      <span className="mt-1 block text-sm text-muted">{opt.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {step === 5 && (
            <div className="space-y-12 lg:hidden">
              <CalculatorBreakdown items={result.breakdown} />
              <CalculatorPriceFactors />
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={goBack}>
                Назад
              </Button>
            )}
            {step < 5 && (
              <Button type="button" onClick={goNext}>
                {step === 4 ? "Показать результат" : "Далее"}
              </Button>
            )}
            {step === 5 && (
              <Button type="button" variant="ghost" onClick={reset}>
                Новый расчёт
              </Button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <CalculatorResult
            input={input}
            result={result}
            onScrollToLead={() => {
              if (step < 5) {
                setStep(5);
                setResultViewed(true);
                trackCalculatorEvent("calculator_result_viewed", {
                  area: input.area,
                  material: input.material,
                  totalMin: result.totalMin,
                  totalMax: result.totalMax,
                });
              }
              trackCalculatorEvent("calculator_lead_form_opened");
            }}
          />
        </aside>
      </div>

      {step === 5 && (
        <>
          <div className="mt-12 hidden space-y-12 lg:block">
            <CalculatorBreakdown items={result.breakdown} />
            <CalculatorPriceFactors />
          </div>
          <CalculatorRelatedProjects projects={related} />
          <CalculatorLeadSection input={input} result={result} />
        </>
      )}

      <CalculatorStickyCta result={result} visible={resultViewed && step === 5} />
    </div>
  );
}
