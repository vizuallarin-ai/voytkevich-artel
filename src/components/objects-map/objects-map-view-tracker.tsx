"use client";

import { useEffect } from "react";
import { trackObjectsMapEvent } from "@/lib/built-objects";

export function ObjectsMapViewTracker({ path }: { path: string }) {
  useEffect(() => {
    trackObjectsMapEvent("objects_map_viewed", { currentUrl: path });
  }, [path]);
  return null;
}
