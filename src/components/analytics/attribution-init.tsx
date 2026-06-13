"use client";

import { useEffect } from "react";
import { initAttribution } from "@/lib/analytics/utm";
import { incrementPagesViewed } from "@/lib/analytics/session";

export function AttributionInit() {
  useEffect(() => {
    initAttribution();
    incrementPagesViewed();
  }, []);
  return null;
}
