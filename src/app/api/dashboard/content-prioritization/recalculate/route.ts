import { NextResponse } from "next/server";
import { priorityService } from "@/lib/content-prioritization/priority-service";

export async function POST() {
  const count = await priorityService.recalculateAll();
  return NextResponse.json({ recalculated: count });
}
