import { NextResponse } from "next/server";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";

export async function GET() {
  const metrics = await calendarRepository.getMetrics();
  return NextResponse.json({ metrics });
}
