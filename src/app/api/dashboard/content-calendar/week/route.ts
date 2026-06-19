import { NextResponse } from "next/server";
import { calendarService } from "@/lib/content-calendar/calendar-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  if (!start) {
    return NextResponse.json({ error: "start required" }, { status: 400 });
  }
  const data = await calendarService.getWeekData(start);
  return NextResponse.json(data);
}
