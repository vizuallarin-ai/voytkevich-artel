import { NextResponse } from "next/server";
import { calendarRepository } from "@/lib/content-calendar/calendar-repository";
import { trackContentCalendarModeChanged } from "@/lib/content-calendar/calendar-analytics";

export async function GET() {
  return NextResponse.json({ settings: calendarRepository.getSettings() });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const prev = calendarRepository.getSettings();
    const settings = calendarRepository.updateSettings(body);
    if (body.mode && body.mode !== prev.mode) {
      trackContentCalendarModeChanged({ scheduleMode: settings.mode });
    }
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
