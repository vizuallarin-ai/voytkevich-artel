import { NextResponse } from "next/server";
import { priorityService } from "@/lib/content-prioritization/priority-service";

export async function GET() {
  const queue = await priorityService.getQueue();
  return NextResponse.json({ queue });
}
