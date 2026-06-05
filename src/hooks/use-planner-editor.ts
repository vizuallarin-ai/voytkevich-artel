"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { calculateHouseCost } from "@/lib/calculator";
import { findTopMatchingProjects } from "@/lib/find-matching-project";
import {
  createLayoutFromInput,
  layoutToFloorPlans,
  moveLayoutRoom,
  plannerLayoutKey,
  updateLayoutRoomArea,
  type LayoutRoom,
} from "@/lib/planner-layout";
import { computeRoomAreas } from "@/lib/plan-rules";
import type { PlannerInput, PlannerRoomArea } from "@/types";

export function usePlannerEditor(initialInput: PlannerInput) {
  const [input, setInput] = useState(initialInput);
  const [layoutRooms, setLayoutRooms] = useState<LayoutRoom[]>(() =>
    createLayoutFromInput(initialInput),
  );
  const [floorIdx, setFloorIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCustomized, setIsCustomized] = useState(false);

  const layoutKey = plannerLayoutKey(input);

  useEffect(() => {
    setLayoutRooms(createLayoutFromInput(input));
    setIsCustomized(false);
    setSelectedId(null);
    setFloorIdx(0);
  }, [layoutKey]);

  const floorPlans = useMemo(
    () => layoutToFloorPlans(layoutRooms, input),
    [layoutRooms, input],
  );

  const safeFloorIdx = useMemo(() => {
    if (floorPlans.length === 0) return 0;
    return Math.min(floorIdx, floorPlans.length - 1);
  }, [floorIdx, floorPlans.length]);

  useLayoutEffect(() => {
    if (floorIdx !== safeFloorIdx) setFloorIdx(safeFloorIdx);
  }, [floorIdx, safeFloorIdx]);

  useEffect(() => {
    setFloorIdx(0);
  }, [input.floors]);

  const roomAreas: PlannerRoomArea[] = useMemo(
    () =>
      layoutRooms
        .filter((r) => r.id !== "stairs")
        .map(({ id, name, area, floor }) => ({ id, name, area, floor })),
    [layoutRooms],
  );

  const calculator = useMemo(
    () =>
      calculateHouseCost({
        area: input.area,
        floors: input.floors,
        material: input.material,
        foundation: input.area > 180 ? "плита" : "ленточный",
        finish: input.finish,
        utilities: true,
        plotPrep: false,
      }),
    [input],
  );

  const matchedProjects = useMemo(() => findTopMatchingProjects(input, 3), [input]);
  const matchedProject = matchedProjects[0] ?? null;

  const totalRoomsArea = roomAreas.reduce((s, r) => s + r.area, 0);
  const areaDelta = input.area > 0 ? Math.round((totalRoomsArea / input.area) * 100) : 100;

  const currentFloor = floorPlans[safeFloorIdx]?.floor ?? 1;
  const roomsOnFloor = layoutRooms.filter((r) => r.floor === currentFloor);

  const updateRoomArea = useCallback((id: string, area: number) => {
    setLayoutRooms((prev) => updateLayoutRoomArea(prev, currentFloor, id, area));
    setIsCustomized(true);
  }, [currentFloor]);

  const moveRoom = useCallback((id: string, x: number, y: number) => {
    setLayoutRooms((prev) => moveLayoutRoom(prev, currentFloor, id, x, y));
    setIsCustomized(true);
  }, [currentFloor]);

  const resetLayout = useCallback(() => {
    setLayoutRooms(createLayoutFromInput(input));
    setIsCustomized(false);
    setSelectedId(null);
  }, [input]);

  return {
    input,
    setInput,
    floorPlans,
    floorIdx: safeFloorIdx,
    setFloorIdx,
    layoutRooms,
    roomsOnFloor,
    roomAreas,
    calculator,
    matchedProject,
    matchedProjects,
    totalRoomsArea,
    areaDelta,
    selectedId,
    setSelectedId,
    isCustomized,
    updateRoomArea,
    moveRoom,
    resetLayout,
    autoRoomAreas: computeRoomAreas(input),
  };
}
