"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { calculateHouseCost } from "@/lib/calculator";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { CalculatorInput, Material } from "@/types";
import { LeadForm } from "@/components/forms/lead-form";
import { PlannerPromo } from "@/components/planner/planner-promo";
import { calculatorDisclaimer, cta } from "@/data/copy";

const materials: Material[] = ["каркас", "газобетон", "кирпич", "брус", "клееный брус"];

export function CalculatorForm() {
  const [input, setInput] = useState<CalculatorInput>({
    area: 150,
    floors: 1,
    material: "газобетон",
    foundation: "ленточный",
    finish: "под ключ",
    utilities: true,
    plotPrep: false,
  });
  const [showLead, setShowLead] = useState(false);

  const result = useMemo(() => calculateHouseCost(input), [input]);

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="space-y-8">
        <div>
          <Label>Площадь: {input.area} м²</Label>
          <Slider
            className="mt-3"
            min={80}
            max={350}
            step={5}
            value={[input.area]}
            onValueChange={([v]) => setInput({ ...input, area: v })}
          />
        </div>

        <div>
          <Label>Этажность</Label>
          <div className="mt-2 flex gap-2">
            {([1, 2] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setInput({ ...input, floors: f })}
                className={`rounded-sm border px-4 py-2 text-sm ${
                  input.floors === f ? "border-graphite bg-graphite text-background" : ""
                }`}
              >
                {f} этаж
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Материал</Label>
          <select
            className="mt-2 w-full rounded-sm border border-graphite/15 bg-background px-3 py-2"
            value={input.material}
            onChange={(e) => setInput({ ...input, material: e.target.value as Material })}
          >
            {materials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Фундамент</Label>
          <select
            className="mt-2 w-full rounded-sm border border-graphite/15 bg-background px-3 py-2"
            value={input.foundation}
            onChange={(e) =>
              setInput({
                ...input,
                foundation: e.target.value as CalculatorInput["foundation"],
              })
            }
          >
            <option value="ленточный">Ленточный</option>
            <option value="плита">Плита</option>
            <option value="свайный">Свайный</option>
          </select>
        </div>

        <div>
          <Label>Отделка</Label>
          <select
            className="mt-2 w-full rounded-sm border border-graphite/15 bg-background px-3 py-2"
            value={input.finish}
            onChange={(e) =>
              setInput({ ...input, finish: e.target.value as CalculatorInput["finish"] })
            }
          >
            <option value="коробка">Коробка</option>
            <option value="предчистовая">Предчистовая</option>
            <option value="под ключ">Под ключ</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={input.utilities}
            onChange={(e) => setInput({ ...input, utilities: e.target.checked })}
          />
          Коммуникации
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={input.plotPrep}
            onChange={(e) => setInput({ ...input, plotPrep: e.target.checked })}
          />
          Подготовка участка
        </label>
      </div>

      <div>
        <div className="glass rounded-sm p-8">
          <p className="label-caps">Ориентировочная стоимость</p>
          <p className="mt-2 font-display text-4xl md:text-5xl">{formatPrice(result.total)}</p>
          <p className="mt-2 text-muted">
            {formatPrice(result.perSqm)}/м² · ~{result.buildMonths} мес.
          </p>
          <ul className="mt-6 space-y-2 border-t border-graphite/10 pt-6">
            {result.breakdown.map((b) => (
              <li key={b.label} className="flex justify-between text-sm">
                <span className="text-muted">{b.label}</span>
                <span>{formatPrice(b.amount)}</span>
              </li>
            ))}
          </ul>
          <Button
            className="mt-8 w-full"
            size="lg"
            onClick={() => {
              setShowLead(true);
              trackEvent("calculator_submit", {
                area: input.area,
                material: input.material,
                total: result.total,
              });
            }}
          >
            {cta.preliminaryPdf}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">{calculatorDisclaimer}</p>
          <div className="mt-6 border-t border-graphite/10 pt-6">
            <PlannerPromo variant="compact" />
          </div>
        </div>
        {showLead && (
          <div className="mt-8">
            <LeadForm
              id="calc-lead"
              title={cta.stagedEstimate}
              subtitle="Отправим смету с разбивкой по этапам на почту или в мессенджер"
              source="calculator"
              prefilledArea={String(input.area)}
              prefilledComment={[
                `Параметры расчёта: ${input.area} м², ${input.floors} эт., материал — ${input.material}, фундамент — ${input.foundation}, отделка — ${input.finish}.`,
                `Итог: ${formatPrice(result.total)} (~${formatPrice(result.perSqm)}/м², ${result.buildMonths} мес.)`,
                result.breakdown.map((b) => `  ${b.label}: ${formatPrice(b.amount)}`).join("\n"),
              ].join("\n")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
