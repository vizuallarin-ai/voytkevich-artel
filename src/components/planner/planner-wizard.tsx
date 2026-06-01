"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Home, Layers } from "lucide-react";
import { PlannerCanvas } from "@/components/planner/planner-canvas";
import { RoomEditorPanel } from "@/components/planner/room-editor-panel";
import { LeadForm } from "@/components/forms/lead-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usePlannerEditor } from "@/hooks/use-planner-editor";
import { DEFAULT_PLANNER_INPUT, plannerSummaryForLead } from "@/lib/planner";
import { cn, formatNumber, formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { Material, PlannerInput, PlannerLayoutVariant } from "@/types";

const materials: Material[] = ["каркас", "газобетон", "кирпич", "брус", "клееный брус"];
const finishOptions: PlannerInput["finish"][] = [
  "коробка",
  "предчистовая",
  "под ключ",
];

export function PlannerWizard() {
  const editor = usePlannerEditor(DEFAULT_PLANNER_INPUT);
  const {
    input,
    setInput,
    floorPlans,
    floorIdx,
    setFloorIdx,
    roomsOnFloor,
    roomAreas,
    calculator,
    matchedProject,
    totalRoomsArea,
    areaDelta,
    selectedId,
    setSelectedId,
    isCustomized,
    updateRoomArea,
    moveRoom,
    resetLayout,
  } = editor;

  const leadComment = useMemo(
    () =>
      plannerSummaryForLead(input, {
        calculator,
        matchedProject,
        roomAreas,
        customized: isCustomized,
      }),
    [input, calculator, matchedProject, roomAreas, isCustomized],
  );


  const floorLabel = floorPlans[floorIdx]?.label ?? "Этаж";

  return (
    <div className="space-y-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="space-y-8 lg:sticky lg:top-28">
          <ParamsPanel input={input} setInput={setInput} />
        </div>

        <div className="space-y-6">
          <PlannerCanvas
            plans={floorPlans}
            floorIdx={floorIdx}
            onFloorChange={setFloorIdx}
            roomsOnFloor={roomsOnFloor}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={moveRoom}
            twoFloors={input.floors === 2}
          />

          <RoomEditorPanel
            rooms={roomsOnFloor}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAreaChange={updateRoomArea}
            onReset={resetLayout}
            isCustomized={isCustomized}
            floorLabel={floorLabel}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm border border-graphite/10 bg-muted-bg p-5">
              <p className="text-xs text-muted">Ориентир «под ключ»</p>
              <p className="mt-1 font-display text-2xl">{formatPrice(calculator.total)}</p>
              <p className="mt-1 text-sm text-muted">
                ~{formatPrice(calculator.perSqm)}/м² · {calculator.buildMonths} мес.
              </p>
            </div>
            <div className="rounded-sm border border-graphite/10 bg-muted-bg p-5">
              <p className="text-xs text-muted">Сумма комнат на схеме</p>
              <p className="mt-1 font-display text-2xl">~{formatNumber(totalRoomsArea)} м²</p>
              <p
                className={cn(
                  "mt-1 text-sm",
                  areaDelta < 85 || areaDelta > 105 ? "text-wood" : "text-muted",
                )}
              >
                {areaDelta}% от заявленных {input.area} м²
                {areaDelta < 85 || areaDelta > 105
                  ? " — подкорректируйте площади комнат"
                  : ""}
              </p>
            </div>
          </div>

          {matchedProject && (
            <div className="flex flex-col gap-4 rounded-sm border border-wood/30 bg-wood/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Home className="h-5 w-5 shrink-0 text-wood" aria-hidden />
                <div>
                  <p className="text-xs text-muted">Похожий готовый проект</p>
                  <p className="font-display text-xl">{matchedProject.name}</p>
                  <p className="text-sm text-muted">
                    {matchedProject.specs.area} м² · {formatPrice(matchedProject.price)}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/catalog/${matchedProject.slug}`}>
                  Смотреть проект
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <section id="planner-lead" className="border-t border-graphite/10 pt-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="label-caps">Проект у проектировщика</p>
            <h2 className="heading-section mt-2">Нужна точная планировка?</h2>
            <p className="mt-4 text-muted">
              Схему можно двигать и подстроить под себя. Архитектор артели подготовит рабочий
              проект с учётом участка, геологии и выбранной комплектации — с понятной сметой по
              этапам.
            </p>
          </div>
          <LeadForm
            id="planner-lead-form"
            title="Заказать проектирование"
            subtitle="Ваши площади комнат и раскладка попадут в заявку"
            source="planner"
            prefilledArea={String(input.area)}
            prefilledComment={leadComment}
          />
        </div>
      </section>
    </div>
  );
}

function ParamsPanel({
  input,
  setInput,
}: {
  input: ReturnType<typeof usePlannerEditor>["input"];
  setInput: ReturnType<typeof usePlannerEditor>["setInput"];
}) {
  return (
    <>
      <div>
        <Label>Площадь дома: {input.area} м²</Label>
        <Slider
          className="mt-3"
          min={80}
          max={280}
          step={5}
          value={[input.area]}
          onValueChange={([v]) => setInput({ ...input, area: v })}
        />
        <p className="mt-2 text-xs text-muted">
          При смене этажности или числа комнат раскладка пересчитается заново.
        </p>
      </div>

      <div>
        <Label>Этажность</Label>
        <div className="mt-2 flex gap-2">
          {([1, 2] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setInput({ ...input, floors: f })}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-sm border px-4 py-3 text-sm transition",
                input.floors === f
                  ? "border-graphite bg-graphite text-background"
                  : "border-graphite/15 hover:border-graphite/40",
              )}
            >
              <Layers className="h-4 w-4" aria-hidden />
              {f === 1 ? "1 этаж" : "2 этажа"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Спален: {input.bedrooms}</Label>
        <Slider
          className="mt-3"
          min={1}
          max={5}
          step={1}
          value={[input.bedrooms]}
          onValueChange={([v]) => setInput({ ...input, bedrooms: v })}
        />
      </div>

      <div>
        <Label>Санузлов: {input.bathrooms}</Label>
        <Slider
          className="mt-3"
          min={1}
          max={3}
          step={1}
          value={[input.bathrooms]}
          onValueChange={([v]) => setInput({ ...input, bathrooms: v })}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Toggle
          label="Гараж"
          pressed={input.hasGarage}
          onPressedChange={(hasGarage) => setInput({ ...input, hasGarage })}
        />
        <Toggle
          label="Терраса"
          pressed={input.hasTerrace}
          onPressedChange={(hasTerrace) => setInput({ ...input, hasTerrace })}
        />
      </div>

      <div>
        <Label>Тип раскладки</Label>
        <div className="mt-2 flex gap-2">
          {(
            [
              { id: "classic", label: "Классическая" },
              { id: "linear", label: "Линейная" },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() =>
                setInput({ ...input, layoutVariant: v.id as PlannerLayoutVariant })
              }
              className={cn(
                "flex-1 rounded-sm border px-3 py-2 text-xs transition",
                (input.layoutVariant ?? "classic") === v.id
                  ? "border-graphite bg-graphite text-background"
                  : "border-graphite/15 hover:border-graphite/40",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Материал</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {materials.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setInput({ ...input, material: m })}
              className={cn(
                "rounded-sm border px-3 py-2 text-xs capitalize transition",
                input.material === m
                  ? "border-graphite bg-graphite text-background"
                  : "border-graphite/15 hover:border-graphite/40",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Комплектация</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {finishOptions.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setInput({ ...input, finish: f })}
              className={cn(
                "rounded-sm border px-3 py-2 text-xs transition",
                input.finish === f
                  ? "border-graphite bg-graphite text-background"
                  : "border-graphite/15 hover:border-graphite/40",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Toggle({
  label,
  pressed,
  onPressedChange,
}: {
  label: string;
  pressed: boolean;
  onPressedChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "rounded-sm border px-4 py-2 text-sm transition",
        pressed
          ? "border-graphite bg-graphite text-background"
          : "border-graphite/15 hover:border-graphite/40",
      )}
    >
      {label}
    </button>
  );
}
