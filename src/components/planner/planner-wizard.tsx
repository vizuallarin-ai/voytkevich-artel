"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PlannerCanvas } from "@/components/planner/planner-canvas";
import { RoomEditorPanel } from "@/components/planner/room-editor-panel";
import { AreaSummaryPanel } from "@/components/planner/area-summary";
import { PlannerVisualScheme } from "@/components/planner/planner-visual-scheme";
import { PlannerRecommendations } from "@/components/planner/planner-recommendations";
import { PlannerRelatedProjects } from "@/components/planner/planner-related-projects";
import { PlannerLeadSection } from "@/components/planner/planner-lead-section";
import { PlannerRoomListEditor } from "@/components/planner/planner-room-list-editor";
import { PlannerStickySummary } from "@/components/planner/planner-sticky-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usePlannerEditor } from "@/hooks/use-planner-editor";
import { plannerSteps } from "@/data/planner-copy";
import { projects } from "@/data/projects";
import {
  DEFAULT_PLANNER_DRAFT,
  PLANNER_AREA_MAX,
  PLANNER_AREA_MIN,
  PLANNER_AREA_STEP,
  PRIORITY_LABELS,
  LAND_LABELS,
  addRoomToDraft,
  buildAreaSummaryForDraft,
  buildPlannerCalculatorUrl,
  buildRecommendationsForDraft,
  clearPlannerDraft,
  getEffectiveRooms,
  loadPlannerDraft,
  roomAreasToPlannerItems,
  savePlannerDraft,
  syncInputFromRooms,
  type PlannerDraft,
} from "@/lib/planner";
import { findPlannerProjects } from "@/lib/planner-area";
import { trackPlannerEvent } from "@/lib/planner-analytics";
import { createRoomId, type PlannerRoomType } from "@/lib/planner-rooms";
import {
  PLANNER_SCENARIOS,
  getScenarioById,
  scenarioToInput,
  type PlannerScenarioId,
} from "@/lib/planner-scenarios";
import { calculateEstimate, CALCULATOR_MATERIALS, formatPriceRange } from "@/lib/calculator";
import { cn } from "@/lib/utils";
import type { Material } from "@/types";

const materials: Material[] = [...CALCULATOR_MATERIALS];

function plannerNextLabel(step: number): string {
  switch (step) {
    case 1:
      return "Настроить планировку";
    case 2:
      return "Посмотреть схему";
    case 3:
      return "К итогу и расчёту";
    case 4:
      return "К заявке";
    default:
      return "Далее";
  }
}

export function PlannerWizard() {
  const [draft, setDraft] = useState<PlannerDraft>(DEFAULT_PLANNER_DRAFT);
  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const startedRef = useRef(false);
  const editor = usePlannerEditor(draft.input);

  useEffect(() => {
    const saved = loadPlannerDraft();
    const frameId = requestAnimationFrame(() => {
      if (saved) {
        setDraft(saved);
        editor.setInput(saved.input);
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [editor]);

  useEffect(() => {
    if (!startedRef.current && hydrated) {
      startedRef.current = true;
      trackPlannerEvent("planner_started");
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    savePlannerDraft({ ...draft, input: editor.input });
  }, [draft, editor.input, hydrated]);

  const effectiveRooms = useMemo(
    () => getEffectiveRooms(draft, editor.roomAreas),
    [draft, editor.roomAreas],
  );

  const summary = useMemo(
    () => buildAreaSummaryForDraft(draft, editor.roomAreas),
    [draft, editor.roomAreas],
  );

  const recommendations = useMemo(
    () => buildRecommendationsForDraft(draft, summary, editor.roomAreas),
    [draft, summary, editor.roomAreas],
  );

  const relatedProjects = useMemo(
    () =>
      findPlannerProjects(draft.targetArea, draft.input.floors, projects, {
        hasTerrace: draft.input.hasTerrace,
        hasGarage: draft.input.hasGarage,
        hasCabinet: effectiveRooms.some((r) => r.type === "office"),
      }, 6),
    [draft, effectiveRooms],
  );

  const estimate = useMemo(
    () =>
      calculateEstimate({
        area: draft.targetArea,
        floors: draft.input.floors,
        material: draft.input.material,
        purpose: "постоянное",
        bedrooms: Math.min(4, draft.input.bedrooms) as 1 | 2 | 3 | 4,
        bathrooms: Math.min(3, draft.input.bathrooms) as 1 | 2 | 3,
        foundation: "не_знаю",
        packageType: draft.input.finish === "коробка" ? "коробка" : draft.input.finish === "предчистовая" ? "предчистовая" : "под ключ",
        hasLand: draft.hasLand,
        landLocation: draft.landLocation,
        geology: "не_знаю",
        access: "не_знаю",
        communications: [],
        slope: draft.landSlope,
        additionalOptions: [],
      }),
    [draft],
  );

  const calcUrl = useMemo(() => buildPlannerCalculatorUrl({ ...draft, input: editor.input }), [draft, editor.input]);

  const patchDraft = useCallback((partial: Partial<PlannerDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const applyScenario = (id: PlannerScenarioId) => {
    const scenario = getScenarioById(id);
    if (!scenario) return;
    const input = scenarioToInput(scenario);
    const rooms = scenario.rooms.map((r, i) => ({
      ...r,
      id: createRoomId(r.type, i + 1),
    }));
    editor.setInput(input);
    setDraft((prev) => ({
      ...prev,
      scenario: id,
      targetArea: input.area,
      residents: scenario.residents,
      input,
      customRooms: rooms,
    }));
    trackPlannerEvent("planner_scenario_selected", { scenario: id, targetArea: input.area });
  };

  const updateRoom = (id: string, patch: Partial<(typeof effectiveRooms)[0]>) => {
    setDraft((prev) => {
      const customRooms =
        prev.customRooms.length > 0
          ? prev.customRooms
          : roomAreasToPlannerItems(editor.roomAreas);
      return {
        ...prev,
        customRooms: customRooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    });
    if (patch.area !== undefined) {
      editor.updateRoomArea(id, patch.area);
      trackPlannerEvent("planner_area_changed", { totalArea: summary.totalArea });
    }
  };

  const removeRoom = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      customRooms: prev.customRooms.filter((r) => r.id !== id),
    }));
    trackPlannerEvent("planner_room_removed");
  };

  const addRoom = (type: PlannerRoomType) => {
    setDraft((prev) => {
      const base =
        prev.customRooms.length > 0
          ? prev
          : { ...prev, customRooms: roomAreasToPlannerItems(editor.roomAreas) };
      const next = addRoomToDraft(base, type, editor.input.floors === 2 ? 2 : 1);
      const synced = syncInputFromRooms(next.input, next.customRooms);
      editor.setInput(synced);
      return { ...next, input: synced };
    });
    trackPlannerEvent("planner_room_added");
  };

  const resetAll = () => {
    clearPlannerDraft();
    setDraft(DEFAULT_PLANNER_DRAFT);
    editor.setInput(DEFAULT_PLANNER_DRAFT.input);
    setStep(1);
    trackPlannerEvent("planner_reset");
  };

  const goNext = () => {
    const next = Math.min(step + 1, 5);
    if (next >= 4) {
      trackPlannerEvent("planner_recommendations_viewed", {
        totalArea: summary.totalArea,
        scenario: draft.scenario,
      });
    }
    trackPlannerEvent("planner_step_completed", {
      totalArea: summary.totalArea,
      scenario: draft.scenario ?? undefined,
    });
    setStep(next);
  };

  const roomsForEditor =
    draft.customRooms.length > 0
      ? draft.customRooms
      : roomAreasToPlannerItems(editor.roomAreas);

  const floorLabel = editor.floorPlans[editor.floorIdx]?.label ?? "Этаж";
  const progress = (step / plannerSteps.length) * 100;
  const showSticky = step >= 4;

  return (
    <div id="planner-wizard" className="scroll-mt-28 pb-28 lg:pb-20">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {plannerSteps.map((s) => (
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
          <div className="h-full bg-graphite transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 1 && (
        <section aria-labelledby="scenario-title">
          <h2 id="scenario-title" className="font-display text-xl">
            Выберите сценарий будущего дома
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PLANNER_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => applyScenario(scenario.id)}
                className={cn(
                  "rounded-sm border p-5 text-left transition",
                  draft.scenario === scenario.id
                    ? "border-graphite bg-sand/60"
                    : "border-graphite/10 hover:border-graphite/30",
                )}
              >
                <p className="font-medium">{scenario.title}</p>
                <p className="mt-2 text-sm text-muted">{scenario.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-8" aria-labelledby="base-params-title">
          <h2 id="base-params-title" className="font-display text-xl">
            Базовые параметры
          </h2>

          <div>
            <Label>Площадь-ориентир: {draft.targetArea} м²</Label>
            <Slider
              className="mt-3"
              min={PLANNER_AREA_MIN}
              max={PLANNER_AREA_MAX}
              step={PLANNER_AREA_STEP}
              value={[draft.targetArea]}
              onValueChange={([v]) => {
                patchDraft({ targetArea: v });
                editor.setInput({ ...editor.input, area: v });
              }}
            />
            <p className="mt-2 text-xs text-muted">
              Фактическая сумма помещений может отличаться — планировщик покажет расхождение.
            </p>
          </div>

          <div>
            <Label>Этажность</Label>
            <div className="mt-2 flex gap-2">
              {([1, 2] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => editor.setInput({ ...editor.input, floors: f })}
                  className={cn(
                    "flex-1 rounded-sm border px-4 py-3 text-sm",
                    editor.input.floors === f
                      ? "border-graphite bg-graphite text-background"
                      : "border-graphite/15",
                  )}
                >
                  {f} этаж
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Количество жильцов</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["1-2", "3-4", "5+"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => patchDraft({ residents: r })}
                  className={cn(
                    "rounded-sm border px-3 py-2 text-sm",
                    draft.residents === r
                      ? "border-graphite bg-graphite text-background"
                      : "border-graphite/15",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Есть ли участок?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(LAND_LABELS) as (keyof typeof LAND_LABELS)[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => patchDraft({ hasLand: k })}
                  className={cn(
                    "rounded-sm border px-3 py-2 text-xs",
                    draft.hasLand === k
                      ? "border-graphite bg-graphite text-background"
                      : "border-graphite/15",
                  )}
                >
                  {LAND_LABELS[k]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="land-loc">Населённый пункт / район</Label>
            <Input
              id="land-loc"
              className="mt-2"
              value={draft.landLocation}
              onChange={(e) => patchDraft({ landLocation: e.target.value })}
              placeholder="Иркутск, область, посёлок"
            />
          </div>

          <div>
            <Label>Приоритет</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(PRIORITY_LABELS) as (keyof typeof PRIORITY_LABELS)[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => patchDraft({ priority: k })}
                  className={cn(
                    "rounded-sm border px-3 py-2 text-xs",
                    draft.priority === k
                      ? "border-graphite bg-graphite text-background"
                      : "border-graphite/15",
                  )}
                >
                  {PRIORITY_LABELS[k]}
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
                  onClick={() => editor.setInput({ ...editor.input, material: m })}
                  className={cn(
                    "rounded-sm border px-3 py-2 text-xs capitalize",
                    editor.input.material === m
                      ? "border-graphite bg-graphite text-background"
                      : "border-graphite/15",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <div className="space-y-10">
          <PlannerRoomListEditor
            rooms={roomsForEditor}
            onChange={updateRoom}
            onAdd={addRoom}
            onRemove={removeRoom}
          />
          <PlannerVisualScheme rooms={roomsForEditor} />
          <div className="grid gap-8 lg:grid-cols-2">
            <PlannerCanvas
              plans={editor.floorPlans}
              floorIdx={editor.floorIdx}
              onFloorChange={editor.setFloorIdx}
              roomsOnFloor={editor.roomsOnFloor}
              selectedId={editor.selectedId}
              onSelect={editor.setSelectedId}
              onMove={editor.moveRoom}
              twoFloors={editor.input.floors === 2}
            />
            <RoomEditorPanel
              rooms={editor.roomsOnFloor}
              selectedId={editor.selectedId}
              onSelect={editor.setSelectedId}
              onAreaChange={editor.updateRoomArea}
              onReset={editor.resetLayout}
              isCustomized={editor.isCustomized}
              floorLabel={floorLabel}
            />
          </div>
        </div>
      )}

      {step >= 4 && (
        <div className="space-y-12">
          <AreaSummaryPanel summary={summary} />
          <PlannerVisualScheme rooms={effectiveRooms} />
          <PlannerRecommendations items={recommendations} />
          <div className="rounded-sm border border-graphite/10 p-6">
            <p className="text-sm text-muted">Предварительный диапазон бюджета</p>
            <p className="mt-2 font-display text-2xl">
              {formatPriceRange(estimate.totalMin, estimate.totalMax)}
            </p>
            <Button asChild className="mt-4" size="lg">
              <Link
                href={calcUrl}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem(
                      "planner-calc-context",
                      JSON.stringify({ rooms: effectiveRooms, scenario: draft.scenario }),
                    );
                  }
                  trackPlannerEvent("planner_calculator_clicked", {
                    targetArea: draft.targetArea,
                    totalArea: summary.totalArea,
                  });
                }}
              >
                Рассчитать стоимость этой планировки
              </Link>
            </Button>
          </div>
          <PlannerRelatedProjects projects={relatedProjects} draft={{ ...draft, input: editor.input }} />
        </div>
      )}

      {step >= 4 && (
        <PlannerLeadSection
          draft={{ ...draft, input: editor.input }}
          summary={summary}
          recommendations={recommendations}
          relatedSlugs={relatedProjects.map((p) => p.slug)}
          roomAreas={editor.roomAreas}
          customized={editor.isCustomized || draft.customRooms.length > 0}
          calculatorTotal={estimate.totalMin}
        />
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
            Назад
          </Button>
        )}
        {step < 5 && (
          <Button type="button" onClick={goNext} disabled={step === 1 && !draft.scenario}>
            {plannerNextLabel(step)}
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={resetAll}>
          Сбросить планировку
        </Button>
      </div>

      <PlannerStickySummary draft={{ ...draft, input: editor.input }} summary={summary} visible={showSticky} />
    </div>
  );
}
